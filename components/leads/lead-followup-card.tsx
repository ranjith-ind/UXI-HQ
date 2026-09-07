import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import { FollowUpType, LeadFollowUpWithDetails } from "@/types/lead-followup";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface LeadFollowUpCardProps {
  followUp: LeadFollowUpWithDetails;
  onComplete: (id: string) => void;
  onReschedule: (id: string, newDate: string) => void;
}

const typeIcons: Record<
  FollowUpType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  Call: { icon: Phone, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  WhatsApp: { icon: MessageSquare, color: "text-green-700", bg: "bg-green-50 border-green-200" },
  Email: { icon: Mail, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  Meeting: { icon: Calendar, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  Other: { icon: Clock, color: "text-slate-700", bg: "bg-slate-100 border-slate-200" },
};

export function LeadFollowUpCard({
  followUp,
  onComplete,
  onReschedule,
}: LeadFollowUpCardProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");

  const config = typeIcons[followUp.follow_up_type] || typeIcons.Other;
  const Icon = config.icon;

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    onReschedule(followUp.id, newDate);
    setIsRescheduling(false);
  };

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all space-y-3 font-sans ${
        followUp.is_overdue
          ? "border-rose-200 bg-rose-50/40"
          : followUp.is_due_today
          ? "border-amber-200 bg-amber-50/40"
          : followUp.status === "Completed"
          ? "border-slate-200 bg-slate-50/60 opacity-75"
          : "border-slate-200/90 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${config.bg} ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs font-display">
                {followUp.follow_up_type} Call
              </span>
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                  followUp.is_overdue
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : followUp.is_due_today
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : followUp.status === "Completed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {followUp.status === "Completed"
                  ? "Completed"
                  : followUp.is_overdue
                  ? "Overdue"
                  : followUp.is_due_today
                  ? "Due Today"
                  : "Scheduled"}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Due: {formatDate(followUp.follow_up_date)} ({formatRelativeTime(followUp.follow_up_date)})
            </p>
          </div>
        </div>

        {followUp.status === "Pending" && (
          <button
            onClick={() => onComplete(followUp.id)}
            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[11px] font-bold"
            title="Mark Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Complete</span>
          </button>
        )}
      </div>

      {/* Prospect & Company Link */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
        <div className="min-w-0">
          <Link
            href={`/leads/${followUp.lead_id}`}
            className="font-bold text-slate-900 hover:text-blue-600 truncate block font-display"
          >
            {followUp.lead_name}
          </Link>
          <p className="text-[10px] text-slate-500 truncate font-medium">
            {followUp.company_name || followUp.lead_code} • {followUp.lead_status}
          </p>
        </div>

        <Link
          href={`/leads/${followUp.lead_id}`}
          className="text-blue-600 hover:text-blue-700 p-1 font-bold"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Notes */}
      {followUp.notes && (
        <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 italic">
          &ldquo;{followUp.notes}&rdquo;
        </p>
      )}

      {/* Reschedule Drawer */}
      {isRescheduling ? (
        <form onSubmit={handleSaveReschedule} className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsRescheduling(false)}
            className="h-8 px-2 rounded-lg text-slate-500 hover:text-slate-700 text-xs"
          >
            Cancel
          </button>
        </form>
      ) : (
        followUp.status === "Pending" && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsRescheduling(true)}
              className="text-[11px] font-bold text-slate-500 hover:text-blue-600"
            >
              Reschedule Date
            </button>
          </div>
        )
      )}
    </div>
  );
}
