"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, BarChart3, Calendar } from "lucide-react";
import { MonthlyRevenueTrendItem } from "@/types/finance";
import { FinanceService } from "@/services/finance.service";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  initialRange?: "6m" | "12m" | "year";
}

export function FinanceRevenueChart({ initialRange = "6m" }: RevenueChartProps) {
  const [range, setRange] = useState<"6m" | "12m" | "year">(initialRange);
  const [data, setData] = useState<MonthlyRevenueTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    FinanceService.getMonthlyRevenueTrend(range).then((trend) => {
      setData(trend);
      setLoading(false);
    });
  }, [range]);

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.invoiced)), 100000);

  return (
    <div className="rounded-2xl border border-[#1C2333] bg-[#0C101A]/95 p-6 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C2333]/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Monthly Revenue Trajectory</h3>
            <p className="text-xs text-slate-400">Cashflow realized vs billed invoices</p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0E1320] border border-[#1E2536] self-start sm:self-auto">
          {(["6m", "12m", "year"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                range === r
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r === "6m" ? "6 Months" : r === "12m" ? "12 Months" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-slate-300">Revenue Realized</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500/40 border border-blue-500" />
          <span className="text-slate-300">Invoiced Billed</span>
        </div>
      </div>

      {/* Chart Visual Bars */}
      {loading ? (
        <div className="h-48 rounded-xl bg-[#0E1320]/60 animate-pulse" />
      ) : (
        <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2">
          {data.map((item, idx) => {
            const revHeight = Math.max(8, Math.round((item.revenue / maxVal) * 100));
            const invHeight = Math.max(8, Math.round((item.invoiced / maxVal) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Revenue Bar */}
                  <div
                    className="w-full max-w-[18px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 group-hover:brightness-125 relative"
                    style={{ height: `${revHeight}%` }}
                    title={`Revenue: ${formatCurrency(item.revenue, "INR")}`}
                  />
                  {/* Invoiced Bar */}
                  <div
                    className="w-full max-w-[18px] bg-blue-500/25 border border-blue-500/50 rounded-t-md transition-all duration-300 group-hover:brightness-125 relative"
                    style={{ height: `${invHeight}%` }}
                    title={`Invoiced: ${formatCurrency(item.invoiced, "INR")}`}
                  />
                </div>

                <div className="text-center font-mono">
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors block">
                    {item.month}
                  </span>
                  <span className="text-[9px] text-emerald-400 block">
                    {item.revenue >= 100000
                      ? `₹${(item.revenue / 100000).toFixed(1)}L`
                      : `₹${(item.revenue / 1000).toFixed(0)}k`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
