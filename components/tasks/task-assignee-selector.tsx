"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { TeamService } from "@/services/team.service";
import { TeamMemberWithDetails } from "@/types/team";
import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskAssigneeSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TaskAssigneeSelector({
  selectedIds,
  onChange,
}: TaskAssigneeSelectorProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithDetails[]>([]);

  useEffect(() => {
    TeamService.getTeamMembers().then(setTeamMembers);
  }, []);

  const toggleMember = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-display">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Task Assignees ({selectedIds.length} selected)</span>
        </label>
        <span className="text-[11px] text-slate-500 font-medium">Intelligent capacity balancing</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {teamMembers.map((member) => {
          const isSelected = selectedIds.includes(member.id);
          const isOverloaded = member.workload_status === "Overloaded";

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => toggleMember(member.id)}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all duration-150 group shadow-2xs",
                isSelected
                  ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
                  : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              <Avatar
                name={member.full_name}
                src={member.avatar_url}
                size="md"
                className="shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate font-display">
                    {member.full_name}
                  </p>
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                    {member.role}
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                  {member.designation}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded border text-[9px] font-bold",
                      isOverloaded
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    )}
                  >
                    {member.active_tasks_count} tasks ({member.capacity_percentage}%)
                  </span>

                  <span
                    className={cn(
                      "text-[9px] font-semibold",
                      member.availability_status === "Available"
                        ? "text-emerald-700"
                        : member.availability_status === "Busy"
                        ? "text-amber-700"
                        : "text-slate-500"
                    )}
                  >
                    {member.availability_status}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
