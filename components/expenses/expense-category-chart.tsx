"use client";

import React from "react";
import { Layers } from "lucide-react";
import { ExpenseCategoryStats } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { ExpenseCategoryBadge } from "./expense-category-badge";

interface ExpenseCategoryChartProps {
  categories: ExpenseCategoryStats[];
  limit?: number;
}

export function ExpenseCategoryChart({
  categories,
  limit = 5,
}: ExpenseCategoryChartProps) {
  const displayed = categories.filter((c) => c.totalSpending > 0).slice(0, limit);
  const totalSpending = displayed.reduce((sum, c) => sum + c.totalSpending, 0);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 font-display">Expense by Category</h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700">
          {formatCurrency(totalSpending, "INR")} Top Spend
        </span>
      </div>

      {displayed.length > 0 ? (
        <div className="space-y-3.5">
          {displayed.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <ExpenseCategoryBadge categoryName={cat.name} size="sm" />
                <div className="text-right">
                  <span className="font-bold text-slate-900 block font-mono">
                    {formatCurrency(cat.totalSpending, "INR")}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {cat.percentage}% of total ({cat.expenseCount} items)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.max(4, cat.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic text-center py-6">
          No categorical expenditure records found.
        </p>
      )}
    </div>
  );
}
