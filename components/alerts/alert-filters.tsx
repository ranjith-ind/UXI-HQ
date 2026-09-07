"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { AlertSeverity, AlertType } from "@/types/alert";
import { cn } from "@/lib/utils";

interface AlertFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  severity: AlertSeverity | "All";
  onSeverityChange: (val: AlertSeverity | "All") => void;
  statusFilter: "active" | "resolved" | "all";
  onStatusFilterChange: (val: "active" | "resolved" | "all") => void;
  alertType: AlertType | "All";
  onAlertTypeChange: (val: AlertType | "All") => void;
  activeCount: number;
}

const ALERT_TYPES: AlertType[] = [
  "Overdue Task",
  "Task Due Today",
  "Project Overdue",
  "Project Due Soon",
  "Project At Risk",
  "Invoice Overdue",
  "Invoice Due Soon",
  "Expense Overdue",
  "Expense Due Soon",
  "Lead Follow Up Overdue",
  "Lead Follow Up Today",
  "Team Overloaded",
];

export function AlertFilters({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  statusFilter,
  onStatusFilterChange,
  alertType,
  onAlertTypeChange,
  activeCount,
}: AlertFiltersProps) {
  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => onStatusFilterChange("active")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5",
            statusFilter === "active"
              ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          )}
        >
          <span>Active Issues</span>
          {activeCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === "active"
                  ? "bg-white/20 text-white"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {activeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onStatusFilterChange("resolved")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5",
            statusFilter === "resolved"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          )}
        >
          <span>Resolved History</span>
        </button>

        <button
          onClick={() => onStatusFilterChange("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5",
            statusFilter === "all"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          )}
        >
          <span>All Records</span>
        </button>
      </div>

      {/* 2. Search & Severity Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search active issues or risk titles..."
            className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <select
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value as AlertSeverity | "All")}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>

          {/* Alert Type */}
          <select
            value={alertType}
            onChange={(e) => onAlertTypeChange(e.target.value as AlertType | "All")}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer max-w-[180px]"
          >
            <option value="All">All Alert Types</option>
            {ALERT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
