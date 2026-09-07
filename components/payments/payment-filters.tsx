"use client";

import React from "react";
import { Search, X } from "lucide-react";
import {
  PaymentMethod,
  PaymentSortOption,
  PaymentStatus,
  PAYMENT_METHOD_LIST,
  PAYMENT_STATUS_LIST,
} from "@/types/payment";
import { cn } from "@/lib/utils";

interface PaymentFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: PaymentStatus | "All";
  onStatusChange: (status: PaymentStatus | "All") => void;
  method: PaymentMethod | "All";
  onMethodChange: (method: PaymentMethod | "All") => void;
  sortBy: PaymentSortOption;
  onSortByChange: (sort: PaymentSortOption) => void;
  totalCount: number;
}

export function PaymentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  method,
  onMethodChange,
  sortBy,
  onSortByChange,
  totalCount,
}: PaymentFiltersProps) {
  const isFiltered =
    search !== "" || status !== "All" || method !== "All" || sortBy !== "recently_paid";

  const handleReset = () => {
    onSearchChange("");
    onStatusChange("All");
    onMethodChange("All");
    onSortByChange("recently_paid");
  };

  return (
    <div className="space-y-3.5 font-sans">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search payments by client, project, invoice, or UTR ref..."
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

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Method Filter */}
          <select
            value={method}
            onChange={(e) => onMethodChange(e.target.value as PaymentMethod | "All")}
            className="h-9 px-3 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] cursor-pointer"
          >
            <option value="All">All Channels</option>
            {PAYMENT_METHOD_LIST.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as PaymentSortOption)}
            className="h-9 px-3 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] cursor-pointer"
          >
            <option value="recently_paid">Recently Paid</option>
            <option value="oldest_paid">Oldest Paid</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>

          {isFiltered && (
            <button
              onClick={handleReset}
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
          <span>All Inflows</span>
          {status === "All" && totalCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold font-tabular">
              {totalCount}
            </span>
          )}
        </button>

        {PAYMENT_STATUS_LIST.map((st) => {
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
      </div>
    </div>
  );
}
