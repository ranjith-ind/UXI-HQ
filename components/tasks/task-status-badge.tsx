"use client";

import React from "react";
import { TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Backlog: {
    label: "Backlog",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  "To Do": {
    label: "To Do",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/80",
    dot: "bg-blue-600",
  },
  "In Progress": {
    label: "In Progress",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200/80",
    dot: "bg-cyan-600",
  },
  "In Review": {
    label: "In Review",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
  },
  Blocked: {
    label: "Blocked",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    dot: "bg-rose-500",
  },
  Completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    dot: "bg-emerald-600",
  },
};

export function TaskStatusBadge({
  status,
  className,
  size = "md",
}: TaskStatusBadgeProps) {
  const cfg = statusConfig[status] || statusConfig["To Do"];

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
