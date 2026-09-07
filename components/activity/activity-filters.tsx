"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { ActivityModule } from "@/types/activity";
import { cn } from "@/lib/utils";

interface ActivityFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedModule: ActivityModule;
  onModuleChange: (val: ActivityModule) => void;
  selectedUser: string;
  onUserChange: (val: string) => void;
  dateRange: "all" | "today" | "this_week" | "this_month";
  onDateRangeChange: (val: "all" | "today" | "this_week" | "this_month") => void;
  usersList: string[];
}

const MODULES: ActivityModule[] = [
  "All",
  "Clients",
  "Projects",
  "Tasks",
  "Team",
  "Finance",
  "Expenses",
  "Sales CRM",
  "System",
];

export function ActivityFilters({
  search,
  onSearchChange,
  selectedModule,
  onModuleChange,
  selectedUser,
  onUserChange,
  dateRange,
  onDateRangeChange,
  usersList,
}: ActivityFiltersProps) {
  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Module Horizontal Scroll Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
        {MODULES.map((mod) => (
          <button
            key={mod}
            onClick={() => onModuleChange(mod)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5",
              selectedModule === mod
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
            )}
          >
            {mod === "All" ? "All Activity" : mod}
          </button>
        ))}
      </div>

      {/* Search and Dropdowns */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search action logs, users, or descriptions..."
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

        <div className="flex flex-wrap items-center gap-2">
          {/* User selector */}
          <select
            value={selectedUser}
            onChange={(e) => onUserChange(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Team Members</option>
            {usersList.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          {/* Date range */}
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>
    </div>
  );
}
