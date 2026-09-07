"use client";

import React from "react";
import { WorkloadStatus } from "@/types/team";
import { cn } from "@/lib/utils";
import { AlertTriangle, Flame, CheckCircle, Activity } from "lucide-react";

interface TeamWorkloadBadgeProps {
  status: WorkloadStatus;
  percentage?: number;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  WorkloadStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Normal: {
    label: "Normal Load",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    icon: CheckCircle,
  },
  "High Load": {
    label: "High Load",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/80",
    icon: Activity,
  },
  "Near Capacity": {
    label: "Near Capacity",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    icon: AlertTriangle,
  },
  Overloaded: {
    label: "Overloaded",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    icon: Flame,
  },
};

export function TeamWorkloadBadge({
  status,
  percentage,
  className,
  size = "md",
}: TeamWorkloadBadgeProps) {
  const cfg = statusConfig[status] || statusConfig.Normal;
  const Icon = cfg.icon;

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
      <Icon className="w-3 h-3 shrink-0" />
      <span>{cfg.label}</span>
      {percentage !== undefined && (
        <span className="font-mono opacity-80">({percentage}%)</span>
      )}
    </span>
  );
}
