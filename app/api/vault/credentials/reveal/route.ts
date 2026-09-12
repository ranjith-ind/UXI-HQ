import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserContext,
  canUserReadProject,
} from "@/lib/crypto/vault-auth";
import { decryptSecretServer } from "@/lib/crypto/vault-server";

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUserContext();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { context } = authResult;

    // Reject clients immediately
    if ((context.role as string) === "Client") {
      return NextResponse.json(
        { error: "Forbidden: Clients do not have access to credentials." },
        { status: 403 }
      );
    }

    let body: {
      credential_id: string;
      field_type: "password" | "custom_field";
      custom_field_id?: string;
      action?: "Viewed" | "Copied";
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { credential_id, field_type, custom_field_id, action = "Viewed" } = body;
    if (!credential_id || typeof credential_id !== "string") {
      return NextResponse.json({ error: "Credential ID is required." }, { status: 400 });
    }

    // 1. Authoritatively fetch the credential and its project association
    // (RLS ensures user can only see rows permitted by can_view_project_credentials)
    const { data: cred, error: credErr } = await context.supabase
      .from("project_credentials")
      .select("id, project_id, encrypted_password")
      .eq("id", credential_id)
      .single();

    if (credErr || !cred) {
      return NextResponse.json(
        { error: "Credential not found or access denied." },
        { status: 404 }
      );
    }

    // 2. Server-side check: enforce developer assigned project boundary
    const isAuthorized = await canUserReadProject(context, cred.project_id);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: You are not assigned to this project." },
        { status: 403 }
      );
    }

    let cipherToDecrypt = "";

    if (field_type === "password") {
      cipherToDecrypt = cred.encrypted_password || "";
    } else if (field_type === "custom_field" && custom_field_id) {
      const { data: customField, error: cfErr } = await context.supabase
        .from("credential_custom_fields")
        .select("id, field_value, is_sensitive")
        .eq("id", custom_field_id)
        .eq("credential_id", credential_id)
        .single();

      if (cfErr || !customField) {
        return NextResponse.json({ error: "Custom field not found." }, { status: 404 });
      }

      cipherToDecrypt = customField.field_value || "";
    } else {
      return NextResponse.json({ error: "Invalid field specification." }, { status: 400 });
    }

    // 3. Decrypt using server-only envelope encryption
    let plaintext = "";
    if (cipherToDecrypt) {
      plaintext = decryptSecretServer(cipherToDecrypt);
    }

    // 4. Immutable audit log: Viewed or Copied (never log plaintext)
    const validAction = action === "Copied" ? "Copied" : "Viewed";
    await context.supabase.from("credential_activity_logs").insert({
      credential_id,
      user_id: context.userId,
      user_name: context.fullName,
      action: validAction,
    });

    // 5. Return plaintext exclusively to authenticated authorized caller
    return NextResponse.json({
      success: true,
      plaintext,
    });
  } catch (err: any) {
    console.error("API error revealing secret:", err?.message || err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
