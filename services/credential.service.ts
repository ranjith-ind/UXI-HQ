import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ProjectCredential,
  CredentialCustomField,
  CredentialActivityLog,
  CredentialFormData,
  CredentialType,
} from "@/types/credential";
import { encryptSecret } from "@/lib/crypto/vault-crypto";

const LOCAL_CREDENTIALS_KEY = "uxi_credentials_store";
const LOCAL_CUSTOM_FIELDS_KEY = "uxi_credential_custom_fields_store";
const LOCAL_ACTIVITY_LOGS_KEY = "uxi_credential_activity_logs_store";

export class CredentialService {
  // Local storage helpers for fallback
  private static getLocalCredentials(): ProjectCredential[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_CREDENTIALS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalCredentials(items: ProjectCredential[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_CREDENTIALS_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save local credentials:", err);
    }
  }

  private static getLocalCustomFields(): CredentialCustomField[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_CUSTOM_FIELDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalCustomFields(items: CredentialCustomField[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_CUSTOM_FIELDS_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save local custom fields:", err);
    }
  }

  private static getLocalActivityLogs(): CredentialActivityLog[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_ACTIVITY_LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalActivityLogs(items: CredentialActivityLog[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_ACTIVITY_LOGS_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save local activity logs:", err);
    }
  }

  /**
   * Log an audit action against a credential.
   */
  static async logActivity(
    credentialId: string,
    action: "Created" | "Updated" | "Viewed" | "Copied" | "Deleted",
    actorName: string
  ): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();

        await supabase.from("credential_activity_logs").insert({
          credential_id: credentialId,
          user_id: authData?.user?.id || null,
          user_name: actorName || "Team Member",
          action,
        });
      } else {
        const logs = this.getLocalActivityLogs();
        const newLog: CredentialActivityLog = {
          id: "log-" + Math.random().toString(36).substring(2, 9),
          credential_id: credentialId,
          user_id: null,
          user_name: actorName || "Team Member",
          action,
          created_at: new Date().toISOString(),
        };
        logs.unshift(newLog);
        this.saveLocalActivityLogs(logs);
      }
    } catch (err) {
      // Activity logging should not fail caller action
      console.warn("Failed to log credential activity:", err);
    }
  }

  /**
   * Fetch activity logs for a given credential.
   */
  static async getActivityLogs(credentialId: string): Promise<CredentialActivityLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("credential_activity_logs")
          .select("*")
          .eq("credential_id", credentialId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching credential activity logs:", error.message);
          return [];
        }
        return (data || []) as CredentialActivityLog[];
      } catch (err) {
        console.error("Supabase exception fetching activity logs:", err);
        return [];
      }
    }

    const local = this.getLocalActivityLogs();
    return local.filter((l) => l.credential_id === credentialId);
  }

  /**
   * Fetch credentials with optional filtering (projectId, credentialType, search).
   */
  static async getCredentials(filters?: {
    projectId?: string;
    credentialType?: CredentialType | "All";
    search?: string;
  }): Promise<ProjectCredential[]> {
    let credentials: ProjectCredential[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from("project_credentials")
          .select(
            `
            *,
            project:projects!inner (
              id,
              project_name,
              project_code,
              client:clients (
                company_name
              )
            ),
            custom_fields:credential_custom_fields (*)
          `
          )
          .order("created_at", { ascending: false });

        if (filters?.projectId) {
          query = query.eq("project_id", filters.projectId);
        }

        if (filters?.credentialType && filters.credentialType !== "All") {
          query = query.eq("credential_type", filters.credentialType);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching credentials:", error.message);
          return [];
        }

        // Map joined relation fields
        credentials = (data || []).map((row: any) => ({
          id: row.id,
          project_id: row.project_id,
          name: row.name,
          credential_type: row.credential_type as CredentialType,
          url: row.url,
          username: row.username,
          encrypted_password: row.encrypted_password,
          notes: row.notes,
          created_by: row.created_by,
          updated_by: row.updated_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          project_name: row.project?.project_name,
          project_code: row.project?.project_code,
          client_company: row.project?.client?.company_name,
          custom_fields: row.custom_fields || [],
        }));
      } catch (err) {
        console.error("Supabase exception fetching credentials:", err);
        credentials = this.getLocalCredentials();
      }
    } else {
      credentials = this.getLocalCredentials();
      const allFields = this.getLocalCustomFields();
      credentials = credentials.map((c) => ({
        ...c,
        custom_fields: allFields.filter((f) => f.credential_id === c.id),
      }));

      if (filters?.projectId) {
        credentials = credentials.filter((c) => c.project_id === filters.projectId);
      }
      if (filters?.credentialType && filters.credentialType !== "All") {
        credentials = credentials.filter((c) => c.credential_type === filters.credentialType);
      }
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      credentials = credentials.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.username && c.username.toLowerCase().includes(q)) ||
          (c.url && c.url.toLowerCase().includes(q)) ||
          (c.project_name && c.project_name.toLowerCase().includes(q)) ||
          (c.project_code && c.project_code.toLowerCase().includes(q))
      );
    }

    return credentials;
  }

  /**
   * Get a single credential by ID with custom fields.
   */
  static async getCredentialById(id: string): Promise<ProjectCredential | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("project_credentials")
          .select(
            `
            *,
            project:projects (
              id,
              project_name,
              project_code,
              client:clients (company_name)
            ),
            custom_fields:credential_custom_fields (*)
          `
          )
          .eq("id", id)
          .single();

        if (error || !data) return null;

        const row: any = data;
        return {
          id: row.id,
          project_id: row.project_id,
          name: row.name,
          credential_type: row.credential_type as CredentialType,
          url: row.url,
          username: row.username,
          encrypted_password: row.encrypted_password,
          notes: row.notes,
          created_by: row.created_by,
          updated_by: row.updated_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          project_name: row.project?.project_name,
          project_code: row.project?.project_code,
          client_company: row.project?.client?.company_name,
          custom_fields: row.custom_fields || [],
        };
      } catch (err) {
        console.error("Error fetching credential by id:", err);
      }
    }

    const local = this.getLocalCredentials().find((c) => c.id === id);
    if (!local) return null;
    const allFields = this.getLocalCustomFields();
    return {
      ...local,
      custom_fields: allFields.filter((f) => f.credential_id === id),
    };
  }

  /**
   * Create a new credential with client-side encrypted password and custom fields.
   */
  static async createCredential(
    data: CredentialFormData,
    actorName: string
  ): Promise<{ success: boolean; credential?: ProjectCredential; error?: string }> {
    try {
      // 1. Client-Side Encrypt password before sending
      let encryptedPassword = "";
      if (data.password && data.password.trim()) {
        encryptedPassword = await encryptSecret(data.password.trim());
      }

      // 2. Encrypt sensitive custom fields
      const processedFields = await Promise.all(
        (data.custom_fields || []).map(async (field) => {
          let val = field.field_value;
          if (field.is_sensitive && val) {
            val = await encryptSecret(val);
          }
          return {
            field_name: field.field_name,
            field_value: val,
            is_sensitive: field.is_sensitive,
          };
        })
      );

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();

        // Insert credential (let PostgreSQL generate UUID)
        const { data: credRow, error: credErr } = await supabase
          .from("project_credentials")
          .insert({
            project_id: data.project_id,
            name: data.name.trim(),
            credential_type: data.credential_type,
            url: data.url?.trim() || null,
            username: data.username?.trim() || null,
            encrypted_password: encryptedPassword || null,
            notes: data.notes?.trim() || null,
            created_by: authData?.user?.id || null,
          })
          .select()
          .single();

        if (credErr || !credRow) {
          console.error("Error creating credential in Supabase:", credErr?.message);
          return { success: false, error: credErr?.message || "Failed to create credential" };
        }

        const credId = credRow.id;

        // Insert custom fields if any
        if (processedFields.length > 0) {
          const fieldsToInsert = processedFields.map((f) => ({
            credential_id: credId,
            field_name: f.field_name,
            field_value: f.field_value,
            is_sensitive: f.is_sensitive,
          }));

          const { error: fieldErr } = await supabase
            .from("credential_custom_fields")
            .insert(fieldsToInsert);

          if (fieldErr) {
            console.warn("Could not insert custom fields:", fieldErr.message);
          }
        }

        // Audit log
        await this.logActivity(credId, "Created", actorName);

        const created = await this.getCredentialById(credId);
        return { success: true, credential: created || undefined };
      } else {
        // Fallback local storage
        const credId = "cred-" + Math.random().toString(36).substring(2, 9);
        const newCred: ProjectCredential = {
          id: credId,
          project_id: data.project_id,
          name: data.name.trim(),
          credential_type: data.credential_type,
          url: data.url?.trim() || null,
          username: data.username?.trim() || null,
          encrypted_password: encryptedPassword || null,
          notes: data.notes?.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const creds = this.getLocalCredentials();
        creds.unshift(newCred);
        this.saveLocalCredentials(creds);

        if (processedFields.length > 0) {
          const fields = this.getLocalCustomFields();
          for (const f of processedFields) {
            fields.push({
              id: "cf-" + Math.random().toString(36).substring(2, 9),
              credential_id: credId,
              field_name: f.field_name,
              field_value: f.field_value,
              is_sensitive: f.is_sensitive,
              created_at: new Date().toISOString(),
            });
          }
          this.saveLocalCustomFields(fields);
        }

        await this.logActivity(credId, "Created", actorName);
        return { success: true, credential: newCred };
      }
    } catch (err: any) {
      console.error("createCredential exception:", err);
      return { success: false, error: err.message || "Failed to create credential" };
    }
  }

  /**
   * Update an existing credential and its custom fields.
   */
  static async updateCredential(
    id: string,
    data: Partial<CredentialFormData>,
    actorName: string
  ): Promise<{ success: boolean; credential?: ProjectCredential; error?: string }> {
    try {
      const updates: any = {};
      if (data.project_id) updates.project_id = data.project_id;
      if (data.name) updates.name = data.name.trim();
      if (data.credential_type) updates.credential_type = data.credential_type;
      if (data.url !== undefined) updates.url = data.url?.trim() || null;
      if (data.username !== undefined) updates.username = data.username?.trim() || null;
      if (data.notes !== undefined) updates.notes = data.notes?.trim() || null;

      // If new password provided, encrypt it
      if (data.password && data.password.trim()) {
        updates.encrypted_password = await encryptSecret(data.password.trim());
      }

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        updates.updated_by = authData?.user?.id || null;
        updates.updated_at = new Date().toISOString();

        const { error: updateErr } = await supabase
          .from("project_credentials")
          .update(updates)
          .eq("id", id);

        if (updateErr) {
          console.error("Error updating credential:", updateErr.message);
          return { success: false, error: updateErr.message };
        }

        // If custom fields provided, replace them
        if (data.custom_fields) {
          await supabase.from("credential_custom_fields").delete().eq("credential_id", id);

          const processedFields = await Promise.all(
            data.custom_fields.map(async (field) => {
              let val = field.field_value;
              if (field.is_sensitive && val) {
                val = await encryptSecret(val);
              }
              return {
                credential_id: id,
                field_name: field.field_name,
                field_value: val,
                is_sensitive: field.is_sensitive,
              };
            })
          );

          if (processedFields.length > 0) {
            await supabase.from("credential_custom_fields").insert(processedFields);
          }
        }

        await this.logActivity(id, "Updated", actorName);

        const updated = await this.getCredentialById(id);
        return { success: true, credential: updated || undefined };
      } else {
        const creds = this.getLocalCredentials();
        const idx = creds.findIndex((c) => c.id === id);
        if (idx === -1) return { success: false, error: "Credential not found" };

        creds[idx] = {
          ...creds[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        this.saveLocalCredentials(creds);

        if (data.custom_fields) {
          let fields = this.getLocalCustomFields().filter((f) => f.credential_id !== id);
          for (const f of data.custom_fields) {
            let val = f.field_value;
            if (f.is_sensitive && val) {
              val = await encryptSecret(val);
            }
            fields.push({
              id: "cf-" + Math.random().toString(36).substring(2, 9),
              credential_id: id,
              field_name: f.field_name,
              field_value: val,
              is_sensitive: f.is_sensitive,
              created_at: new Date().toISOString(),
            });
          }
          this.saveLocalCustomFields(fields);
        }

        await this.logActivity(id, "Updated", actorName);
        return { success: true, credential: creds[idx] };
      }
    } catch (err: any) {
      console.error("updateCredential exception:", err);
      return { success: false, error: err.message || "Failed to update credential" };
    }
  }

  /**
   * Delete a credential and associated records.
   */
  static async deleteCredential(
    id: string,
    actorName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Log deletion before removing record
      await this.logActivity(id, "Deleted", actorName);

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.from("project_credentials").delete().eq("id", id);
        if (error) {
          console.error("Error deleting credential:", error.message);
          return { success: false, error: error.message };
        }
        return { success: true };
      } else {
        const creds = this.getLocalCredentials().filter((c) => c.id !== id);
        this.saveLocalCredentials(creds);

        const fields = this.getLocalCustomFields().filter((f) => f.credential_id !== id);
        this.saveLocalCustomFields(fields);

        const logs = this.getLocalActivityLogs().filter((l) => l.credential_id !== id);
        this.saveLocalActivityLogs(logs);

        return { success: true };
      }
    } catch (err: any) {
      console.error("deleteCredential exception:", err);
      return { success: false, error: err.message || "Failed to delete credential" };
    }
  }
}
