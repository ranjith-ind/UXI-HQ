import React from "react";
import { LeadPriority } from "@/types/lead";
import { AlertCircle, Flame, ArrowUp, ArrowDown } from "lucide-react";

interface LeadPriorityBadgeProps {
  priority: LeadPriority;
  size?: "sm" | "md";
}

const priorityConfig: Record<
  LeadPriority,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  Urgent: {
    label: "Urgent",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: Flame,
  },
  High: {
    label: "High",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: ArrowUp,
  },
  Medium: {
    label: "Medium",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: AlertCircle,
  },
  Low: {
    label: "Low",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: ArrowDown,
  },
};

export function LeadPriorityBadge({ priority, size = "sm" }: LeadPriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs font-sans ${
        config.bg
      } ${config.text} ${config.border} ${
        size === "sm" ? "px-2 py-0.5 text-[10px] gap-1" : "px-2.5 py-1 text-xs gap-1.5"
      }`}
    >
      <Icon className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      <span>{config.label}</span>
    </span>
  );
}
