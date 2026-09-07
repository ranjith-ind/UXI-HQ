"use client";

import React, { useState } from "react";
import { TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ExpenseTrendChartProps {
  data: { month: string; amount: number }[];
  timeframe: "6M" | "12M" | "YEAR";
  onTimeframeChange: (tf: "6M" | "12M" | "YEAR") => void;
}

export function ExpenseTrendChart({
  data,
  timeframe,
  onTimeframeChange,
}: ExpenseTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.amount), 10000);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between font-sans">
      {/* Header with Timeframe toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Monthly Expense Trend</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational cash outflow trajectory across billing periods
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
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
              {tf === "6M" ? "6 Months" : tf === "12M" ? "12 Months" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="pt-6 pb-2">
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {data.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.amount / maxVal) * 100));
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
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-mono py-1 px-2 rounded-lg shadow-xl z-20 whitespace-nowrap animate-in fade-in zoom-in-95">
                    {formatCurrency(item.amount, "INR")}
                  </div>
                )}

                {/* Vertical Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isHovered
                      ? "bg-rose-500 shadow-md"
                      : "bg-slate-200 group-hover:bg-rose-300"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

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
