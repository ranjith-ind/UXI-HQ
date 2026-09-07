"use client";

import React from "react";
import { AvailabilityStatus } from "@/types/team";
import { cn } from "@/lib/utils";

interface TeamAvailabilityBadgeProps {
  status: AvailabilityStatus;
  className?: string;
  size?: "sm" | "md";
  showDot?: boolean;
}

const statusConfig: Record<
  AvailabilityStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Available: {
    label: "Available",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    dot: "bg-emerald-600",
  },
  Busy: {
    label: "Busy",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    dot: "bg-rose-500",
  },
  "Focus Mode": {
    label: "Focus Mode",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/80",
    dot: "bg-purple-500",
  },
  Away: {
    label: "Away",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
  },
};

export function TeamAvailabilityBadge({
  status,
  className,
  size = "md",
  showDot = true,
}: TeamAvailabilityBadgeProps) {
  const cfg = statusConfig[status] || statusConfig.Available;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-semibold select-none transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        cfg.bg,
        cfg.text,
        cfg.border,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />}
      <span>{cfg.label}</span>
    </span>
  );
}
