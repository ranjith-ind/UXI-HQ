"use client";

import React from "react";
import { ProjectPriority } from "@/types/project";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

interface ProjectPriorityBadgeProps {
  priority: ProjectPriority;
  className?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const priorityConfig: Record<
  ProjectPriority,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Low: {
    label: "Low",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: ArrowDown,
  },
  Medium: {
    label: "Medium",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/80",
    icon: ArrowUp,
  },
  High: {
    label: "High",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    icon: AlertTriangle,
  },
  Urgent: {
    label: "Urgent",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    icon: AlertCircle,
  },
};

export function ProjectPriorityBadge({
  priority,
  className,
  size = "md",
  showIcon = true,
}: ProjectPriorityBadgeProps) {
  const cfg = priorityConfig[priority] || priorityConfig.Medium;
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
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{cfg.label}</span>
    </span>
  );
}
