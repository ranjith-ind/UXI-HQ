import React from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Send,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { LeadActivity, LeadActivityType } from "@/types/lead-activity";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface LeadActivityTimelineProps {
  activities: LeadActivity[];
}

const activityIcons: Record<
  LeadActivityType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  Note: { icon: FileText, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  Call: { icon: Phone, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  WhatsApp: { icon: MessageSquare, color: "text-green-700", bg: "bg-green-50 border-green-200" },
  Email: { icon: Mail, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  Meeting: { icon: Calendar, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  "Follow Up": { icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  "Status Change": { icon: Sparkles, color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
  "Proposal Sent": { icon: Send, color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  "Requirement Update": { icon: CheckCircle2, color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  Other: { icon: AlertCircle, color: "text-slate-700", bg: "bg-slate-100 border-slate-200" },
};

export function LeadActivityTimeline({ activities }: LeadActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs font-sans text-slate-400">
        No interaction history recorded yet. Add notes, calls, or meeting logs to track progress.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 font-sans">
      {activities.map((act) => {
        const config = activityIcons[act.activity_type] || activityIcons.Other;
        const Icon = config.icon;

        return (
          <div key={act.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-2xs ${config.bg} ${config.color}`}
            >
              <Icon className="w-3 h-3" />
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-display">{act.title}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {act.activity_type}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDate(act.activity_date || act.created_at)}
                </span>
              </div>

              {act.description && (
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {act.description}
                </p>
              )}

              {act.created_by && (
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
                  Logged by: {act.created_by}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
