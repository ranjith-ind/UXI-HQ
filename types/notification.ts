export type NotificationType =
  | "Task Assigned"
  | "Task Updated"
  | "Task Deadline"
  | "Project Assigned"
  | "Project Updated"
  | "Project Deadline"
  | "New Lead"
  | "Lead Assigned"
  | "Lead Follow Up"
  | "Lead Converted"
  | "Invoice Created"
  | "Invoice Overdue"
  | "Payment Received"
  | "Expense Due"
  | "Expense Overdue"
  | "Team Workload"
  | "System Alert"
  | "General";

export type NotificationPriority = "Low" | "Normal" | "High" | "Urgent";

export type NotificationEntityType =
  | "client"
  | "project"
  | "task"
  | "invoice"
  | "payment"
  | "expense"
  | "lead"
  | "team_member"
  | "sprint"
  | "system";

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  title: string;
  message?: string | null;
  notification_type: NotificationType;
  entity_type?: NotificationEntityType | null;
  entity_id?: string | null;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationWithDetails extends Notification {
  actor_name?: string | null;
  actor_avatar?: string | null;
  recipient_name?: string | null;
}

export interface NotificationFormData {
  recipient_id: string;
  actor_id?: string;
  title: string;
  message?: string;
  notification_type: NotificationType;
  entity_type?: NotificationEntityType;
  entity_id?: string;
  action_url?: string;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  id: string;
  profile_id: string;
  task_assigned: boolean;
  task_status_changes: boolean;
  task_deadlines: boolean;
  project_assignments: boolean;
  project_deadlines: boolean;
  lead_assignments: boolean;
  lead_followups: boolean;
  lead_updates: boolean;
  invoice_updates: boolean;
  invoice_overdue: boolean;
  payment_received: boolean;
  expense_alerts: boolean;
  team_workload_alerts: boolean;
  system_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  todayCount: number;
}

export type NotificationFilterOption = "all" | "unread" | "read" | "urgent" | "today";

export type NotificationSortOption = "newest" | "oldest" | "priority";
