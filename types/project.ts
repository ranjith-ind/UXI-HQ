import { Client } from "./client";

export type ProjectStatus =
  | "Lead"
  | "Discussion"
  | "Confirmed"
  | "Designing"
  | "Development"
  | "Testing"
  | "Client Review"
  | "Delivered"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export type ProjectPriority = "Low" | "Medium" | "High" | "Urgent";

export type ProjectType =
  | "Business Website"
  | "Portfolio Website"
  | "E-Commerce Website"
  | "Landing Page"
  | "Web Application"
  | "Admin Dashboard"
  | "SaaS Platform"
  | "Custom Software"
  | "UI/UX Design"
  | "Website Redesign"
  | "Maintenance"
  | "Other";

export interface ProjectMember {
  id: string;
  project_id: string;
  team_member_id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  avatar_url?: string | null;
  assigned_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  project_name: string;
  project_code: string;
  project_type: ProjectType;
  description?: string | null;
  requirements?: string | null;
  project_status: ProjectStatus;
  priority: ProjectPriority;
  estimated_budget: number;
  final_budget: number;
  currency: string;
  advance_amount: number;
  total_paid_amount: number;
  pending_amount: number;
  start_date?: string | null;
  estimated_deadline?: string | null;
  actual_completion_date?: string | null;
  project_url?: string | null;
  repository_url?: string | null;
  project_notes?: string | null;
  is_archived: boolean;
  archived_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends Project {
  client?: Client | null;
  client_name: string;
  client_company: string;
  team_members: ProjectMember[];
  progress_percent: number;
  is_overdue: boolean;
  days_remaining: number | null;
}

export interface ProjectFormData {
  client_id: string;
  project_name: string;
  project_code: string;
  project_type: ProjectType;
  description?: string;
  requirements?: string;
  project_status: ProjectStatus;
  priority: ProjectPriority;
  estimated_budget: number;
  final_budget: number;
  currency?: string;
  advance_amount: number;
  start_date?: string;
  estimated_deadline?: string;
  project_url?: string;
  repository_url?: string;
  project_notes?: string;
  team_member_ids?: string[];
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalContractValue: number;
}

export type ProjectSortOption =
  | "recently_created"
  | "oldest"
  | "deadline_nearest"
  | "deadline_furthest"
  | "name_asc"
  | "name_desc"
  | "highest_budget"
  | "lowest_budget";

export type DeadlineFilterOption =
  | "all"
  | "overdue"
  | "due_today"
  | "this_week"
  | "this_month"
  | "no_deadline";

export const PROJECT_STATUS_PROGRESS: Record<ProjectStatus, number> = {
  Lead: 5,
  Discussion: 10,
  Confirmed: 20,
  Designing: 35,
  Development: 55,
  Testing: 70,
  "Client Review": 80,
  Delivered: 90,
  Completed: 100,
  "On Hold": 50,
  Cancelled: 0,
};

export const PROJECT_TYPES_LIST: ProjectType[] = [
  "Web Application",
  "E-Commerce Website",
  "Business Website",
  "SaaS Platform",
  "Admin Dashboard",
  "Landing Page",
  "Portfolio Website",
  "Custom Software",
  "UI/UX Design",
  "Website Redesign",
  "Maintenance",
  "Other",
];

export const PROJECT_STATUS_LIST: ProjectStatus[] = [
  "Lead",
  "Discussion",
  "Confirmed",
  "Designing",
  "Development",
  "Testing",
  "Client Review",
  "Delivered",
  "Completed",
  "On Hold",
  "Cancelled",
];

export const PROJECT_PRIORITY_LIST: ProjectPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];
