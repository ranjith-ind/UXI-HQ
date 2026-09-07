import React from "react";
import { InvoiceType } from "@/types/invoice";
import { cn } from "@/lib/utils";

interface InvoiceTypeBadgeProps {
  type: InvoiceType;
  size?: "sm" | "md";
  className?: string;
}

const typeStyles: Record<InvoiceType, { bg: string; text: string; border: string }> = {
  Advance: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/80",
  },
  Milestone: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/80",
  },
  "Final Payment": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
  },
  "Full Payment": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200/80",
  },
  Maintenance: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
  },
  Other: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

export function InvoiceTypeBadge({
  type,
  size = "md",
  className,
}: InvoiceTypeBadgeProps) {
  const style = typeStyles[type] || typeStyles.Other;

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold rounded-md border select-none",
        style.bg,
        style.text,
        style.border,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className
      )}
    >
      {type}
    </span>
  );
}
