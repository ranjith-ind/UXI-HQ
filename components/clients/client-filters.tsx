"use client";

import React from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import { ClientSortOption, ClientStatus } from "@/types/client";
import { cn } from "@/lib/utils";

interface ClientFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: ClientStatus | "All";
  onStatusChange: (val: ClientStatus | "All") => void;
  sortBy: ClientSortOption;
  onSortByChange: (val: ClientSortOption) => void;
  totalCount: number;
}

const statusTabs: Array<{ id: ClientStatus | "All"; label: string }> = [
  { id: "All", label: "All Clients" },
  { id: "Active", label: "Active" },
  { id: "Lead", label: "Leads" },
  { id: "Completed", label: "Completed" },
  { id: "Inactive", label: "Inactive" },
];

const sortOptions: Array<{ id: ClientSortOption; label: string }> = [
  { id: "recently_added", label: "Recently Added" },
  { id: "oldest", label: "Oldest First" },
  { id: "name_asc", label: "Name (A-Z)" },
  { id: "name_desc", label: "Name (Z-A)" },
  { id: "company_asc", label: "Company (A-Z)" },
];

export function ClientFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  totalCount,
}: ClientFiltersProps) {
  const hasActiveFilters = search.length > 0 || status !== "All" || sortBy !== "recently_added";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("All");
    onSortByChange("recently_added");
  };

  return (
    <div className="space-y-3.5">
      {/* Top Filter Bar: Search + Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, company, email, phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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

        {/* Sort Dropdown & Clear Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-[#8A93A3] pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as ClientSortOption)}
              className="h-9 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] pl-8 pr-8 text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] focus:bg-white cursor-pointer appearance-none transition-all"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-white text-[#0F172A]">
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
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
        {statusTabs.map((tab) => {
          const isSelected = status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 scalemorphic-button",
                isSelected
                  ? "bg-[#2451EB] text-white font-semibold"
                  : "bg-white text-[#5B6472] hover:bg-[#F7F9FC] hover:text-[#0F172A] border border-[#E6EAF2]"
              )}
            >
              <span>{tab.label}</span>
              {isSelected && totalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold font-tabular">
                  {totalCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
