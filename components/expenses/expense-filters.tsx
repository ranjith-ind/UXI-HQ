"use client";

import React from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Repeat,
} from "lucide-react";
import {
  EXPENSE_PAYMENT_STATUS_LIST,
  ExpenseCategory,
  ExpenseDateFilter,
  ExpensePaymentStatus,
  ExpenseSortOption,
} from "@/types/expense";
import { ClientWithDetails } from "@/types/client";
import { ProjectWithDetails } from "@/types/project";
import { cn } from "@/lib/utils";

interface ExpenseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: ExpensePaymentStatus | "All";
  onStatusChange: (status: ExpensePaymentStatus | "All") => void;
  category: string | "All";
  onCategoryChange: (category: string | "All") => void;
  dateFilter: ExpenseDateFilter;
  onDateFilterChange: (df: ExpenseDateFilter) => void;
  isRecurring: boolean | undefined;
  onRecurringChange: (rec: boolean | undefined) => void;
  selectedProjectId: string | undefined;
  onProjectChange: (projId: string | undefined) => void;
  selectedClientId: string | undefined;
  onClientChange: (clientId: string | undefined) => void;
  sortBy: ExpenseSortOption;
  onSortByChange: (sort: ExpenseSortOption) => void;
  categoriesList: ExpenseCategory[];
  projectsList: ProjectWithDetails[];
  clientsList: ClientWithDetails[];
  onReset: () => void;
}

export function ExpenseFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  dateFilter,
  onDateFilterChange,
  isRecurring,
  onRecurringChange,
  selectedProjectId,
  onProjectChange,
  selectedClientId,
  onClientChange,
  sortBy,
  onSortByChange,
  categoriesList,
  projectsList,
  clientsList,
  onReset,
}: ExpenseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const isFiltered =
    search !== "" ||
    status !== "All" ||
    category !== "All" ||
    dateFilter !== "all" ||
    isRecurring !== undefined ||
    selectedProjectId !== undefined ||
    selectedClientId !== undefined ||
    sortBy !== "recently_created";

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search expenses by vendor, description, amount, or reference..."
            className="w-full h-9 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] pl-10 pr-9 text-xs text-[#0F172A] placeholder:text-[#8A93A3] focus:outline-none focus:border-[#2451EB] focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A93A3] hover:text-[#0F172A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Dropdowns & Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as ExpenseDateFilter)}
            className="h-9 px-3 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as ExpenseSortOption)}
            className="h-9 px-3 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] cursor-pointer"
          >
            <option value="recently_created">Recently Added</option>
            <option value="expense_date_newest">Expense Date (Newest)</option>
            <option value="expense_date_oldest">Expense Date (Oldest)</option>
            <option value="highest_amount">Highest Amount</option>
            <option value="lowest_amount">Lowest Amount</option>
          </select>

          {/* Advanced Filters Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-all",
              showAdvanced
                ? "bg-[#EFF4FE] text-[#2451EB] border-[#2451EB]"
                : "bg-white text-[#5B6472] border-[#E6EAF2] hover:bg-[#F7F9FC]"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E6EAF2] pb-2">
        <button
          onClick={() => onStatusChange("All")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 scalemorphic-button",
            status === "All"
              ? "bg-[#2451EB] text-white font-semibold"
              : "bg-white text-[#5B6472] hover:bg-[#F7F9FC] hover:text-[#0F172A] border border-[#E6EAF2]"
          )}
        >
          <span>All Statuses</span>
        </button>

        {EXPENSE_PAYMENT_STATUS_LIST.map((st) => {
          const isSelected = status === st;
          return (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 scalemorphic-button",
                isSelected
                  ? "bg-[#2451EB] text-white font-semibold"
                  : "bg-white text-[#5B6472] hover:bg-[#F7F9FC] hover:text-[#0F172A] border border-[#E6EAF2]"
              )}
            >
              {st}
            </button>
          );
        })}

        <button
          onClick={() => onRecurringChange(isRecurring === true ? undefined : true)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ml-auto flex items-center gap-1.5 border scalemorphic-button",
            isRecurring === true
              ? "bg-purple-50 text-purple-700 border-purple-200 font-semibold"
              : "bg-white text-[#5B6472] border-[#E6EAF2] hover:bg-[#F7F9FC]"
          )}
        >
          <Repeat className="w-3 h-3" />
          <span>Subscriptions Only</span>
        </button>
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Client</label>
            <select
              value={selectedClientId || ""}
              onChange={(e) => onClientChange(e.target.value || undefined)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="">All Clients</option>
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Project</label>
            <select
              value={selectedProjectId || ""}
              onChange={(e) => onProjectChange(e.target.value || undefined)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="">All Projects</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} ({p.project_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Expense Nature</label>
            <select
              value={isRecurring === undefined ? "" : isRecurring ? "recurring" : "one_time"}
              onChange={(e) => {
                if (e.target.value === "recurring") onRecurringChange(true);
                else if (e.target.value === "one_time") onRecurringChange(false);
                else onRecurringChange(undefined);
              }}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="">All (One-time & Subscriptions)</option>
              <option value="recurring">Recurring Subscriptions Only</option>
              <option value="one_time">One-time Direct Payments Only</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
