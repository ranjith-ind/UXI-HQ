import React from "react";
import Link from "next/link";
import { Sparkles, Target, ShieldCheck, ArrowUpRight } from "lucide-react";
import { SalesInsights as SalesInsightsType } from "@/types/sales";
import { formatCurrency } from "@/lib/utils";

interface SalesInsightsProps {
  insights: SalesInsightsType;
}

export function SalesInsightsCards({ insights }: SalesInsightsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs font-sans">
      {/* 1. Intelligent Sales Observations */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 font-display">Data-Backed Sales Intelligence</h3>
        </div>

        <div className="space-y-2.5">
          {insights.observations.map((obs, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-700 leading-relaxed font-medium"
            >
              <div className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 mt-0.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs">{obs}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top Priority Sales Deals */}
      <div className="lg:col-span-1 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Top Deals (Weighted)</h3>
          </div>
        </div>

        <div className="space-y-2.5">
          {insights.topOpportunities.map((opp) => (
            <div
              key={opp.leadId}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/leads/${opp.leadId}`}
                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate font-display"
                >
                  {opp.leadName}
                </Link>
                <span className="text-[10px] text-slate-500 block truncate font-medium">
                  {opp.companyName || opp.leadCode}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-slate-900 block font-mono">
                  {formatCurrency(opp.estimatedValue, "INR")}
                </span>
                <span className="text-[10px] text-blue-600 font-bold font-mono">
                  {opp.probability}% prob
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
