"use client";

import React from "react";
import { Search, X } from "lucide-react";
import {
  InvoiceDueFilter,
  InvoiceSortOption,
  InvoiceStatus,
  InvoiceType,
  INVOICE_STATUS_LIST,
  INVOICE_TYPE_LIST,
} from "@/types/invoice";
import { cn } from "@/lib/utils";

interface InvoiceFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: InvoiceStatus | "All";
  onStatusChange: (status: InvoiceStatus | "All") => void;
  type: InvoiceType | "All";
  onTypeChange: (type: InvoiceType | "All") => void;
  dueFilter: InvoiceDueFilter;
  onDueFilterChange: (due: InvoiceDueFilter) => void;
  sortBy: InvoiceSortOption;
  onSortByChange: (sort: InvoiceSortOption) => void;
  totalCount: number;
}

export function InvoiceFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  dueFilter,
  onDueFilterChange,
  sortBy,
  onSortByChange,
  totalCount,
}: InvoiceFiltersProps) {
  const isFiltered =
    search !== "" ||
    status !== "All" ||
    type !== "All" ||
    dueFilter !== "all" ||
    sortBy !== "recently_created";

  const handleReset = () => {
    onSearchChange("");
    onStatusChange("All");
    onTypeChange("All");
    onDueFilterChange("all");
    onSortByChange("recently_created");
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top row: Search and dropdown filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoices by number, client, project title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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
          {/* Invoice Type */}
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as InvoiceType | "All")}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Types</option>
            {INVOICE_TYPE_LIST.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Due Filter */}
          <select
            value={dueFilter}
            onChange={(e) => onDueFilterChange(e.target.value as InvoiceDueFilter)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="overdue">Overdue Only</option>
            <option value="due_this_month">Due This Month</option>
            <option value="due_next_month">Due Next Month</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as InvoiceSortOption)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="recently_created">Recently Created</option>
            <option value="oldest_created">Oldest Created</option>
            <option value="due_date_asc">Due Date (Earliest)</option>
            <option value="due_date_desc">Due Date (Latest)</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => onStatusChange("All")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5",
            status === "All"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
          )}
        >
          <span>All Invoices</span>
          {status === "All" && totalCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {totalCount}
            </span>
          )}
        </button>

        {INVOICE_STATUS_LIST.map((st) => {
          const isSelected = status === st;
          return (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150",
                isSelected
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              )}
            >
              {st}
            </button>
          );
        })}
      </div>
    </div>
  );
}
