import React from "react";
import { PaymentStatus } from "@/types/payment";
import { CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Completed: {
    label: "Completed",
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
  Failed: {
    label: "Failed",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200/80",
    icon: XCircle,
  },
  Refunded: {
    label: "Refunded",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/80",
    icon: RotateCcw,
  },
};

export function PaymentStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: PaymentStatusBadgeProps) {
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
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
