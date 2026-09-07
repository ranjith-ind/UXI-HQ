"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { MonthlyProfitTrendItem } from "@/types/profitability";
import { formatCurrency } from "@/lib/utils";

interface ProfitTrendChartProps {
  data: MonthlyProfitTrendItem[];
  timeframe: "6M" | "12M" | "YEAR";
  onTimeframeChange: (tf: "6M" | "12M" | "YEAR") => void;
}

export function ProfitTrendChart({
  data,
  timeframe,
  onTimeframeChange,
}: ProfitTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.revenue, d.expenses, d.profit]),
    50000
  );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Revenue vs Expenses vs Profit</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative performance across monthly financial cycles
          </p>
        </div>

        {/* Legend & Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Revenue</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Expenses</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Profit</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(["6M", "12M", "YEAR"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  timeframe === tf
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tf === "6M" ? "6M" : tf === "12M" ? "12M" : "This Year"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="pt-6 pb-2">
        <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2">
          {data.map((item, idx) => {
            const revHeight = Math.max(6, Math.round((item.revenue / maxVal) * 100));
            const expHeight = Math.max(6, Math.round((item.expenses / maxVal) * 100));
            const profHeight = Math.max(6, Math.round((Math.max(0, item.profit) / maxVal) * 100));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-2xl z-20 whitespace-nowrap space-y-1 font-mono animate-in fade-in">
                    <p className="font-bold text-slate-300 border-b border-slate-700 pb-1 font-display">
                      {item.month}
                    </p>
                    <p className="text-emerald-400">Rev: {formatCurrency(item.revenue, "INR")}</p>
                    <p className="text-rose-400">Exp: {formatCurrency(item.expenses, "INR")}</p>
                    <p className="text-blue-400 font-bold">Net: {formatCurrency(item.profit, "INR")}</p>
                  </div>
                )}

                {/* Triple Bars */}
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    className="w-full max-w-[12px] bg-emerald-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${revHeight}%` }}
                  />
                  <div
                    className="w-full max-w-[12px] bg-rose-400 rounded-t-sm transition-all duration-300"
                    style={{ height: `${expHeight}%` }}
                  />
                  <div
                    className="w-full max-w-[12px] bg-blue-600 rounded-t-sm transition-all duration-300"
                    style={{ height: `${profHeight}%` }}
                  />
                </div>

                {/* Month label */}
                <span className="text-[10px] font-mono text-slate-500 font-semibold truncate">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
