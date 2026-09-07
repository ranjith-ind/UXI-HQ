"use client";

import React from "react";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AlertStats } from "@/types/alert";
import { StatsCard } from "@/components/dashboard/stats-card";

interface AlertStatsCardsProps {
  stats: AlertStats;
  loading?: boolean;
}

export function AlertStatsCards({ stats, loading }: AlertStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
      <StatsCard
        title="Critical Alerts"
        value={stats.critical.toString()}
        subtitle="Immediate action required"
        icon={AlertCircle}
        variant={stats.critical > 0 ? "violet" : "emerald"}
      />

      <StatsCard
        title="Warnings"
        value={stats.warnings.toString()}
        subtitle="Approaching risk thresholds"
        icon={AlertTriangle}
        variant="amber"
      />

      <StatsCard
        title="Overdue Tasks"
        value={stats.overdueTasks.toString()}
        subtitle="Delivery bottlenecks"
        icon={Clock}
        variant="blue"
      />

      <StatsCard
        title="Overdue Payments"
        value={stats.overduePayments.toString()}
        subtitle="Uncollected invoices"
        icon={CheckCircle2}
        variant="emerald"
      />
    </div>
  );
}
