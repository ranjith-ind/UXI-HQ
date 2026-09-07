"use client";

import React from "react";
import { FolderKanban, Layers, CheckCircle2, AlertTriangle } from "lucide-react";
import { ProjectStats as IProjectStats } from "@/types/project";
import { StatsCard } from "@/components/dashboard/stats-card";

interface ProjectStatsProps {
  stats: IProjectStats;
  loading?: boolean;
}

export function ProjectStats({ stats, loading }: ProjectStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Projects"
        value={stats.totalProjects}
        subtitle="All pipeline & delivered works"
        icon={FolderKanban}
        variant="blue"
      />

      <StatsCard
        title="Active Projects"
        value={stats.activeProjects}
        subtitle="Currently in design, dev, or QA"
        icon={Layers}
        variant="cyan"
      />

      <StatsCard
        title="Completed"
        value={stats.completedProjects}
        subtitle="Delivered to client sign-off"
        icon={CheckCircle2}
        variant="emerald"
      />

      <StatsCard
        title="Overdue Projects"
        value={stats.overdueProjects}
        subtitle={
          stats.overdueProjects > 0
            ? "Requires urgent engineering focus"
            : "All active milestones on track"
        }
        icon={AlertTriangle}
        variant={stats.overdueProjects > 0 ? "violet" : "emerald"}
      />
    </div>
  );
}
