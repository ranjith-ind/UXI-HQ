"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { LeadService } from "@/services/lead.service";
import { LeadStats } from "@/types/lead";
import { formatCurrency } from "@/lib/utils";

export function SalesSnapshot() {
  const [stats, setStats] = useState<LeadStats | null>(null);

  useEffect(() => {
    LeadService.getLeadStats().then(setStats);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Sales CRM Snapshot</h3>
            <p className="text-xs text-slate-500">Pipeline health & active deals</p>
          </div>
        </div>

        <Link
          href="/leads"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
        >
          <span>Pipeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Active Deals</span>
          <span className="text-base font-extrabold text-blue-700 mt-0.5 block truncate font-display">
            {stats ? stats.activeOpportunities : 0} Deals
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Pipeline</span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5 block truncate font-display">
            {stats ? formatCurrency(stats.pipelineValue, "INR") : "₹0"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Follow-ups</span>
          <span
            className={`text-base font-extrabold mt-0.5 block truncate font-display ${
              stats && stats.overdueFollowupsCount > 0 ? "text-rose-700" : "text-amber-700"
            }`}
          >
            {stats ? `${stats.dueTodayFollowupsCount} today` : "0 today"}
          </span>
        </div>
      </div>
    </div>
  );
}
