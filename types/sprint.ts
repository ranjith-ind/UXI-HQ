export type SprintStatus = "Planned" | "Active" | "Completed" | "Cancelled";

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string | null;
  start_date: string;
  end_date: string;
  sprint_status: SprintStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SprintWithDetails extends Sprint {
  project_name: string;
  project_code: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percent: number;
  days_remaining: number | null;
  is_overdue: boolean;
}

export interface SprintFormData {
  project_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  sprint_status?: SprintStatus;
}

export interface SprintStats {
  totalSprints: number;
  activeSprints: number;
  plannedSprints: number;
  completedSprints: number;
}
