"use client";

import React from "react";
import { ExpensePaymentStatus } from "@/types/expense";
import { CheckCircle2, Clock, AlertTriangle, FileText, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseStatusBadgeProps {
  status: ExpensePaymentStatus;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<
  ExpensePaymentStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Paid: {
    label: "Paid",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    icon: CheckCircle2,
  },
  Pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    icon: Clock,
  },
  Draft: {
    label: "Draft",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: FileText,
  },
  Overdue: {
    label: "Overdue",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    icon: AlertTriangle,
  },
  Cancelled: {
    label: "Cancelled",
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    icon: XCircle,
  },
};

export function ExpenseStatusBadge({
  status,
  size = "md",
  className,
}: ExpenseStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-semibold select-none transition-colors",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span>{config.label}</span>
    </span>
  );
}
