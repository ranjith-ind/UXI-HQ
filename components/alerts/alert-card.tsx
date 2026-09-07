"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { BusinessAlertWithDetails, AlertSeverity } from "@/types/alert";
import { formatRelativeTime } from "@/lib/utils";

interface AlertCardProps {
  alert: BusinessAlertWithDetails;
  onResolve: (id: string) => Promise<void>;
}

export function AlertCard({ alert, onResolve }: AlertCardProps) {
  const SeverityIcon = getSeverityIcon(alert.severity);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all font-sans text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        alert.is_resolved
          ? "border-slate-200 bg-slate-50/60 opacity-60"
          : alert.severity === "Critical"
          ? "border-rose-200 bg-rose-50/40 shadow-xs"
          : alert.severity === "Warning"
          ? "border-amber-200 bg-amber-50/40 shadow-xs"
          : "border-blue-200 bg-blue-50/30"
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 shadow-2xs ${getSeverityBadgeStyles(alert.severity)}`}>
          <SeverityIcon className="w-4 h-4" />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-xs font-display">
              {alert.title}
            </span>
            <span className={`px-2 py-0.2 rounded text-[10px] border font-bold ${getSeverityBadgeStyles(alert.severity)}`}>
              {alert.severity}
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
              {alert.alert_type}
            </span>
            {alert.is_resolved && (
              <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Resolved
              </span>
            )}
          </div>

          {alert.description && (
            <p className="text-slate-600 text-xs leading-relaxed font-normal">
              {alert.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Detected {formatRelativeTime(alert.created_at)}</span>
            </div>
            {alert.entity_type && (
              <span className="font-semibold text-slate-500 font-display">
                Entity: {alert.entity_type}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {alert.action_url && (
          <Link
            href={alert.action_url}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          >
            <span>Resolve Action</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {!alert.is_resolved && (
          <button
            onClick={() => onResolve(alert.id)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-semibold"
            title="Mark issue resolved"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resolve</span>
          </button>
        )}
      </div>
    </div>
  );
}

function getSeverityIcon(sev: AlertSeverity) {
  switch (sev) {
    case "Critical":
      return AlertCircle;
    case "Warning":
      return AlertTriangle;
    case "Info":
    default:
      return Info;
  }
}

function getSeverityBadgeStyles(sev: AlertSeverity) {
  switch (sev) {
    case "Critical":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "Warning":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Info":
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}
