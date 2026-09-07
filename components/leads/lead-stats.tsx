"use client";

import React from "react";
import {
  Users,
  Target,
  TrendingUp,
  Clock,
  Trophy,
  Percent,
} from "lucide-react";
import { LeadStats } from "@/types/lead";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";

interface LeadStatsCardsProps {
  stats: LeadStats;
  loading?: boolean;
}

export function LeadStatsCards({ stats, loading }: LeadStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse font-sans">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white h-24 shadow-2xs"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-sans">
      <StatsCard
        title="Total Leads"
        value={stats.totalLeads.toString()}
        subtitle={`${stats.activeOpportunities} active deals`}
        icon={Users}
        variant="blue"
      />

      <StatsCard
        title="Pipeline Value"
        value={formatCurrency(stats.pipelineValue, "INR")}
        subtitle={`Weighted: ${formatCurrency(stats.weightedPipelineValue, "INR")}`}
        icon={TrendingUp}
        variant="violet"
      />

      <StatsCard
        title="Active Deals"
        value={stats.activeOpportunities.toString()}
        subtitle="In sales negotiation"
        icon={Target}
        variant="amber"
      />

      <StatsCard
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        subtitle={`${stats.wonCount} won & converted`}
        icon={Trophy}
        variant="emerald"
      />

      <StatsCard
        title="Pending Follow-Ups"
        value={stats.overdueFollowupsCount.toString()}
        subtitle={stats.overdueFollowupsCount > 0 ? "Requires action today" : "All calls up to date"}
        icon={Clock}
        variant={stats.overdueFollowupsCount > 0 ? "violet" : "emerald"}
      />

      <StatsCard
        title="Won Revenue"
        value={formatCurrency(stats.wonValue, "INR")}
        subtitle="Across closed prospects"
        icon={Percent}
        variant="emerald"
      />
    </div>
  );
}
