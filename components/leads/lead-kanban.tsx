import React, { useState } from "react";
import { PIPELINE_STAGES, LeadStatus, LeadWithDetails } from "@/types/lead";
import { LeadKanbanCard } from "./lead-kanban-card";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

interface LeadKanbanProps {
  leads: LeadWithDetails[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onConvert?: (lead: LeadWithDetails) => void;
  onAddLead?: (defaultStage?: LeadStatus) => void;
}

const stageStyles: Record<
  LeadStatus,
  { label: string; headerColor: string; badgeColor: string; countBadge: string }
> = {
  New: {
    label: "New",
    headerColor: "text-blue-700",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    countBadge: "bg-blue-100 text-blue-800",
  },
  Contacted: {
    label: "Contacted",
    headerColor: "text-sky-700",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    countBadge: "bg-sky-100 text-sky-800",
  },
  Qualified: {
    label: "Qualified",
    headerColor: "text-indigo-700",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    countBadge: "bg-indigo-100 text-indigo-800",
  },
  Discussion: {
    label: "Discussion",
    headerColor: "text-purple-700",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    countBadge: "bg-purple-100 text-purple-800",
  },
  "Requirement Gathering": {
    label: "Requirements",
    headerColor: "text-violet-700",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    countBadge: "bg-violet-100 text-violet-800",
  },
  "Proposal Sent": {
    label: "Proposal Sent",
    headerColor: "text-amber-700",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    countBadge: "bg-amber-100 text-amber-800",
  },
  Negotiation: {
    label: "Negotiation",
    headerColor: "text-orange-700",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    countBadge: "bg-orange-100 text-orange-800",
  },
  Won: {
    label: "Won",
    headerColor: "text-emerald-700",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    countBadge: "bg-emerald-100 text-emerald-800",
  },
  Lost: {
    label: "Lost",
    headerColor: "text-rose-700",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    countBadge: "bg-rose-100 text-rose-800",
  },
  "On Hold": {
    label: "On Hold",
    headerColor: "text-slate-700",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    countBadge: "bg-slate-200 text-slate-800",
  },
};

export function LeadKanban({
  leads,
  onStatusChange,
  onConvert,
  onAddLead,
}: LeadKanbanProps) {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStatus) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (leadId) {
      onStatusChange(leadId, stage);
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 font-sans">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.lead_status === stage);
        const stageValue = stageLeads.reduce(
          (sum, l) => sum + (l.estimated_value || 0),
          0
        );
        const style = stageStyles[stage] || stageStyles.New;
        const isTarget = dragOverStage === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
            className={`flex flex-col min-w-[280px] max-w-[280px] rounded-2xl border transition-all duration-200 ${
              isTarget
                ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
                : "border-slate-200/90 bg-slate-50/50"
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/80 space-y-1.5 bg-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-display ${style.headerColor}`}>
                    {style.label}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${style.countBadge}`}>
                    {stageLeads.length}
                  </span>
                </div>

                {onAddLead && (
                  <button
                    onClick={() => onAddLead(stage)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title={`Add deal to ${stage}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-medium">
                <span>Value:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(stageValue, "INR")}
                </span>
              </div>
            </div>

            {/* Droppable Card Container */}
            <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[160px]">
              {stageLeads.map((lead) => (
                <LeadKanbanCard
                  key={lead.id}
                  lead={lead}
                  onDragStart={handleDragStart}
                  onConvert={onConvert}
                />
              ))}

              {stageLeads.length === 0 && (
                <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-400 italic">No deals in stage</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
