"use client";

import React from "react";
import { Users2, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientEmptyStateProps {
  isFiltered?: boolean;
  onAddClient: () => void;
  onResetFilters?: () => void;
}

export function ClientEmptyState({
  isFiltered = false,
  onAddClient,
  onResetFilters,
}: ClientEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 mb-4">
          <Users2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 font-display">No clients match your filter</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Try adjusting your search keywords or switching status tabs to find client records.
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters} className="mt-5">
            Reset all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
      <div className="relative mb-5">
        <div className="relative w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Users2 className="w-8 h-8" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700 mb-3">
        <Sparkles className="w-3 h-3 text-blue-600" />
        <span>UXI Client Directory</span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
        No clients yet
      </h3>

      <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed font-sans">
        Start building your client network by adding your first client. Track active contracts, billing info, project milestones, and communications all in one centralized hub.
      </p>

      <Button
        variant="default"
        size="lg"
        onClick={onAddClient}
        className="mt-6 gap-2 shadow-sm font-semibold"
      >
        <UserPlus className="w-4 h-4" />
        <span>Add Your First Client</span>
      </Button>
    </div>
  );
}
