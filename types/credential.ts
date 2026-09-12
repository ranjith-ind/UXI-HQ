export type CredentialType =
  | "Domain"
  | "Hosting"
  | "Database"
  | "Admin Panel"
  | "Cloudflare"
  | "GitHub"
  | "Vercel"
  | "API Key"
  | "Server / SSH"
  | "Other";

export const CREDENTIAL_TYPES_LIST: CredentialType[] = [
  "Domain",
  "Hosting",
  "Database",
  "Admin Panel",
  "Cloudflare",
  "GitHub",
  "Vercel",
  "API Key",
  "Server / SSH",
  "Other",
];

export interface CredentialCustomField {
  id?: string;
  credential_id?: string;
  field_name: string;
  field_value: string;
  is_sensitive: boolean;
  created_at?: string;
}

export interface CredentialActivityLog {
  id: string;
  credential_id: string;
  user_id: string | null;
  user_name: string;
  action: "Created" | "Updated" | "Viewed" | "Copied" | "Deleted";
  created_at: string;
}

export interface ProjectCredential {
  id: string;
  project_id: string;
  name: string;
  credential_type: CredentialType;
  url?: string | null;
  username?: string | null;
  encrypted_password?: string | null;
  notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;

  // Joined / enriched relations
  project_name?: string;
  project_code?: string;
  client_company?: string;
  custom_fields?: CredentialCustomField[];
  activity_logs?: CredentialActivityLog[];
}

export interface CredentialFormData {
  project_id: string;
  name: string;
  credential_type: CredentialType;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  custom_fields?: Array<{
    field_name: string;
    field_value: string;
    is_sensitive: boolean;
  }>;
}
