"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { AlertService } from "@/services/alert.service";
import { AlertStats } from "@/types/alert";

export function BusinessAttentionWidget() {
  const [stats, setStats] = useState<AlertStats | null>(null);

  useEffect(() => {
    AlertService.getAlertStats().then((data) => {
      setStats(data);
    });
  }, []);

  return (
    <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E6EAF2] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                Attention Required
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                Action Needed
              </span>
            </div>
            <span className="text-[11px] text-[#5B6472] block">
              Automated operational risks and deadline triggers
            </span>
          </div>
        </div>

        <Link
          href="/alerts"
          className="text-xs text-[#2451EB] hover:underline font-medium flex items-center gap-1 transition-colors"
        >
          <span>View All Alerts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/tasks"
          className="p-3 rounded-lg border border-[#E6EAF2] bg-white hover:border-rose-200 hover:bg-rose-50/40 transition-all flex items-center gap-2.5 scalemorphic-card"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#0F172A] block truncate font-tabular">
              {stats ? `${stats.overdueTasks} Overdue` : "0 Overdue"}
            </span>
            <span className="text-[11px] text-[#5B6472] block truncate">Tasks</span>
          </div>
        </Link>

        <Link
          href="/finance/invoices"
          className="p-3 rounded-lg border border-[#E6EAF2] bg-white hover:border-amber-200 hover:bg-amber-50/40 transition-all flex items-center gap-2.5 scalemorphic-card"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#0F172A] block truncate font-tabular">
              {stats ? `${stats.overduePayments} Overdue` : "0 Overdue"}
            </span>
            <span className="text-[11px] text-[#5B6472] block truncate">Invoices</span>
          </div>
        </Link>

        <Link
          href="/leads/follow-ups"
          className="p-3 rounded-lg border border-[#E6EAF2] bg-white hover:border-blue-200 hover:bg-blue-50/40 transition-all flex items-center gap-2.5 scalemorphic-card"
        >
          <span className="w-2 h-2 rounded-full bg-[#2451EB] shrink-0" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#0F172A] block truncate font-tabular">
              {stats ? `${stats.followupsDueToday} Due Today` : "0 Due Today"}
            </span>
            <span className="text-[11px] text-[#5B6472] block truncate">Follow-ups</span>
          </div>
        </Link>

        <Link
          href="/team"
          className="p-3 rounded-lg border border-[#E6EAF2] bg-white hover:border-purple-200 hover:bg-purple-50/40 transition-all flex items-center gap-2.5 scalemorphic-card"
        >
          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#0F172A] block truncate font-tabular">
              {stats ? `${stats.teamOverload} Overloaded` : "0 Overloaded"}
            </span>
            <span className="text-[11px] text-[#5B6472] block truncate">Team Capacity</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
