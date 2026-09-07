export type ActivityEntityType =
  | "client"
  | "project"
  | "task"
  | "team_member"
  | "invoice"
  | "payment"
  | "expense"
  | "lead"
  | "sprint"
  | "system";

export type ActivityModule =
  | "All"
  | "Clients"
  | "Projects"
  | "Tasks"
  | "Team"
  | "Finance"
  | "Expenses"
  | "Sales CRM"
  | "System";

export type ActivityAction =
  | "Created"
  | "Updated"
  | "Deleted"
  | "Status Changed"
  | "Assigned"
  | "Completed"
  | "Converted"
  | "Paid"
  | "Logged"
  | "Resolved"
  | "Archived";

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  actor_name: string;
  actor_avatar?: string | null;
  action: string;
  entity_type: ActivityEntityType | string;
  entity_id?: string | null;
  description?: string | null;
  module?: ActivityModule;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ActivityStats {
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
  mostActiveMember: {
    name: string;
    count: number;
    avatar?: string | null;
  } | null;
}

export interface ActivityFilter {
  module?: ActivityModule;
  user?: string;
  entityType?: ActivityEntityType | "All";
  search?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: "all" | "today" | "this_week" | "this_month";
}
