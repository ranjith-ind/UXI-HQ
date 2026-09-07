"use client";

import React from "react";
import { ProjectStatus } from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Lead: {
    label: "Lead",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  Discussion: {
    label: "Discussion",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200/80",
    dot: "bg-indigo-500",
  },
  Confirmed: {
    label: "Confirmed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/80",
    dot: "bg-blue-600",
  },
  Designing: {
    label: "Designing",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/80",
    dot: "bg-purple-500",
  },
  Development: {
    label: "Development",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200/80",
    dot: "bg-cyan-600",
  },
  Testing: {
    label: "Testing",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
  },
  "Client Review": {
    label: "Client Review",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/80",
    dot: "bg-purple-500",
  },
  Completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    dot: "bg-emerald-600",
  },
  Delivered: {
    label: "Delivered",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200/80",
    dot: "bg-teal-600",
  },
  "On Hold": {
    label: "On Hold",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
  },
  Cancelled: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    dot: "bg-rose-500",
  },
};

export function ProjectStatusBadge({
  status,
  className,
  size = "md",
}: ProjectStatusBadgeProps) {
  const cfg = statusConfig[status] || statusConfig.Confirmed;

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
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
      <span>{cfg.label}</span>
    </span>
  );
}
