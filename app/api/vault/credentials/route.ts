import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserContext,
  canUserManageCredentials,
} from "@/lib/crypto/vault-auth";
import { encryptSecretServer } from "@/lib/crypto/vault-server";
import { CredentialFormData, CREDENTIAL_TYPES_LIST } from "@/types/credential";

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB limit

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce payload size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Payload exceeds size limit (64KB)." },
        { status: 413 }
      );
    }

    // 2. Resolve authoritative server auth
    const authResult = await getAuthenticatedUserContext();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { context } = authResult;

    // 3. Enforce write authorization (Admin & Manager only)
    if (!canUserManageCredentials(context)) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators and Managers can create credentials." },
        { status: 403 }
      );
    }

    // 4. Validate input JSON safely
    let body: CredentialFormData;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { project_id, name, credential_type, url, username, password, notes, custom_fields } = body;

    if (!project_id || typeof project_id !== "string") {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Credential name is required." }, { status: 400 });
    }
    if (!credential_type || !CREDENTIAL_TYPES_LIST.includes(credential_type as any)) {
      return NextResponse.json({ error: "Invalid credential type." }, { status: 400 });
    }

    // 5. Encrypt password server-side with envelope encryption
    let encryptedPassword = "";
    if (password && typeof password === "string" && password.trim()) {
      encryptedPassword = encryptSecretServer(password.trim());
    }

    // 6. Encrypt sensitive custom fields server-side
    const processedFields = (custom_fields || []).map((field) => {
      let val = field.field_value || "";
      if (field.is_sensitive && val) {
        val = encryptSecretServer(val);
      }
      return {
        field_name: String(field.field_name || "").trim(),
        field_value: val,
        is_sensitive: Boolean(field.is_sensitive),
      };
    });

    // 7. Persist to Supabase using authenticated context (governed by DB RLS)
    const { data: credRow, error: credErr } = await context.supabase
      .from("project_credentials")
      .insert({
        project_id,
        name: name.trim(),
        credential_type,
        url: url?.trim() || null,
        username: username?.trim() || null,
        encrypted_password: encryptedPassword || null,
        notes: notes?.trim() || null,
        created_by: context.userId,
      })
      .select()
      .single();

    if (credErr || !credRow) {
      console.error("Supabase insert error:", credErr?.message);
      return NextResponse.json(
        { error: "Database error creating credential." },
        { status: 500 }
      );
    }

    const credId = credRow.id;

    // 8. Insert custom fields if provided
    if (processedFields.length > 0) {
      const toInsert = processedFields.map((f) => ({
        credential_id: credId,
        field_name: f.field_name,
        field_value: f.field_value,
        is_sensitive: f.is_sensitive,
      }));

      await context.supabase.from("credential_custom_fields").insert(toInsert);
    }

    // 9. Immutable audit log: Created (never log plaintext or password)
    await context.supabase.from("credential_activity_logs").insert({
      credential_id: credId,
      user_id: context.userId,
      user_name: context.fullName,
      action: "Created",
    });

    return NextResponse.json({
      success: true,
      credential: {
        id: credId,
        project_id: credRow.project_id,
        name: credRow.name,
        credential_type: credRow.credential_type,
      },
    });
  } catch (err: any) {
    console.error("API error creating credential:", err?.message || err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
