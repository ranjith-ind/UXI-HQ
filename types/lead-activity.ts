export type LeadActivityType =
  | "Note"
  | "Call"
  | "WhatsApp"
  | "Email"
  | "Meeting"
  | "Follow Up"
  | "Status Change"
  | "Proposal Sent"
  | "Requirement Update"
  | "Other";

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: LeadActivityType;
  title: string;
  description?: string | null;
  activity_date: string;
  created_by?: string | null;
  created_at: string;
}

export interface LeadActivityFormData {
  activity_type: LeadActivityType;
  title: string;
  description?: string;
  activity_date?: string;
}

export const LEAD_ACTIVITY_TYPES_LIST: LeadActivityType[] = [
  "Note",
  "Call",
  "WhatsApp",
  "Email",
  "Meeting",
  "Follow Up",
  "Status Change",
  "Proposal Sent",
  "Requirement Update",
  "Other",
];
