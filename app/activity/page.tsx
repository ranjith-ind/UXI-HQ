"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Sparkles,
  Calendar,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { ActivityFilters } from "@/components/activity/activity-filters";
import { ActivityService } from "@/services/activity.service";
import { TeamService } from "@/services/team.service";
import {
  ActivityLog,
  ActivityModule,
  ActivityStats,
} from "@/types/activity";
import { useToast } from "@/components/ui/toast";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function ActivityPage() {
  const { error: toastError } = useToast();

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<ActivityModule>("All");
  const [selectedUser, setSelectedUser] = useState<string>("All");
  const [dateRange, setDateRange] = useState<"all" | "today" | "this_week" | "this_month">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedActivities, fetchedStats, fetchedTeam] = await Promise.all([
        ActivityService.getActivities({
          module: selectedModule,
          user: selectedUser,
          search,
          dateRange,
        }),
        ActivityService.getActivityStats(),
        TeamService.getTeamMembers(),
      ]);

      setActivities(fetchedActivities);
      setStats(fetchedStats);
      setTeamNames(fetchedTeam.map((m) => m.full_name));
    } catch (err) {
      console.error("Failed to load activity logs:", err);
      toastError("Error loading activity stream");
    } finally {
      setLoading(false);
    }
  }, [selectedModule, selectedUser, search, dateRange, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for activity logs
  useRealtimeTables({
    tables: ["activity_logs"],
    onChange: loadData,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Audit & Operational Timeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Centralized Activity Center
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Track all operations, milestone updates, payments, assignments, and sales conversions across UXI HQ.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Actions"
            value={stats.todayCount.toString()}
            subtitle="Events logged today"
            icon={Activity}
            variant="blue"
          />

          <StatsCard
            title="This Week"
            value={stats.thisWeekCount.toString()}
            subtitle="Trailing 7-day velocity"
            icon={Calendar}
            variant="violet"
          />

          <StatsCard
            title="This Month"
            value={stats.thisMonthCount.toString()}
            subtitle="Current cycle operations"
            icon={Layers}
            variant="amber"
          />

          <StatsCard
            title="Most Active"
            value={stats.mostActiveMember ? stats.mostActiveMember.name : "Team"}
            subtitle={stats.mostActiveMember ? `${stats.mostActiveMember.count} actions logged` : "All members"}
            icon={Sparkles}
            variant="emerald"
          />
        </div>
      )}

      {/* 3. Filter Controls */}
      <ActivityFilters
        search={search}
        onSearchChange={setSearch}
        selectedModule={selectedModule}
        onModuleChange={setSelectedModule}
        selectedUser={selectedUser}
        onUserChange={setSelectedUser}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        usersList={teamNames}
      />

      {/* 4. Activity Feed List */}
      <ActivityFeed
        activities={activities}
        loading={loading}
        onResetFilters={() => {
          setSearch("");
          setSelectedModule("All");
          setSelectedUser("All");
          setDateRange("all");
        }}
      />
    </div>
  );
}
