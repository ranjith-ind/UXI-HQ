export type TaskStatus =
  | "Backlog"
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Blocked"
  | "Completed";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface TaskAssignee {
  id: string;
  task_id: string;
  team_member_id: string;
  name: string;
  email: string;
  role: string;
  title: string;
  avatar_url?: string | null;
  assigned_at: string;
}

export interface Subtask {
  id: string;
  parent_task_id: string;
  project_id: string;
  title: string;
  task_status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  parent_task_id?: string | null;
  sprint_id?: string | null;
  title: string;
  description?: string | null;
  task_status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  estimated_hours: number;
  actual_hours: number;
  start_date?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  project_name: string;
  project_code: string;
  sprint_name?: string | null;
  assignees: TaskAssignee[];
  subtasks: Subtask[];
  subtasks_total: number;
  subtasks_completed: number;
  is_overdue: boolean;
  days_remaining: number | null;
}

export interface TaskFormData {
  project_id: string;
  sprint_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  task_status: TaskStatus;
  priority: TaskPriority;
  progress?: number;
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  assignee_ids?: string[];
  subtasks?: Array<{ title: string; priority?: TaskPriority; due_date?: string }>;
}

export interface TaskStats {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
}

export type TaskSortOption =
  | "recently_created"
  | "oldest"
  | "due_date_nearest"
  | "due_date_furthest"
  | "priority_high"
  | "priority_low"
  | "progress_high"
  | "name_asc";

export type TaskDueDateFilter =
  | "all"
  | "overdue"
  | "due_today"
  | "this_week"
  | "this_month"
  | "no_due_date";

export const TASK_STATUS_LIST: TaskStatus[] = [
  "Backlog",
  "To Do",
  "In Progress",
  "In Review",
  "Blocked",
  "Completed",
];

export const TASK_PRIORITY_LIST: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];
