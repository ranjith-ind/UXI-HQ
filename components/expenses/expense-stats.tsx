import React from "react";
import {
  CreditCard,
  Calendar,
  Clock,
  AlertTriangle,
  Layers,
  Repeat,
} from "lucide-react";
import { ExpenseStats as ExpenseStatsType } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";

interface ExpenseStatsProps {
  stats: ExpenseStatsType;
}

export function ExpenseStats({ stats }: ExpenseStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-sans">
      <StatsCard
        title="Total Spend"
        value={formatCurrency(stats.totalExpenses, "INR")}
        subtitle="Realized company expenses"
        icon={CreditCard}
        variant="violet"
      />

      <StatsCard
        title="This Month"
        value={formatCurrency(stats.paidThisMonth, "INR")}
        subtitle="Current billing cycle"
        icon={Calendar}
        variant="blue"
      />

      <StatsCard
        title="Pending Pay"
        value={formatCurrency(stats.pendingAmount, "INR")}
        subtitle="Approved unpaid outflows"
        icon={Clock}
        variant="amber"
      />

      <StatsCard
        title="Overdue Invoices"
        value={formatCurrency(stats.overdueAmount, "INR")}
        subtitle="Passed vendor payment dates"
        icon={AlertTriangle}
        variant={stats.overdueAmount > 0 ? "violet" : "emerald"}
      />

      <StatsCard
        title="Active Categories"
        value={stats.activeCategoriesCount.toString()}
        subtitle="Expense allocation heads"
        icon={Layers}
        variant="cyan"
      />

      <StatsCard
        title="Active Subscriptions"
        value={stats.recurringExpensesCount.toString()}
        subtitle="Recurring tool & cloud licenses"
        icon={Repeat}
        variant="emerald"
      />
    </div>
  );
}
