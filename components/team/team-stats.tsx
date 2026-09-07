"use client";

import React from "react";
import { Users, UserCheck, Activity, CheckSquare, Flame, Award } from "lucide-react";
import { TeamStats as ITeamStats } from "@/types/team";
import { StatsCard } from "@/components/dashboard/stats-card";

interface TeamStatsProps {
  stats: ITeamStats;
  loading?: boolean;
}

export function TeamStats({ stats, loading }: TeamStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
      <StatsCard
        title="Total Team"
        value={stats.totalMembers}
        subtitle="Founders & engineers"
        icon={Users}
        variant="blue"
      />

      <StatsCard
        title="Active Members"
        value={stats.activeMembers}
        subtitle="On active duty"
        icon={UserCheck}
        variant="emerald"
      />

      <StatsCard
        title="Available Now"
        value={stats.availableNow}
        subtitle="Ready for sprint tasks"
        icon={Activity}
        variant="cyan"
      />

      <StatsCard
        title="Active Tasks"
        value={stats.totalActiveTasks}
        subtitle="In engineering pipeline"
        icon={CheckSquare}
        variant="blue"
      />

      <StatsCard
        title="Overloaded"
        value={stats.overloadedMembers}
        subtitle={
          stats.overloadedMembers > 0
            ? "Above 100% capacity"
            : "Workload balanced"
        }
        icon={Flame}
        variant={stats.overloadedMembers > 0 ? "violet" : "blue"}
      />

      <StatsCard
        title="Done This Month"
        value={stats.completedTasksThisMonth}
        subtitle="Tasks delivered & verified"
        icon={Award}
        variant="emerald"
      />
    </div>
  );
}
