export type ClientStatus = "Lead" | "Active" | "Inactive" | "Completed";

export type ClientSource =
  | "Referral"
  | "Instagram"
  | "WhatsApp"
  | "Website"
  | "LinkedIn"
  | "Direct Contact"
  | "Other";

export interface Client {
  id: string;
  full_name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  location?: string | null;
  website?: string | null;
  client_status: ClientStatus;
  source: ClientSource;
  notes?: string | null;
  avatar_url?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientWithDetails extends Client {
  projects_count: number;
  active_projects_count: number;
  total_project_value: number;
  total_paid: number;
  pending_amount: number;
  last_activity?: string;
}

export interface ClientFormData {
  full_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  location?: string;
  website?: string;
  client_status: ClientStatus;
  source: ClientSource;
  notes?: string;
  avatar_url?: string;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  leads: number;
  inactiveClients: number;
  completedClients: number;
}

export type ClientSortOption =
  | "recently_added"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "company_asc";
