"use client";

import React from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckSquare,
  Users2,
  Receipt,
  DollarSign,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ActivityLog, ActivityModule } from "@/types/activity";
import { formatRelativeTime } from "@/lib/utils";

interface ActivityItemProps {
  activity: ActivityLog;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = getActivityModuleIcon(activity.module);
  const actionUrl = getActivityActionUrl(activity.entity_type || undefined, activity.entity_id || undefined);

  return (
    <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all font-sans text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-start gap-3.5 min-w-0">
        <Avatar
          src={activity.actor_avatar || undefined}
          name={activity.actor_name}
          size="md"
          className="mt-0.5 shrink-0"
        />

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-xs font-display">
              {activity.actor_name}
            </span>
            <span className={`px-2 py-0.2 rounded text-[10px] border font-bold ${getActionBadgeStyle(activity.action)}`}>
              {activity.action}
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 font-semibold">
              <Icon className="w-3 h-3 text-blue-600" />
              <span>{activity.module || activity.entity_type}</span>
            </span>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed font-normal">
            {activity.description}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(activity.created_at)}</span>
          </div>
        </div>
      </div>

      {actionUrl && (
        <div className="shrink-0 self-end sm:self-center">
          <Link
            href={actionUrl}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          >
            <span>View Record</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function getActivityModuleIcon(mod?: string) {
  switch (mod) {
    case "Clients":
      return Users2;
    case "Projects":
      return FolderKanban;
    case "Tasks":
      return CheckSquare;
    case "Team":
      return Users2;
    case "Finance":
      return Receipt;
    case "Expenses":
      return DollarSign;
    case "Sales CRM":
      return TrendingUp;
    case "System":
    default:
      return Sparkles;
  }
}

function getActionBadgeStyle(action: string) {
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add") || a.includes("record") || a.includes("won")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (a.includes("delete") || a.includes("archive") || a.includes("lost")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (a.includes("update") || a.includes("edit") || a.includes("change")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (a.includes("complete") || a.includes("pay")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function getActivityActionUrl(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  switch (entityType.toLowerCase()) {
    case "client":
      return `/clients/${entityId}`;
    case "project":
      return `/projects/${entityId}`;
    case "task":
      return `/tasks`;
    case "team_member":
      return `/team/${entityId}`;
    case "invoice":
      return `/finance/invoices/${entityId}`;
    case "payment":
      return `/finance/payments`;
    case "expense":
      return `/expenses/${entityId}`;
    case "lead":
      return `/leads/${entityId}`;
    default:
      return null;
  }
}
