"use client";

import React from "react";
import { MemberStatus } from "@/types/team";
import { cn } from "@/lib/utils";

interface TeamStatusBadgeProps {
  status: MemberStatus;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  MemberStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Active: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    dot: "bg-emerald-600",
  },
  Inactive: {
    label: "Inactive",
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  "On Leave": {
    label: "On Leave",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
  },
};

export function TeamStatusBadge({
  status,
  className,
  size = "md",
}: TeamStatusBadgeProps) {
  const cfg = statusConfig[status] || statusConfig.Active;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-semibold select-none transition-colors",
        cfg.bg,
        cfg.text,
        cfg.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
      <span>{cfg.label}</span>
    </span>
  );
}
