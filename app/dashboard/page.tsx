"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardStats, ProjectSummary, UpcomingDeadline, ActivityItem } from "@/types";
import { DashboardService } from "@/services/dashboard.service";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DeadlinesWidget } from "@/components/dashboard/deadlines-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TeamSnapshot } from "@/components/dashboard/team-snapshot";
import { FinanceSnapshot } from "@/components/finance/finance-snapshot";
import { SalesSnapshot } from "@/components/leads/sales-snapshot";
import { BusinessAttentionWidget } from "@/components/alerts/business-attention-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  FolderKanban,
  Users2,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, projectsData, deadlinesData, activitiesData] =
          await Promise.all([
            DashboardService.getStats(),
            DashboardService.getRecentProjects(),
            DashboardService.getUpcomingDeadlines(),
            DashboardService.getRecentActivities(),
          ]);

        setStats(statsData);
        setProjects(projectsData);
        setDeadlines(deadlinesData);
        setActivities(activitiesData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const chartData = DashboardService.getRevenueChartData();

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Context Strip & Business Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Welcome back, {user?.fullName || "Ranjith"}
          </h1>
          <p className="text-xs text-[#5B6472] mt-0.5">
            Internal executive dashboard for UXI business operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2451EB]" />
            <span>UXI Workspace</span>
          </span>
        </div>
      </div>

      {/* 2. Primary "This Month" KPI Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={stats?.totalProjects ?? 14}
          changePercent={stats?.activeProjectsChangePercent ?? 12.0}
          icon={FolderKanban}
          variant="blue"
        />

        <StatsCard
          title="Active Projects"
          value={stats?.activeProjects ?? 6}
          subtitle="Currently in engineering or QA"
          icon={Layers}
          variant="cyan"
        />

        <StatsCard
          title="Total Clients"
          value={stats?.totalClients ?? 9}
          changePercent={stats?.totalClientsChangePercent ?? 18.2}
          icon={Users2}
          variant="violet"
        />

        <StatsCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue, "INR") : "₹18,50,000"}
          changePercent={stats?.totalRevenueChangePercent ?? 24.5}
          icon={TrendingUp}
          variant="emerald"
        />
      </div>

      {/* 3. Secondary Stats & Operational Triggers Row */}
      <BusinessAttentionWidget />

      {/* 4. Two-Column Area: Trend Chart (Left) + Stacked List Panels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart data={chartData} />
          <ProjectsTable projects={projects} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <SalesSnapshot />
          <FinanceSnapshot />
          <DeadlinesWidget deadlines={deadlines} />
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* 5. Quick-Action Cards Pinned at Bottom */}
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-5">
        <h3 className="text-xs font-semibold text-[#8A93A3] uppercase tracking-wider mb-3">
          Quick Workflows
        </h3>
        <QuickActions />
      </div>
    </div>
  );
}
