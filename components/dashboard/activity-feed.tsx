"use client";

import React from "react";
import Link from "next/link";
import { ActivityItem } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { Activity, ArrowUpRight, CheckCircle2, DollarSign, FolderKanban, UserPlus, Zap } from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const categoryIcons = {
  payment: { icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-200/80" },
  project: { icon: FolderKanban, color: "text-blue-600 bg-blue-50 border-blue-200/80" },
  task: { icon: CheckCircle2, color: "text-cyan-600 bg-cyan-50 border-cyan-200/80" },
  client: { icon: UserPlus, color: "text-purple-600 bg-purple-50 border-purple-200/80" },
  system: { icon: Zap, color: "text-amber-600 bg-amber-50 border-amber-200/80" },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-display">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500">
              Live updates across team operations
            </p>
          </div>
        </div>

        <Link
          href="/activity"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <span>Full log</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Activity Stream */}
      <div className="mt-4 flex-1 space-y-2.5">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((act) => {
            const config = categoryIcons[act.category] || categoryIcons.system;
            const Icon = config.icon;

            return (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <Avatar name={act.actorName} size="sm" className="mt-0.5" />

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="font-bold text-slate-900">{act.actorName}</span>{" "}
                  <span className="text-slate-500">{act.action}</span>{" "}
                  <span className="font-semibold text-blue-600">{act.targetName}</span>
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {act.category}
                  </span>
                </div>
              </div>

              <div className={`p-1.5 rounded-lg border shrink-0 ${config.color}`}>
                <Icon className="w-3 h-3" />
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
