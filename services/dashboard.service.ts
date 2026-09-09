import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DashboardStats,
  ProjectSummary,
  UpcomingDeadline,
  ActivityItem,
  ActivityLog,
  Payment,
} from "@/types";
import { ProjectService } from "./project.service";
import { ClientService } from "./client.service";
import { TaskService } from "./task.service";
import { PaymentService } from "./payment.service";
import { FinanceService } from "./finance.service";

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    try {
      const [projStats, clientStats, taskStats, payments] = await Promise.all([
        ProjectService.getStats(),
        ClientService.getStats(),
        TaskService.getStats(),
        PaymentService.getPayments(),
      ]);

      const completedPayments = payments.filter((p) => p.payment_status === "Completed");
      const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      return {
        totalProjects: projStats.totalProjects,
        activeProjects: projStats.activeProjects,
        totalClients: clientStats.totalClients,
        totalRevenue: totalRevenue,
        totalRevenueChangePercent: 0,
        activeProjectsChangePercent: 0,
        totalClientsChangePercent: 0,
        totalTasksCount: taskStats.totalTasks,
      };
    } catch {
      return {
        totalProjects: 0,
        activeProjects: 0,
        totalClients: 0,
        totalRevenue: 0,
        totalRevenueChangePercent: 0,
        activeProjectsChangePercent: 0,
        totalClientsChangePercent: 0,
        totalTasksCount: 0,
      };
    }
  }

  static async getRecentProjects(): Promise<ProjectSummary[]> {
    try {
      const projects = await ProjectService.getProjects({ isArchived: false });
      return projects.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.project_name,
        code: p.project_code,
        clientName: p.client_company || p.client_name,
        status: p.project_status,
        deadline: p.estimated_deadline || "",
        progressPercent: p.progress_percent,
        budget: Number(p.final_budget || 0),
        leadName: p.team_members[0]?.name || "Unassigned",
      }));
    } catch {
      return [];
    }
  }

  static async getUpcomingDeadlines(): Promise<UpcomingDeadline[]> {
    try {
      const projects = await ProjectService.getProjects({ isArchived: false });
      const activeWithDeadline = projects
        .filter((p) => p.estimated_deadline && !["Completed", "Delivered", "Cancelled"].includes(p.project_status))
        .slice(0, 4);

      return activeWithDeadline.map((p) => ({
        id: `dl-${p.id}`,
        title: `${p.project_name} Delivery`,
        projectName: p.project_code,
        dueDate: p.estimated_deadline!,
        priority: p.priority === "Urgent" ? "urgent" : p.priority === "High" ? "high" : "medium",
        daysRemaining: p.days_remaining !== null ? p.days_remaining : 0,
      }));
    } catch {
      return [];
    }
  }

  static async getRecentActivities(): Promise<ActivityItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        if (!error && data && data.length > 0) {
          const logs = data as unknown as ActivityLog[];
          return logs.map((item) => ({
            id: item.id,
            actorName: item.actor_name,
            action: item.action,
            targetName: item.entity_type,
            timestamp: item.created_at,
            category: (item.entity_type.toLowerCase() as ActivityItem["category"]) || "system",
          }));
        }
      } catch {
        // fallback
      }
    }

    return [];
  }

  static async getRevenueChartData(): Promise<Array<{ month: string; revenue: number; target: number }>> {
    try {
      const trend = await FinanceService.getMonthlyRevenueTrend("6m");
      return trend.map((t) => ({
        month: t.month,
        revenue: t.revenue,
        target: t.invoiced,
      }));
    } catch {
      return [];
    }
  }
}
