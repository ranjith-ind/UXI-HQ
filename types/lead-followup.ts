export type FollowUpType =
  | "Call"
  | "WhatsApp"
  | "Email"
  | "Meeting"
  | "Other";

export type FollowUpStatus = "Pending" | "Completed" | "Missed" | "Cancelled";

export interface LeadFollowUp {
  id: string;
  lead_id: string;
  follow_up_date: string;
  follow_up_type: FollowUpType;
  notes?: string | null;
  status: FollowUpStatus;
  completed_at?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface LeadFollowUpWithDetails extends LeadFollowUp {
  lead_code: string;
  lead_name: string;
  company_name?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  lead_status: string;
  lead_priority: string;
  is_overdue: boolean;
  is_due_today: boolean;
}

export interface LeadFollowUpFormData {
  follow_up_date: string;
  follow_up_type: FollowUpType;
  notes?: string;
  status?: FollowUpStatus;
}

export const FOLLOW_UP_TYPES_LIST: FollowUpType[] = [
  "Call",
  "WhatsApp",
  "Email",
  "Meeting",
  "Other",
];

export const FOLLOW_UP_STATUS_LIST: FollowUpStatus[] = [
  "Pending",
  "Completed",
  "Missed",
  "Cancelled",
];
