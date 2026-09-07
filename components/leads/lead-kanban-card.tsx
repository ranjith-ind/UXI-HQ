import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { LeadWithDetails } from "@/types/lead";
import { LeadPriorityBadge } from "./lead-priority-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LeadKanbanCardProps {
  lead: LeadWithDetails;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onConvert?: (lead: LeadWithDetails) => void;
}

export function LeadKanbanCard({ lead, onDragStart, onConvert }: LeadKanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className="group relative rounded-xl border border-[#E6EAF2] bg-white p-3.5 cursor-grab active:cursor-grabbing space-y-3 font-sans scalemorphic-card"
    >
      {/* Top row: Priority & Code */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono font-bold text-blue-600">
          {lead.lead_code}
        </span>
        <LeadPriorityBadge priority={lead.priority} size="sm" />
      </div>

      {/* Prospect Name & Company */}
      <div>
        <Link
          href={`/leads/${lead.id}`}
          className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate font-display"
        >
          {lead.full_name}
        </Link>
        {lead.company_name && (
          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
            {lead.company_name}
          </p>
        )}
      </div>

      {/* Service Interest Pill */}
      <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold truncate max-w-full">
        {lead.service_interest}
      </div>

      {/* Deal Value & Probability */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Deal Value</span>
          <span className="font-extrabold text-slate-900 font-mono">
            {lead.estimated_value ? formatCurrency(lead.estimated_value, "INR") : "—"}
          </span>
        </div>

        {lead.probability !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Probability</span>
            <span className="font-bold text-blue-600 font-mono">
              {lead.probability}%
            </span>
          </div>
        )}
      </div>

      {/* Bottom Follow-Up & Owner Bar */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          {lead.next_follow_up_date ? (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                lead.is_followup_overdue
                  ? "text-rose-600 font-bold"
                  : "text-slate-500"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{formatDate(lead.next_follow_up_date)}</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">No follow-up</span>
          )}
        </div>

        {lead.assigned_member_name ? (
          <Avatar name={lead.assigned_member_name} size="sm" />
        ) : (
          <span className="text-[10px] text-slate-400">Unassigned</span>
        )}
      </div>
    </div>
  );
}
