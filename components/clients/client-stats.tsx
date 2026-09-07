"use client";

import React from "react";
import { Users2, UserCheck, UserPlus, CheckCircle } from "lucide-react";
import { ClientStats as IClientStats } from "@/types/client";
import { StatsCard } from "@/components/dashboard/stats-card";

interface ClientStatsProps {
  stats: IClientStats;
  loading?: boolean;
}

export function ClientStats({ stats, loading }: ClientStatsProps) {
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
        title="Total Clients"
        value={stats.totalClients}
        subtitle="All accounts registered in UXI HQ"
        icon={Users2}
        variant="blue"
      />

      <StatsCard
        title="Active Clients"
        value={stats.activeClients}
        subtitle="Engaged in ongoing developments"
        icon={UserCheck}
        variant="cyan"
      />

      <StatsCard
        title="Pipeline Leads"
        value={stats.leads}
        subtitle="Prospective clients & inquiries"
        icon={UserPlus}
        variant="violet"
      />

      <StatsCard
        title="Completed / Inactive"
        value={stats.completedClients + stats.inactiveClients}
        subtitle="Delivered projects or dormant accounts"
        icon={CheckCircle}
        variant="emerald"
      />
    </div>
  );
}
