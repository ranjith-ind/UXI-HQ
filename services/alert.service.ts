import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  AlertFilter,
  AlertSeverity,
  AlertStats,
  AlertType,
  BusinessAlert,
  BusinessAlertWithDetails,
} from "@/types/alert";
import { TaskService } from "./task.service";
import { ProjectService } from "./project.service";
import { InvoiceService } from "./invoice.service";
import { ExpenseService } from "./expense.service";
import { LeadService } from "./lead.service";
import { TeamService } from "./team.service";

// In-memory store for business alerts
let mockAlerts: BusinessAlertWithDetails[] = [];

export class AlertService {
  /**
   * Fetch all business alerts with filtering
   */
  static async getBusinessAlerts(filter?: AlertFilter): Promise<BusinessAlertWithDetails[]> {
    let result: BusinessAlertWithDetails[] = [...mockAlerts];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("business_alerts").select("*, resolver:profiles!resolved_by(full_name)");

        if (filter?.isResolved !== undefined) {
          query = query.eq("is_resolved", filter.isResolved);
        }
        if (filter?.severity && filter.severity !== "All") {
          query = query.eq("severity", filter.severity);
        }
        if (filter?.alertType && filter.alertType !== "All") {
          query = query.eq("alert_type", filter.alertType);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;
        if (!error && data) {
          result = data.map((item: any) => ({
            id: item.id,
            alert_type: item.alert_type,
            title: item.title,
            description: item.description,
            severity: item.severity,
            entity_type: item.entity_type,
            entity_id: item.entity_id,
            is_resolved: item.is_resolved,
            resolved_at: item.resolved_at,
            resolved_by: item.resolved_by,
            resolved_by_name: item.resolver?.full_name || null,
            action_url: this.generateActionUrl(item.entity_type, item.entity_id),
            metadata: item.metadata,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase business alerts query warning:", err);
      }
    }

    // Apply memory filters
    if (filter?.isResolved !== undefined) {
      result = result.filter((a) => a.is_resolved === filter.isResolved);
    }

    if (filter?.severity && filter.severity !== "All") {
      result = result.filter((a) => a.severity === filter.severity);
    }

    if (filter?.alertType && filter.alertType !== "All") {
      result = result.filter((a) => a.alert_type === filter.alertType);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.alert_type.toLowerCase().includes(q)
      );
    }

    // Sort by severity (Critical -> Warning -> Info) then newest
    const severityWeight: Record<AlertSeverity, number> = {
      Critical: 3,
      Warning: 2,
      Info: 1,
    };

    result.sort((a, b) => {
      const weightDiff = severityWeight[b.severity] - severityWeight[a.severity];
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }

  /**
   * Get all active (unresolved) alerts
   */
  static async getActiveAlerts(): Promise<BusinessAlertWithDetails[]> {
    return this.getBusinessAlerts({ isResolved: false });
  }

  /**
   * Get critical active alerts
   */
  static async getCriticalAlerts(): Promise<BusinessAlertWithDetails[]> {
    return this.getBusinessAlerts({ isResolved: false, severity: "Critical" });
  }

  /**
   * Get KPI statistics for business alerts
   */
  static async getAlertStats(): Promise<AlertStats> {
    const active = await this.getActiveAlerts();

    const critical = active.filter((a) => a.severity === "Critical").length;
    const warnings = active.filter((a) => a.severity === "Warning").length;
    const info = active.filter((a) => a.severity === "Info").length;

    const overdueTasks = active.filter((a) => a.alert_type === "Overdue Task").length;
    const overduePayments = active.filter((a) => a.alert_type === "Invoice Overdue" || a.alert_type === "Expense Overdue").length;
    const teamOverload = active.filter((a) => a.alert_type === "Team Overloaded").length;
    const followupsDueToday = active.filter((a) => a.alert_type === "Lead Follow Up Today" || a.alert_type === "Lead Follow Up Overdue").length;

    return {
      critical,
      warnings,
      info,
      totalActive: active.length,
      overdueTasks,
      overduePayments,
      teamOverload,
      followupsDueToday,
    };
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(
    alertId: string,
    actorName: string = "User"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      mockAlerts = mockAlerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              is_resolved: true,
              resolved_at: now,
              resolved_by_name: actorName,
            }
          : a
      );

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await (supabase.from("business_alerts") as any)
            .update({
              is_resolved: true,
              resolved_at: now,
            })
            .eq("id", alertId);
        } catch (dbErr) {
          console.warn("Supabase resolve alert error:", dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to resolve alert" };
    }
  }

  /**
   * Smart Alert Scanner: Automatically scans tasks, projects, finance, expenses, leads, and team workload.
   * Employs duplicate prevention so recurring scans do not create duplicates.
   */
  static async generateBusinessAlerts(): Promise<{
    newAlertsCount: number;
    activeTotal: number;
  }> {
    try {
      const existingAlerts = await this.getActiveAlerts();
      const existingKeys = new Set(
        existingAlerts.map((a) => `${a.alert_type}__${a.entity_type}__${a.entity_id}`)
      );

      const newAlertsToInsert: BusinessAlertWithDetails[] = [];
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0];

      // 1. Scan Tasks
      try {
        const tasks = await TaskService.getTasks();
        for (const t of tasks) {
          if (t.task_status === "Completed") continue;
          if (t.due_date) {
            const dueDateStr = t.due_date.split("T")[0];
            if (dueDateStr < todayStr) {
              const key = `Overdue Task__task__${t.id}`;
              if (!existingKeys.has(key)) {
                newAlertsToInsert.push({
                  id: `alt-task-overdue-${t.id}-${Date.now()}`,
                  alert_type: "Overdue Task",
                  title: `Task Overdue: ${t.title}`,
                  description: `Assigned to ${t.assignees?.[0]?.name || "Unassigned"}. Was due on ${dueDateStr}.`,
                  severity: "Critical",
                  entity_type: "task",
                  entity_id: t.id,
                  is_resolved: false,
                  action_url: "/tasks",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                existingKeys.add(key);
              }
            } else if (dueDateStr === todayStr) {
              const key = `Task Due Today__task__${t.id}`;
              if (!existingKeys.has(key)) {
                newAlertsToInsert.push({
                  id: `alt-task-today-${t.id}-${Date.now()}`,
                  alert_type: "Task Due Today",
                  title: `Task Due Today: ${t.title}`,
                  description: `Assigned to ${t.assignees?.[0]?.name || "Unassigned"}. Scheduled for today.`,
                  severity: "Warning",
                  entity_type: "task",
                  entity_id: t.id,
                  is_resolved: false,
                  action_url: "/tasks",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                existingKeys.add(key);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Task scan error in alert engine:", e);
      }

      // 2. Scan Projects
      try {
        const projects = await ProjectService.getProjects({ isArchived: false });
        for (const p of projects) {
          if (["Completed", "Delivered", "Cancelled"].includes(p.project_status)) continue;
          if (p.estimated_deadline) {
            const deadlineStr = p.estimated_deadline.split("T")[0];
            if (deadlineStr < todayStr) {
              const key = `Project Overdue__project__${p.id}`;
              if (!existingKeys.has(key)) {
                newAlertsToInsert.push({
                  id: `alt-proj-overdue-${p.id}-${Date.now()}`,
                  alert_type: "Project Overdue",
                  title: `Project Overdue: ${p.project_name}`,
                  description: `Client: ${p.client_company}. Deadline was ${deadlineStr}.`,
                  severity: "Critical",
                  entity_type: "project",
                  entity_id: p.id,
                  is_resolved: false,
                  action_url: `/projects/${p.id}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                existingKeys.add(key);
              }
            } else if (deadlineStr <= sevenDaysLater) {
              // Check if project is at risk
              const progress = p.progress_percent || 0;
              if (p.priority === "Urgent" || p.priority === "High" || progress < 50) {
                const key = `Project At Risk__project__${p.id}`;
                if (!existingKeys.has(key)) {
                  newAlertsToInsert.push({
                    id: `alt-proj-risk-${p.id}-${Date.now()}`,
                    alert_type: "Project At Risk",
                    title: `Project At Risk: ${p.project_name}`,
                    description: `Due in under 7 days (${deadlineStr}) with only ${progress}% progress.`,
                    severity: "Critical",
                    entity_type: "project",
                    entity_id: p.id,
                    is_resolved: false,
                    action_url: `/projects/${p.id}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
                  existingKeys.add(key);
                }
              } else {
                const key = `Project Due Soon__project__${p.id}`;
                if (!existingKeys.has(key)) {
                  newAlertsToInsert.push({
                    id: `alt-proj-soon-${p.id}-${Date.now()}`,
                    alert_type: "Project Due Soon",
                    title: `Project Due Soon: ${p.project_name}`,
                    description: `Target delivery date is ${deadlineStr}.`,
                    severity: "Warning",
                    entity_type: "project",
                    entity_id: p.id,
                    is_resolved: false,
                    action_url: `/projects/${p.id}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
                  existingKeys.add(key);
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("Project scan error in alert engine:", e);
      }

      // 3. Scan Invoices
      try {
        const invoices = await InvoiceService.getInvoices();
        for (const inv of invoices) {
          if (inv.invoice_status === "Paid" || inv.invoice_status === "Cancelled") continue;
          if (inv.due_date && Number(inv.amount_due) > 0) {
            const dueStr = inv.due_date.split("T")[0];
            if (dueStr < todayStr) {
              const key = `Invoice Overdue__invoice__${inv.id}`;
              if (!existingKeys.has(key)) {
                newAlertsToInsert.push({
                  id: `alt-inv-overdue-${inv.id}-${Date.now()}`,
                  alert_type: "Invoice Overdue",
                  title: `Invoice Overdue: ${inv.invoice_number}`,
                  description: `Outstanding balance of ₹${Number(inv.amount_due).toLocaleString()} for ${inv.client_company || inv.client_name}.`,
                  severity: "Critical",
                  entity_type: "invoice",
                  entity_id: inv.id,
                  is_resolved: false,
                  action_url: "/finance/invoices",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                existingKeys.add(key);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Invoice scan error in alert engine:", e);
      }

      // 4. Scan Expenses
      try {
        const expenses = await ExpenseService.getExpenses();
        for (const exp of expenses) {
          if (exp.payment_status === "Paid") continue;
          if (exp.due_date) {
            const dueStr = exp.due_date.split("T")[0];
            if (dueStr < todayStr) {
              const key = `Expense Overdue__expense__${exp.id}`;
              if (!existingKeys.has(key)) {
                newAlertsToInsert.push({
                  id: `alt-exp-overdue-${exp.id}-${Date.now()}`,
                  alert_type: "Expense Overdue",
                  title: `Expense Overdue: ${exp.expense_title}`,
                  description: `Payment of ₹${Number(exp.amount).toLocaleString()} due on ${dueStr} is pending.`,
                  severity: "Critical",
                  entity_type: "expense",
                  entity_id: exp.id,
                  is_resolved: false,
                  action_url: "/expenses",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                existingKeys.add(key);
              }
            } else if (dueStr <= sevenDaysLater) {
              const key = `Expense Due Soon__expense__${exp.id}`;
              if (!existingKeys.has(key)) {
                newAlertsToInsert.push({
                  id: `alt-exp-soon-${exp.id}-${Date.now()}`,
                  alert_type: "Expense Due Soon",
                  title: `Expense Due Soon: ${exp.expense_title}`,
                  description: `Payment of ₹${Number(exp.amount).toLocaleString()} due on ${dueStr}.`,
                  severity: "Warning",
                  entity_type: "expense",
                  entity_id: exp.id,
                  is_resolved: false,
                  action_url: "/expenses",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                existingKeys.add(key);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Expense scan error in alert engine:", e);
      }

      // 5. Scan Lead Follow-ups
      try {
        const followups = await LeadService.getLeadFollowUps();
        for (const fup of followups) {
          if (fup.status !== "Pending") continue;
          const fupDateStr = fup.follow_up_date.split("T")[0];
          if (fupDateStr < todayStr) {
            const key = `Lead Follow Up Overdue__lead__${fup.lead_id}`;
            if (!existingKeys.has(key)) {
              newAlertsToInsert.push({
                id: `alt-fup-overdue-${fup.id}-${Date.now()}`,
                alert_type: "Lead Follow Up Overdue",
                title: `Lead Follow-up Overdue: ${fup.lead_name || "Sales Prospect"}`,
                description: `${fup.follow_up_type} was scheduled for ${fupDateStr}.`,
                severity: "Critical",
                entity_type: "lead",
                entity_id: fup.lead_id,
                is_resolved: false,
                action_url: `/leads/${fup.lead_id}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              existingKeys.add(key);
            }
          } else if (fupDateStr === todayStr) {
            const key = `Lead Follow Up Today__lead__${fup.lead_id}`;
            if (!existingKeys.has(key)) {
              newAlertsToInsert.push({
                id: `alt-fup-today-${fup.id}-${Date.now()}`,
                alert_type: "Lead Follow Up Today",
                title: `Lead Follow-up Due Today: ${fup.lead_name || "Sales Prospect"}`,
                description: `${fup.follow_up_type} scheduled for today.`,
                severity: "Warning",
                entity_type: "lead",
                entity_id: fup.lead_id,
                is_resolved: false,
                action_url: `/leads/${fup.lead_id}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              existingKeys.add(key);
            }
          }
        }
      } catch (e) {
        console.warn("Lead follow-up scan error in alert engine:", e);
      }

      // 6. Scan Team Workload Overload
      try {
        const teamMembers = await TeamService.getTeamMembers();
        for (const tm of teamMembers) {
          const capacity = tm.capacity_percentage || (tm.active_tasks_count ? tm.active_tasks_count * 20 : 0);
          if (capacity >= 100) {
            const key = `Team Overloaded__team_member__${tm.id}`;
            if (!existingKeys.has(key)) {
              newAlertsToInsert.push({
                id: `alt-team-overload-${tm.id}-${Date.now()}`,
                alert_type: "Team Overloaded",
                title: `Team Member Overloaded: ${tm.full_name}`,
                description: `Operating at ${capacity}% capacity (${tm.active_tasks_count || 5} active sprint tasks).`,
                severity: "Critical",
                entity_type: "team_member",
                entity_id: tm.id,
                is_resolved: false,
                action_url: "/team",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              existingKeys.add(key);
            }
          } else if (capacity >= 90) {
            const key = `Team Overloaded__team_member__${tm.id}`;
            if (!existingKeys.has(key)) {
              newAlertsToInsert.push({
                id: `alt-team-near-${tm.id}-${Date.now()}`,
                alert_type: "Team Overloaded",
                title: `High Workload Warning: ${tm.full_name}`,
                description: `Approaching capacity ceiling at ${capacity}%.`,
                severity: "Warning",
                entity_type: "team_member",
                entity_id: tm.id,
                is_resolved: false,
                action_url: "/team",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              existingKeys.add(key);
            }
          }
        }
      } catch (e) {
        console.warn("Team scan error in alert engine:", e);
      }

      // Persist new alerts
      if (newAlertsToInsert.length > 0) {
        mockAlerts = [...newAlertsToInsert, ...mockAlerts];

        if (isSupabaseConfigured()) {
          try {
            const supabase = createClient();
            await (supabase.from("business_alerts") as any).insert(
              newAlertsToInsert.map((a) => ({
                alert_type: a.alert_type,
                title: a.title,
                description: a.description,
                severity: a.severity,
                entity_type: a.entity_type,
                entity_id: a.entity_id,
                is_resolved: false,
              }))
            );
          } catch (dbErr) {
            console.warn("Supabase insert new alerts error:", dbErr);
          }
        }
      }

      const totalActive = (await this.getActiveAlerts()).length;
      return {
        newAlertsCount: newAlertsToInsert.length,
        activeTotal: totalActive,
      };
    } catch (err) {
      console.error("Alert generation engine failed:", err);
      return { newAlertsCount: 0, activeTotal: mockAlerts.filter((a) => !a.is_resolved).length };
    }
  }

  /**
   * Helper to resolve entity to action URL
   */
  private static generateActionUrl(entityType: string, entityId?: string | null): string {
    if (!entityId) return "/dashboard";
    switch (entityType) {
      case "project":
        return `/projects/${entityId}`;
      case "lead":
        return `/leads/${entityId}`;
      case "invoice":
        return `/finance/invoices/${entityId}`;
      case "task":
        return `/tasks/${entityId}`;
      case "team_member":
        return `/team/${entityId}`;
      case "expense":
        return `/expenses/${entityId}`;
      case "client":
        return `/clients/${entityId}`;
      default:
        return "/dashboard";
    }
  }
}
