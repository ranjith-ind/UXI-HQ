"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Target,
  Trophy,
  Percent,
  Layers,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesFunnel } from "@/components/leads/sales-funnel";
import { SalesInsightsCards } from "@/components/leads/sales-insights";
import { SalesAnalyticsService } from "@/services/sales-analytics.service";
import {
  LeadSourcePerformance,
  SalesInsights,
  SalesPipelineStats,
  SalesTrendItem,
  ServicePerformance,
} from "@/types/sales";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function SalesAnalyticsPage() {
  const { error: toastError } = useToast();

  const [pipelineStats, setPipelineStats] = useState<SalesPipelineStats | null>(null);
  const [sources, setSources] = useState<LeadSourcePerformance[]>([]);
  const [services, setServices] = useState<ServicePerformance[]>([]);
  const [trends, setTrends] = useState<SalesTrendItem[]>([]);
  const [insights, setInsights] = useState<SalesInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pipe, src, srv, tr, ins] = await Promise.all([
        SalesAnalyticsService.getPipelineStats(),
        SalesAnalyticsService.getSourcePerformance(),
        SalesAnalyticsService.getServicePerformance(),
        SalesAnalyticsService.getSalesTrends(),
        SalesAnalyticsService.getSalesInsights(),
      ]);

      setPipelineStats(pipe);
      setSources(src);
      setServices(srv);
      setTrends(tr);
      setInsights(ins);
    } catch (err) {
      console.error("Failed to load sales analytics:", err);
      toastError("Error loading sales intelligence");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="space-y-1">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leads Pipeline</span>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Sales CRM Intelligence & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Executive View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Pipeline velocity, channel acquisition ROI, conversion ratios, and deal opportunity insights.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/leads">
            <Button variant="secondary" size="sm" className="gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Pipeline View</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      {pipelineStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Total Pipeline"
            value={formatCurrency(pipelineStats.totalPipelineValue, "INR")}
            subtitle={`${pipelineStats.totalLeads} prospective deals`}
            icon={TrendingUp}
            variant="blue"
          />

          <StatsCard
            title="Weighted Pipeline"
            value={formatCurrency(pipelineStats.totalWeightedValue, "INR")}
            subtitle="Risk-adjusted projection"
            icon={Target}
            variant="violet"
          />

          <StatsCard
            title="Win Conversion Rate"
            value={`${pipelineStats.winRate}%`}
            subtitle="Proposal to contract ratio"
            icon={Trophy}
            variant="emerald"
          />

          <StatsCard
            title="Avg Deal Value"
            value={formatCurrency(pipelineStats.averageDealSize, "INR")}
            subtitle="Across pipeline prospects"
            icon={DollarSign}
            variant="amber"
          />
        </div>
      )}

      {/* 3. Sales Funnel Distribution */}
      {pipelineStats && <SalesFunnel stats={pipelineStats} />}

      {/* 4. AI & Data-backed Insights */}
      {insights && <SalesInsightsCards insights={insights} />}

      {/* 5. Two-column breakdowns: Lead Sources & Service Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Acquisition by Source */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Acquisition Channel Performance</h3>
          </div>

          <div className="space-y-3">
            {sources.map((src) => (
              <div
                key={src.source}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-display">{src.source}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(src.pipelineValue, "INR")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{src.leadsCount} leads ({src.wonCount} won)</span>
                  <span className="text-emerald-700 font-bold font-mono">{src.conversionRate}% win rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demand by Service Line */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Demand by Service Line</h3>
          </div>

          <div className="space-y-3">
            {services.map((srv) => (
              <div
                key={srv.service}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-display">{srv.service}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(srv.pipelineValue, "INR")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{srv.leadsCount} inquiries ({srv.wonCount} closed)</span>
                  <span className="text-blue-700 font-bold font-mono">{srv.conversionRate}% conversion</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
