"use client";

import React from "react";
import {
  Server,
  Globe,
  AppWindow,
  Users,
  UserCheck,
  Megaphone,
  TrendingUp,
  Building,
  Laptop,
  Plane,
  FolderKanban,
  ShieldCheck,
  BookOpen,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseCategoryBadgeProps {
  categoryName: string;
  size?: "sm" | "md";
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Hosting & Infrastructure": Server,
  "Domains": Globe,
  "Software & Subscriptions": AppWindow,
  "Team Payments": Users,
  "Freelancer Payments": UserCheck,
  "Marketing": Megaphone,
  "Advertising": TrendingUp,
  "Office Expenses": Building,
  "Equipment": Laptop,
  "Travel": Plane,
  "Client Project Expenses": FolderKanban,
  "Legal & Compliance": ShieldCheck,
  "Training & Education": BookOpen,
  "Miscellaneous": Receipt,
};

export function ExpenseCategoryBadge({
  categoryName,
  size = "md",
  className,
}: ExpenseCategoryBadgeProps) {
  const Icon = iconMap[categoryName] || Receipt;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 font-sans font-semibold text-slate-700 select-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3 text-blue-600" : "w-3.5 h-3.5 text-blue-600"} />
      <span className="truncate">{categoryName}</span>
    </span>
  );
}
