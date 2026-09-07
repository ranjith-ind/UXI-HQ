"use client";

import React from "react";
import { WorkloadStatus } from "@/types/team";
import { cn } from "@/lib/utils";

interface TeamWorkloadBarProps {
  assignedHours: number;
  capacityHours: number;
  percentage: number;
  status: WorkloadStatus;
  className?: string;
  showLabels?: boolean;
  size?: "sm" | "md";
}

export function TeamWorkloadBar({
  assignedHours,
  capacityHours,
  percentage,
  status,
  className,
  showLabels = true,
  size = "md",
}: TeamWorkloadBarProps) {
  // Bar color based on workload status
  const barColor =
    status === "Overloaded"
      ? "bg-rose-500"
      : status === "Near Capacity"
      ? "bg-amber-500"
      : status === "High Load"
      ? "bg-blue-600"
      : "bg-emerald-500";

  const clampedWidth = Math.min(percentage, 100);

  return (
    <div className={cn("space-y-1.5 font-sans", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            {assignedHours}h <span className="text-slate-300">/</span> {capacityHours}h capacity
          </span>
          <span
            className={cn(
              "font-bold",
              status === "Overloaded"
                ? "text-rose-700"
                : status === "Near Capacity"
                ? "text-amber-700"
                : status === "High Load"
                ? "text-blue-700"
                : "text-emerald-700"
            )}
          >
            {percentage}%
          </span>
        </div>
      )}

      <div
        className={cn(
          "w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60",
          size === "sm" ? "h-1.5" : "h-2"
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>
    </div>
  );
}
