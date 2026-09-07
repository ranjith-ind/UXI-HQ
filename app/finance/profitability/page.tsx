"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfitabilityStats } from "@/components/profitability/profitability-stats";
import { ProfitTrendChart } from "@/components/profitability/profit-trend-chart";
import { ProjectProfitabilityTable } from "@/components/profitability/project-profitability-table";
import { FinancialInsights } from "@/components/profitability/financial-insights";
import { ProfitabilityService } from "@/services/profitability.service";
import {
  CompanyProfitability,
  ProjectProfitability,
  ProfitabilityInsights as ProfitabilityInsightsType,
} from "@/types/profitability";
import { useToast } from "@/components/ui/toast";

export default function ProfitabilityPage() {
  const { error: toastError } = useToast();
  const [profitability, setProfitability] = useState<CompanyProfitability | null>(null);
  const [projectsProfit, setProjectsProfit] = useState<ProjectProfitability[]>([]);
  const [insights, setInsights] = useState<ProfitabilityInsightsType | null>(null);
  const [timeframe, setTimeframe] = useState<"6M" | "12M" | "YEAR">("6M");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [compProf, projProf, ins] = await Promise.all([
        ProfitabilityService.getCompanyProfitability(timeframe),
        ProfitabilityService.getAllProjectsProfitability(),
        ProfitabilityService.getProfitabilityInsights(),
      ]);

      setProfitability(compProf);
      setProjectsProfit(projProf);
      setInsights(ins);
    } catch (err) {
      console.error("Failed to load profitability intelligence:", err);
      toastError("Error loading profitability data");
    } finally {
      setLoading(false);
    }
  }, [timeframe, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <Link
            href="/finance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Back to Finance Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Profitability Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Executive Analytics
            </span>
          </div>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Realized cash collections minus operating costs, project margins, and business profitability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/finance">
            <Button variant="secondary" size="sm" className="gap-1.5 font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>Revenue Ledger</span>
            </Button>
          </Link>

          <Link href="/expenses">
            <Button variant="secondary" size="sm" className="gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Expenses Center</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Profitability KPI Metrics */}
      {profitability && <ProfitabilityStats profitability={profitability} />}

      {/* 3. Monthly Comparative Trend Chart */}
      {profitability && (
        <ProfitTrendChart
          data={profitability.monthlyTrend}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      )}

      {/* 4. Two-Column Live Widgets: Projects Margin Table & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectProfitabilityTable projects={projectsProfit} />
        </div>

        <div className="lg:col-span-1">
          {insights && <FinancialInsights insights={insights} />}
        </div>
      </div>
    </div>
  );
}
