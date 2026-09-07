import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DashboardStats,
  ProjectSummary,
  UpcomingDeadline,
  ActivityItem,
  ActivityLog,
  Payment,
} from "@/types";
import {
  INITIAL_DASHBOARD_STATS,
  MONTHLY_REVENUE_DATA,
} from "@/lib/supabase/mock-data";
import { ProjectService } from "./project.service";
import { ClientService } from "./client.service";
import { TaskService } from "./task.service";

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    try {
      const [projStats, clientStats, taskStats] = await Promise.all([
        ProjectService.getStats(),
        ClientService.getStats(),
        TaskService.getStats(),
      ]);

      const totalRevenue = 1750000;

      return {
        totalProjects: projStats.totalProjects,
        activeProjects: projStats.activeProjects,
        totalClients: clientStats.totalClients,
        totalRevenue: totalRevenue,
        totalRevenueChangePercent: 24.5,
        activeProjectsChangePercent: 12.0,
        totalClientsChangePercent: 18.2,
        totalTasksCount: taskStats.totalTasks,
      };
    } catch {
      return INITIAL_DASHBOARD_STATS;
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
        deadline: p.estimated_deadline || "2026-10-01",
        progressPercent: p.progress_percent,
        budget: Number(p.final_budget || 0),
        leadName: p.team_members[0]?.name || "UXI Lead",
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

      return activeWithDeadline.map((p, idx) => ({
        id: `dl-${p.id}`,
        title: `${p.project_name} Delivery`,
        projectName: p.project_code,
        dueDate: p.estimated_deadline!,
        priority: p.priority === "Urgent" ? "urgent" : p.priority === "High" ? "high" : "medium",
        daysRemaining: p.days_remaining !== null ? p.days_remaining : 7,
      }));
    } catch {
      return [];
    }
  }

  static async getRecentActivities(): Promise<ActivityItem[]> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("uxi_activity_store");
        if (stored) {
          return JSON.parse(stored).slice(0, 6);
        }
      } catch {
        // fallback
      }
    }

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

    return [
      {
        id: "act-1",
        actorName: "Ranjith",
        action: "created new project",
        targetName: "FinPulse Banking Portal (UXI-2026-001)",
        timestamp: "2026-08-29T14:30:00Z",
        category: "project",
      },
      {
        id: "act-2",
        actorName: "Vedesh",
        action: "updated client details for",
        targetName: "Aura Brands Inc",
        timestamp: "2026-08-29T10:45:00Z",
        category: "client",
      },
      {
        id: "act-3",
        actorName: "Praneeth",
        action: "changed project status to Development for",
        targetName: "FinPulse Banking Portal",
        timestamp: "2026-08-29T09:15:00Z",
        category: "project",
      },
      {
        id: "act-4",
        actorName: "Hafi",
        action: "assigned to project",
        targetName: "OmniHealth Patient Cloud",
        timestamp: "2026-08-28T16:00:00Z",
        category: "project",
      },
    ];
  }

  static getRevenueChartData() {
    return MONTHLY_REVENUE_DATA;
  }
}
