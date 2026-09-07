"use client";

import React from "react";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
  Percent,
  Sparkles,
} from "lucide-react";
import { FinanceStats as IFinanceStats } from "@/types/finance";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";

interface FinanceStatsProps {
  stats: IFinanceStats;
  loading?: boolean;
}

export function FinanceStats({ stats, loading }: FinanceStatsProps) {
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
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 font-sans">
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue, "INR")}
        subtitle="Verified completed payments"
        icon={TrendingUp}
        variant="emerald"
      />

      <StatsCard
        title="Outstanding"
        value={formatCurrency(stats.outstandingAmount, "INR")}
        subtitle="Unpaid active balances"
        icon={Clock}
        variant="blue"
      />

      <StatsCard
        title="Overdue Amount"
        value={formatCurrency(stats.overdueAmount, "INR")}
        subtitle="Passed due date balances"
        icon={AlertTriangle}
        variant={stats.overdueAmount > 0 ? "violet" : "emerald"}
      />

      <StatsCard
        title="This Month Revenue"
        value={formatCurrency(stats.thisMonthRevenue, "INR")}
        subtitle="Current month cashflow"
        icon={Sparkles}
        variant="cyan"
      />

      <StatsCard
        title="Total Invoices"
        value={stats.totalInvoices.toString()}
        subtitle="Generated billing notes"
        icon={FileText}
        variant="violet"
      />

      <StatsCard
        title="Collection Rate"
        value={`${stats.collectionRate}%`}
        subtitle="Realized vs billed"
        icon={Percent}
        variant={stats.collectionRate >= 80 ? "emerald" : "blue"}
      />
    </div>
  );
}
