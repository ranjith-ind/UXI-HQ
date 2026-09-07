"use client";

import React from "react";
import { BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationEmptyStateProps {
  filter?: string;
  onResetFilters?: () => void;
}

export function NotificationEmptyState({ filter, onResetFilters }: NotificationEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-sm space-y-3 font-sans">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
        <BellOff className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 font-display">No Notifications Found</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
        {filter === "unread"
          ? "You have zero unread notifications. All communications are up to date."
          : "No notifications matched your current filter criteria."}
      </p>
      {onResetFilters && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
            className="text-xs font-semibold"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
