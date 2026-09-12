import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserContext,
  canUserManageCredentials,
} from "@/lib/crypto/vault-auth";
import { encryptSecretServer } from "@/lib/crypto/vault-server";
import { CredentialFormData, CREDENTIAL_TYPES_LIST } from "@/types/credential";

const MAX_PAYLOAD_BYTES = 64 * 1024;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing credential ID." }, { status: 400 });
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Payload exceeds size limit (64KB)." },
        { status: 413 }
      );
    }

    const authResult = await getAuthenticatedUserContext();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { context } = authResult;

    if (!canUserManageCredentials(context)) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators and Managers can edit credentials." },
        { status: 403 }
      );
    }

    let body: Partial<CredentialFormData>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_by: context.userId,
      updated_at: new Date().toISOString(),
    };

    if (body.project_id) updates.project_id = body.project_id;
    if (body.name) updates.name = body.name.trim();
    if (body.credential_type && CREDENTIAL_TYPES_LIST.includes(body.credential_type)) {
      updates.credential_type = body.credential_type;
    }
    if (body.url !== undefined) updates.url = body.url?.trim() || null;
    if (body.username !== undefined) updates.username = body.username?.trim() || null;
    if (body.notes !== undefined) updates.notes = body.notes?.trim() || null;

    // Encrypt updated password if supplied
    if (body.password && typeof body.password === "string" && body.password.trim()) {
      updates.encrypted_password = encryptSecretServer(body.password.trim());
    }

    const { error: updateErr } = await context.supabase
      .from("project_credentials")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      console.error("Supabase update error:", updateErr.message);
      return NextResponse.json(
        { error: "Database error updating credential." },
        { status: 500 }
      );
    }

    // Replace custom fields if provided
    if (body.custom_fields) {
      await context.supabase
        .from("credential_custom_fields")
        .delete()
        .eq("credential_id", id);

      const processedFields = body.custom_fields.map((field) => {
        let val = field.field_value || "";
        if (field.is_sensitive && val) {
          val = encryptSecretServer(val);
        }
        return {
          credential_id: id,
          field_name: String(field.field_name || "").trim(),
          field_value: val,
          is_sensitive: Boolean(field.is_sensitive),
        };
      });

      if (processedFields.length > 0) {
        await context.supabase.from("credential_custom_fields").insert(processedFields);
      }
    }

    // Audit log: Updated (never log secrets)
    await context.supabase.from("credential_activity_logs").insert({
      credential_id: id,
      user_id: context.userId,
      user_name: context.fullName,
      action: "Updated",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API error updating credential:", err?.message || err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing credential ID." }, { status: 400 });
    }

    const authResult = await getAuthenticatedUserContext();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { context } = authResult;

    if (!canUserManageCredentials(context)) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators and Managers can delete credentials." },
        { status: 403 }
      );
    }

    // Audit log: Deleted before deletion
    await context.supabase.from("credential_activity_logs").insert({
      credential_id: id,
      user_id: context.userId,
      user_name: context.fullName,
      action: "Deleted",
    });

    const { error: delErr } = await context.supabase
      .from("project_credentials")
      .delete()
      .eq("id", id);

    if (delErr) {
      console.error("Supabase delete error:", delErr.message);
      return NextResponse.json(
        { error: "Database error deleting credential." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API error deleting credential:", err?.message || err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
