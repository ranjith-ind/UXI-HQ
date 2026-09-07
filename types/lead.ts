export type LeadSource =
  | "Website"
  | "Instagram"
  | "WhatsApp"
  | "Referral"
  | "LinkedIn"
  | "Direct Contact"
  | "Facebook"
  | "Email"
  | "Other";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Discussion"
  | "Requirement Gathering"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost"
  | "On Hold";

export type LeadPriority = "Low" | "Medium" | "High" | "Urgent";

export type ServiceInterest =
  | "Business Website"
  | "Portfolio Website"
  | "E-Commerce"
  | "Web Application"
  | "SaaS Product"
  | "UI/UX Design"
  | "Custom Software"
  | "Maintenance"
  | "Other";

export type LeadLostReason =
  | "Budget Too Low"
  | "Competitor Chosen"
  | "No Response"
  | "Requirements Changed"
  | "Timeline Issue"
  | "Not a Good Fit"
  | "Other";

export interface Lead {
  id: string;
  lead_code: string;
  full_name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  location?: string | null;
  website?: string | null;
  lead_source: LeadSource;
  lead_status: LeadStatus;
  priority: LeadPriority;
  service_interest: ServiceInterest;
  estimated_value: number;
  probability: number;
  expected_close_date?: string | null;
  next_follow_up_date?: string | null;
  last_contacted_at?: string | null;
  assigned_to?: string | null;
  description?: string | null;
  requirements?: string | null;
  notes?: string | null;
  lost_reason?: string | null;
  on_hold_reason?: string | null;
  resume_date?: string | null;
  converted_client_id?: string | null;
  converted_project_id?: string | null;
  converted_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithDetails extends Lead {
  assigned_member_name?: string | null;
  assigned_member_avatar?: string | null;
  assigned_member_role?: string | null;
  weighted_value: number;
  days_in_pipeline: number;
  is_followup_overdue: boolean;
  activities_count: number;
  pending_followups_count: number;
  converted_client_name?: string | null;
  converted_project_name?: string | null;
}

export interface LeadFormData {
  full_name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  location?: string;
  website?: string;
  lead_source: LeadSource;
  lead_status: LeadStatus;
  priority: LeadPriority;
  service_interest: ServiceInterest;
  estimated_value: number;
  probability?: number;
  expected_close_date?: string;
  next_follow_up_date?: string;
  assigned_to?: string;
  description?: string;
  requirements?: string;
  notes?: string;
  lost_reason?: string;
  on_hold_reason?: string;
  resume_date?: string;
}

export interface LeadStats {
  totalLeads: number;
  activeOpportunities: number;
  pipelineValue: number;
  weightedPipelineValue: number;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  conversionRate: number;
  overdueFollowupsCount: number;
  dueTodayFollowupsCount: number;
}

export type LeadSortOption =
  | "recently_created"
  | "oldest"
  | "highest_value"
  | "lowest_value"
  | "highest_probability"
  | "expected_close_nearest"
  | "next_followup_nearest"
  | "name_asc";

export type LeadQuickFilter =
  | "all"
  | "my_leads"
  | "due_today"
  | "overdue_followups"
  | "high_value"
  | "unassigned"
  | "won"
  | "lost"
  | "on_hold";

export const PIPELINE_STAGES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Discussion",
  "Requirement Gathering",
  "Proposal Sent",
  "Negotiation",
  "Won",
];

export const ALL_LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Discussion",
  "Requirement Gathering",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
  "On Hold",
];

export const LEAD_STAGE_PROBABILITIES: Record<LeadStatus, number> = {
  New: 10,
  Contacted: 20,
  Qualified: 35,
  Discussion: 45,
  "Requirement Gathering": 55,
  "Proposal Sent": 70,
  Negotiation: 85,
  Won: 100,
  Lost: 0,
  "On Hold": 15,
};

export const LEAD_SOURCES_LIST: LeadSource[] = [
  "Website",
  "Instagram",
  "WhatsApp",
  "Referral",
  "LinkedIn",
  "Direct Contact",
  "Facebook",
  "Email",
  "Other",
];

export const SERVICE_INTERESTS_LIST: ServiceInterest[] = [
  "Business Website",
  "Portfolio Website",
  "E-Commerce",
  "Web Application",
  "SaaS Product",
  "UI/UX Design",
  "Custom Software",
  "Maintenance",
  "Other",
];

export const LEAD_PRIORITIES_LIST: LeadPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

export const LEAD_LOST_REASONS_LIST: LeadLostReason[] = [
  "Budget Too Low",
  "Competitor Chosen",
  "No Response",
  "Requirements Changed",
  "Timeline Issue",
  "Not a Good Fit",
  "Other",
];
