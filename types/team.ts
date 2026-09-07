import { UserRole } from "./database.types";

export type MemberStatus = "Active" | "Inactive" | "On Leave";

export type AvailabilityStatus = "Available" | "Busy" | "Focus Mode" | "Away";

export type EmploymentType =
  | "Founder"
  | "Full Time"
  | "Part Time"
  | "Intern"
  | "Freelancer"
  | "Contractor";

export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "UI/UX"
  | "Database"
  | "DevOps"
  | "Project Management"
  | "Marketing"
  | "Other";

export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type WorkloadStatus = "Normal" | "High Load" | "Near Capacity" | "Overloaded";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  created_at?: string;
}

export interface TeamMemberSkill {
  id: string;
  team_member_id: string;
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  proficiency_level: ProficiencyLevel;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  user_id?: string | null;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  department: string;
  designation: string;
  bio?: string | null;
  joined_date: string;
  member_status: MemberStatus;
  employment_type: EmploymentType;
  availability_status: AvailabilityStatus;
  weekly_capacity_hours: number;
  timezone: string;
  is_founder: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberWithDetails extends TeamMember {
  skills: TeamMemberSkill[];
  active_projects_count: number;
  active_tasks_count: number;
  completed_tasks_count: number;
  overdue_tasks_count: number;
  estimated_workload_hours: number;
  capacity_percentage: number;
  workload_status: WorkloadStatus;
  completion_rate: number;
}

export interface TeamMemberFormData {
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  employee_code?: string;
  role: UserRole;
  department: string;
  designation: string;
  bio?: string;
  joined_date?: string;
  member_status?: MemberStatus;
  employment_type?: EmploymentType;
  availability_status?: AvailabilityStatus;
  weekly_capacity_hours?: number;
  timezone?: string;
  skills?: Array<{
    skill_name: string;
    category: SkillCategory;
    proficiency_level: ProficiencyLevel;
  }>;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  availableNow: number;
  totalActiveTasks: number;
  overloadedMembers: number;
  completedTasksThisMonth: number;
}

export type TeamWorkloadFilter =
  | "all"
  | "normal"
  | "high_load"
  | "near_capacity"
  | "overloaded";

export type TeamSortOption =
  | "name_asc"
  | "workload_desc"
  | "workload_asc"
  | "tasks_desc"
  | "projects_desc"
  | "recently_joined";

export const MEMBER_STATUS_LIST: MemberStatus[] = ["Active", "Inactive", "On Leave"];

export const AVAILABILITY_STATUS_LIST: AvailabilityStatus[] = [
  "Available",
  "Busy",
  "Focus Mode",
  "Away",
];

export const EMPLOYMENT_TYPE_LIST: EmploymentType[] = [
  "Founder",
  "Full Time",
  "Part Time",
  "Intern",
  "Freelancer",
  "Contractor",
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Frontend",
  "Backend",
  "UI/UX",
  "Database",
  "DevOps",
  "Project Management",
  "Marketing",
  "Other",
];

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];
