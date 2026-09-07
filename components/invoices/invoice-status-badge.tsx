import React from "react";
import { InvoiceStatus } from "@/types/invoice";
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Draft: {
    label: "Draft",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: FileText,
  },
  Sent: {
    label: "Sent",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/80",
    icon: Send,
  },
  "Partially Paid": {
    label: "Partially Paid",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    icon: Clock,
  },
  Paid: {
    label: "Paid",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    icon: CheckCircle2,
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

export function InvoiceStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Draft;
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
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
