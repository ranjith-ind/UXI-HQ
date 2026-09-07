"use client";

import React from "react";
import Link from "next/link";
import { UpcomingDeadline } from "@/types";
import { CalendarClock, AlertCircle, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DeadlinesWidgetProps {
  deadlines: UpcomingDeadline[];
}

export function DeadlinesWidget({ deadlines }: DeadlinesWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-display">
              Upcoming Deadlines
            </h3>
            <p className="text-xs text-slate-500">
              Critical deliverables due soon
            </p>
          </div>
        </div>

        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <span>All tasks</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Deadlines List */}
      <div className="mt-4 flex-1 space-y-2.5">
        {deadlines.map((item) => {
          const isUrgent = item.priority === "urgent" || item.daysRemaining <= 7;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    {item.projectName}
                  </p>
                </div>

                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                    isUrgent
                      ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                      : "bg-blue-50 text-blue-700 border border-blue-200/80"
                  }`}
                >
                  {item.daysRemaining} days left
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 font-medium">
                <span className="flex items-center gap-1">
                  <AlertCircle
                    className={`w-3 h-3 ${isUrgent ? "text-rose-500" : "text-amber-500"}`}
                  />
                  Priority: <span className="uppercase font-bold text-slate-700">{item.priority}</span>
                </span>
                <span>Due: {formatDate(item.dueDate)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
