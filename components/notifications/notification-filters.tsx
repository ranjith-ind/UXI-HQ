"use client";

import React from "react";
import { Search, X } from "lucide-react";
import {
  NotificationFilterOption,
  NotificationPriority,
  NotificationSortOption,
  NotificationType,
} from "@/types/notification";
import { cn } from "@/lib/utils";

interface NotificationFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeFilter: NotificationFilterOption;
  onFilterChange: (val: NotificationFilterOption) => void;
  priority: NotificationPriority | "All";
  onPriorityChange: (val: NotificationPriority | "All") => void;
  notificationType: NotificationType | "All";
  onTypeChange: (val: NotificationType | "All") => void;
  sortBy: NotificationSortOption;
  onSortByChange: (val: NotificationSortOption) => void;
  unreadCount: number;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  "Task Assigned",
  "Task Deadline",
  "Project Assigned",
  "Project Deadline",
  "New Lead",
  "Lead Assigned",
  "Lead Follow Up",
  "Lead Converted",
  "Invoice Overdue",
  "Payment Received",
  "Expense Due",
  "Expense Overdue",
  "Team Workload",
  "System Alert",
];

export function NotificationFilters({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  priority,
  onPriorityChange,
  notificationType,
  onTypeChange,
  sortBy,
  onSortByChange,
  unreadCount,
}: NotificationFiltersProps) {
  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => onFilterChange("all")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5",
            activeFilter === "all"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          )}
        >
          <span>All</span>
        </button>

        <button
          onClick={() => onFilterChange("unread")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5",
            activeFilter === "unread"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          )}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeFilter === "unread"
                  ? "bg-white/20 text-white"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onFilterChange("urgent")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5",
            activeFilter === "urgent"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          )}
        >
          <span>Urgent</span>
        </button>
      </div>

      {/* 2. Search & Select Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notification messages or titles..."
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
          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as NotificationPriority | "All")}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Type */}
          <select
            value={notificationType}
            onChange={(e) => onTypeChange(e.target.value as NotificationType | "All")}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer max-w-[160px]"
          >
            <option value="All">All Trigger Types</option>
            {NOTIFICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as NotificationSortOption)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority_desc">Priority (Highest)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
