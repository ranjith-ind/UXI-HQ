export type AlertType =
  | "Overdue Task"
  | "Task Due Today"
  | "Project Overdue"
  | "Project Due Soon"
  | "Invoice Overdue"
  | "Invoice Due Soon"
  | "Expense Overdue"
  | "Expense Due Soon"
  | "Lead Follow Up Overdue"
  | "Lead Follow Up Today"
  | "Team Overloaded"
  | "Project At Risk";

export type AlertSeverity = "Info" | "Warning" | "Critical";

export interface BusinessAlert {
  id: string;
  alert_type: AlertType;
  title: string;
  description?: string | null;
  severity: AlertSeverity;
  entity_type: string;
  entity_id?: string | null;
  is_resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BusinessAlertWithDetails extends BusinessAlert {
  action_url?: string;
  resolved_by_name?: string | null;
}

export interface AlertStats {
  critical: number;
  warnings: number;
  info: number;
  totalActive: number;
  overdueTasks: number;
  overduePayments: number;
  teamOverload: number;
  followupsDueToday: number;
}

export interface AlertFilter {
  severity?: AlertSeverity | "All";
  alertType?: AlertType | "All";
  isResolved?: boolean;
  search?: string;
}
