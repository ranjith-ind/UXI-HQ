"use client";

import React from "react";
import { Sparkles, Lightbulb } from "lucide-react";
import { ProfitabilityInsights } from "@/types/profitability";

interface FinancialInsightsProps {
  insights: ProfitabilityInsights;
}

export function FinancialInsights({ insights }: FinancialInsightsProps) {
  const badgeColor =
    insights.overallHealthStatus === "Excellent"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : insights.overallHealthStatus === "Healthy"
      ? "text-blue-700 bg-blue-50 border-blue-200"
      : "text-amber-700 bg-amber-50 border-amber-200";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 font-display">Financial Intelligence Insights</h3>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
          Health: {insights.overallHealthStatus}
        </span>
      </div>

      <div className="space-y-2.5">
        {insights.observations.map((obs, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed font-sans font-medium">{obs}</p>
          </div>
        ))}

        {insights.observations.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4">
            Gathering more transaction data to produce financial insights.
          </p>
        )}
      </div>
    </div>
  );
}
