"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertStatsCards } from "@/components/alerts/alert-stats";
import { AlertFilters } from "@/components/alerts/alert-filters";
import { AlertList } from "@/components/alerts/alert-list";
import { AlertService } from "@/services/alert.service";
import {
  AlertSeverity,
  AlertStats,
  AlertType,
  BusinessAlertWithDetails,
} from "@/types/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function BusinessAlertsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [alerts, setAlerts] = useState<BusinessAlertWithDetails[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "resolved" | "all">("active");
  const [severity, setSeverity] = useState<AlertSeverity | "All">("All");
  const [alertType, setAlertType] = useState<AlertType | "All">("All");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const isResolvedParam =
        statusFilter === "active" ? false : statusFilter === "resolved" ? true : undefined;

      const [fetchedAlerts, fetchedStats] = await Promise.all([
        AlertService.getBusinessAlerts({
          isResolved: isResolvedParam,
          severity,
          alertType,
          search,
        }),
        AlertService.getAlertStats(),
      ]);

      setAlerts(fetchedAlerts);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to load alerts:", err);
      toastError("Error loading business alerts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severity, alertType, search, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveAlert = async (id: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await AlertService.resolveAlert(id, actorName);
    if (res.success) {
      success("Alert Resolved", "Marked issue as resolved.");
      loadData();
    } else {
      toastError("Failed to resolve alert", res.error);
    }
  };

  const handleRunSystemScan = async () => {
    setScanning(true);
    try {
      const res = await AlertService.generateBusinessAlerts();
      success(
        "Diagnostic Scan Complete",
        res.newAlertsCount > 0
          ? `Generated ${res.newAlertsCount} new operational alerts.`
          : `All checks passed. ${res.activeTotal} active issues currently tracked.`
      );
      loadData();
    } catch (err) {
      toastError("Diagnostic scan encountered an error");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Smart Operational Risk Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Smart Alerts & Attention Required
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Automated monitoring across tasks, projects, invoices, expenses, leads, and team capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleRunSystemScan}
            disabled={scanning}
            className="gap-2 shadow-sm font-semibold text-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            <span>{scanning ? "Scanning..." : "Diagnostic Scan"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Stats */}
      {stats && <AlertStatsCards stats={stats} loading={loading} />}

      {/* 3. Filters Bar */}
      <AlertFilters
        search={search}
        onSearchChange={setSearch}
        severity={severity}
        onSeverityChange={setSeverity}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        alertType={alertType}
        onAlertTypeChange={setAlertType}
        activeCount={stats?.totalActive || 0}
      />

      {/* 4. Alerts List */}
      <AlertList
        alerts={alerts}
        onResolve={handleResolveAlert}
        onScan={handleRunSystemScan}
        scanning={scanning}
      />
    </div>
  );
}
