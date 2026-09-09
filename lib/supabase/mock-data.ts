import { AuthUser, DashboardStats, ProjectSummary, UpcomingDeadline, ActivityItem } from "@/types";

export const FOUNDING_MEMBERS: AuthUser[] = [];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalProjects: 0,
  activeProjects: 0,
  totalClients: 0,
  totalRevenue: 0,
  totalRevenueChangePercent: 0,
  activeProjectsChangePercent: 0,
  totalClientsChangePercent: 0,
  totalTasksCount: 0,
};

export const RECENT_PROJECTS: ProjectSummary[] = [];

export const UPCOMING_DEADLINES: UpcomingDeadline[] = [];

export const RECENT_ACTIVITIES: ActivityItem[] = [];

export const MONTHLY_REVENUE_DATA: Array<{ month: string; revenue: number; target: number }> = [];
