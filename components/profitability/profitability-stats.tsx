"use client";

import React from "react";
import { CompanyProfitability } from "@/types/profitability";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  CreditCard,
  Percent,
  Sparkles,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

interface ProfitabilityStatsProps {
  profitability: CompanyProfitability;
}

export function ProfitabilityStats({ profitability }: ProfitabilityStatsProps) {
  const isHealthy = profitability.profitMargin >= 40;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      <StatsCard
        title="Realized Revenue"
        value={formatCurrency(profitability.totalRevenue, "INR")}
        subtitle="Cleared client collections"
        icon={TrendingUp}
        variant="emerald"
      />

      <StatsCard
        title="Total Expenses"
        value={formatCurrency(profitability.totalExpenses, "INR")}
        subtitle="Paid infrastructure & costs"
        icon={CreditCard}
        variant="violet"
      />

      <StatsCard
        title="Net Profit"
        value={formatCurrency(profitability.netProfit, "INR")}
        subtitle="Gross surplus after expenses"
        icon={Sparkles}
        variant="blue"
      />

      <StatsCard
        title="Profit Margin"
        value={`${profitability.profitMargin}%`}
        subtitle={isHealthy ? "Strong executive margin" : "Watch operating costs"}
        icon={Percent}
        variant={isHealthy ? "emerald" : "amber"}
      />
    </div>
  );
}
