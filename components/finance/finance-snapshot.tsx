"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProfitabilityService } from "@/services/profitability.service";
import { CompanyProfitability } from "@/types/profitability";
import { formatCurrency } from "@/lib/utils";

export function FinanceSnapshot() {
  const [profitability, setProfitability] = useState<CompanyProfitability | null>(null);

  useEffect(() => {
    ProfitabilityService.getCompanyProfitability("6M").then(setProfitability);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Financial Health & Margin</h3>
            <p className="text-xs text-slate-500">Live recognized revenues & margins</p>
          </div>
        </div>

        <Link
          href="/finance/profitability"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
        >
          <span>Intelligence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Total Revenue</span>
          <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block truncate font-display">
            {profitability ? formatCurrency(profitability.totalRevenue, "INR") : "₹7.25L"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Total Expenses</span>
          <span className="text-sm font-extrabold text-rose-700 mt-0.5 block truncate font-display">
            {profitability ? formatCurrency(profitability.totalExpenses, "INR") : "₹54.4K"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Net Margin</span>
          <span className="text-sm font-extrabold text-blue-700 mt-0.5 block truncate font-display">
            {profitability ? `${profitability.profitMargin}%` : "92.5%"}
          </span>
        </div>
      </div>
    </div>
  );
}
