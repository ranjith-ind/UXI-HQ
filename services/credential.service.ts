import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ProjectCredential,
  CredentialCustomField,
  CredentialActivityLog,
  CredentialFormData,
  CredentialType,
} from "@/types/credential";

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
   * Fetch metadata listings of credentials.
   * Note: Sensitive passwords remain encrypted envelopes through this boundary.
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
   * Request decryption of a secret from the trusted server route.
   * Authorization is verified server-side against database roles and project membership.
   */
  static async revealSecret(params: {
    credentialId: string;
    fieldType: "password" | "custom_field";
    customFieldId?: string;
    action?: "Viewed" | "Copied";
  }): Promise<{ success: boolean; plaintext?: string; error?: string }> {
    try {
      const response = await fetch("/api/vault/credentials/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential_id: params.credentialId,
          field_type: params.fieldType,
          custom_field_id: params.customFieldId,
          action: params.action || "Viewed",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Access denied or decryption failed.",
        };
      }

      return { success: true, plaintext: data.plaintext };
    } catch (err: any) {
      console.error("Error calling reveal API:", err);
      return { success: false, error: "Network or server error." };
    }
  }

  /**
   * Create a new credential via trusted server-side envelope encryption.
   */
  static async createCredential(
    data: CredentialFormData,
    actorName: string
  ): Promise<{ success: boolean; credential?: ProjectCredential; error?: string }> {
    try {
      if (isSupabaseConfigured()) {
        const response = await fetch("/api/vault/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          return {
            success: false,
            error: resData.error || "Failed to create credential on server.",
          };
        }

        const created = await this.getCredentialById(resData.credential.id);
        return { success: true, credential: created || undefined };
      } else {
        // Local offline fallback
        const credId = "cred-" + Math.random().toString(36).substring(2, 9);
        const newCred: ProjectCredential = {
          id: credId,
          project_id: data.project_id,
          name: data.name.trim(),
          credential_type: data.credential_type,
          url: data.url?.trim() || null,
          username: data.username?.trim() || null,
          encrypted_password: data.password || null,
          notes: data.notes?.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const creds = this.getLocalCredentials();
        creds.unshift(newCred);
        this.saveLocalCredentials(creds);

        await this.logActivity(credId, "Created", actorName);
        return { success: true, credential: newCred };
      }
    } catch (err: any) {
      console.error("createCredential exception:", err);
      return { success: false, error: err.message || "Failed to create credential" };
    }
  }

  /**
   * Update an existing credential via trusted server route.
   */
  static async updateCredential(
    id: string,
    data: Partial<CredentialFormData>,
    actorName: string
  ): Promise<{ success: boolean; credential?: ProjectCredential; error?: string }> {
    try {
      if (isSupabaseConfigured()) {
        const response = await fetch(`/api/vault/credentials/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          return {
            success: false,
            error: resData.error || "Failed to update credential on server.",
          };
        }

        const updated = await this.getCredentialById(id);
        return { success: true, credential: updated || undefined };
      } else {
        const creds = this.getLocalCredentials();
        const idx = creds.findIndex((c) => c.id === id);
        if (idx === -1) return { success: false, error: "Credential not found" };

        creds[idx] = {
          ...creds[idx],
          name: data.name || creds[idx].name,
          updated_at: new Date().toISOString(),
        };
        this.saveLocalCredentials(creds);

        await this.logActivity(id, "Updated", actorName);
        return { success: true, credential: creds[idx] };
      }
    } catch (err: any) {
      console.error("updateCredential exception:", err);
      return { success: false, error: err.message || "Failed to update credential" };
    }
  }

  /**
   * Delete a credential via trusted server route.
   */
  static async deleteCredential(
    id: string,
    actorName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (isSupabaseConfigured()) {
        const response = await fetch(`/api/vault/credentials/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          return {
            success: false,
            error: resData.error || "Failed to delete credential on server.",
          };
        }

        return { success: true };
      } else {
        const creds = this.getLocalCredentials().filter((c) => c.id !== id);
        this.saveLocalCredentials(creds);
        await this.logActivity(id, "Deleted", actorName);
        return { success: true };
      }
    } catch (err: any) {
      console.error("deleteCredential exception:", err);
      return { success: false, error: err.message || "Failed to delete credential" };
    }
  }
}
