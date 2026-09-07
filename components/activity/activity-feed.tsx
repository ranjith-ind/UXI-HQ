"use client";

import React from "react";
import { ActivityLog } from "@/types/activity";
import { ActivityItem } from "./activity-item";
import { Activity, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityFeedProps {
  activities: ActivityLog[];
  loading?: boolean;
  onResetFilters?: () => void;
}

export function ActivityFeed({ activities, loading, onResetFilters }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-medium text-xs animate-pulse">
        Loading organization audit trail...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-sm space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 font-display">No Activity Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No business operations recorded matching your current filter selection.
        </p>
        {onResetFilters && (
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={onResetFilters} className="gap-1.5 text-xs font-semibold">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      {activities.map((a) => (
        <ActivityItem key={a.id} activity={a} />
      ))}
    </div>
  );
}
