"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function StatusBadge({
  status,
  className,
  size = "md",
  showDot = true,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  // Color mapping logic
  let styles = "border-slate-200 bg-slate-100 text-slate-700";
  let dotColor = "bg-slate-400";

  if (
    normalized.includes("active") ||
    normalized.includes("completed") ||
    normalized.includes("paid") ||
    normalized.includes("won") ||
    normalized.includes("qualified") ||
    normalized.includes("approved") ||
    normalized.includes("live")
  ) {
    styles = "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    dotColor = "bg-emerald-500";
  } else if (
    normalized.includes("in progress") ||
    normalized.includes("development") ||
    normalized.includes("partially") ||
    normalized.includes("proposal") ||
    normalized.includes("negotiation") ||
    normalized.includes("review") ||
    normalized.includes("warning")
  ) {
    styles = "border-amber-200/80 bg-amber-50 text-amber-700";
    dotColor = "bg-amber-500";
  } else if (
    normalized.includes("overdue") ||
    normalized.includes("critical") ||
    normalized.includes("urgent") ||
    normalized.includes("high") ||
    normalized.includes("lost") ||
    normalized.includes("cancelled") ||
    normalized.includes("rejected") ||
    normalized.includes("overloaded")
  ) {
    styles = "border-rose-200/80 bg-rose-50 text-rose-700";
    dotColor = "bg-rose-500";
  } else if (
    normalized.includes("planning") ||
    normalized.includes("contacted") ||
    normalized.includes("sent") ||
    normalized.includes("info") ||
    normalized.includes("new")
  ) {
    styles = "border-blue-200/80 bg-blue-50 text-blue-700";
    dotColor = "bg-blue-500";
  } else if (
    normalized.includes("design") ||
    normalized.includes("testing") ||
    normalized.includes("discovery")
  ) {
    styles = "border-purple-200/80 bg-purple-50 text-purple-700";
    dotColor = "bg-purple-500";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-semibold tracking-tight transition-colors select-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        styles,
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      )}
      <span>{status}</span>
    </span>
  );
}
