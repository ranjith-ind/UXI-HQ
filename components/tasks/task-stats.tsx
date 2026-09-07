"use client";

import React from "react";
import { CheckSquare, Clock, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { TaskStats as ITaskStats } from "@/types/task";
import { StatsCard } from "@/components/dashboard/stats-card";

interface TaskStatsProps {
  stats: ITaskStats;
  loading?: boolean;
}

export function TaskStats({ stats, loading }: TaskStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <StatsCard
        title="Total Tasks"
        value={stats.totalTasks}
        subtitle="All project backlogs & active sprints"
        icon={CheckSquare}
        variant="blue"
      />

      <StatsCard
        title="In Progress"
        value={stats.inProgressTasks}
        subtitle="Actively in development or review"
        icon={Clock}
        variant="cyan"
      />

      <StatsCard
        title="Completed"
        value={stats.completedTasks}
        subtitle="Finished & QA verified"
        icon={CheckCircle2}
        variant="emerald"
      />

      <StatsCard
        title="Overdue Tasks"
        value={stats.overdueTasks}
        subtitle={
          stats.overdueTasks > 0
            ? "Requires urgent engineer focus"
            : "No overdue tasks"
        }
        icon={AlertTriangle}
        variant={stats.overdueTasks > 0 ? "violet" : "emerald"}
      />

      <StatsCard
        title="Due Today"
        value={stats.dueTodayTasks}
        subtitle="Work items due today"
        icon={Calendar}
        variant="amber"
      />
    </div>
  );
}
