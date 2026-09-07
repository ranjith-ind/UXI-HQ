"use client";

import React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Mail,
  Building,
  CheckSquare,
  FolderKanban,
  Edit2,
  Trash2,
  Eye,
  Activity,
  ArrowRight,
} from "lucide-react";
import { TeamMemberWithDetails } from "@/types/team";
import { Avatar } from "@/components/ui/avatar";
import { TeamAvailabilityBadge } from "./team-availability-badge";
import { TeamWorkloadBadge } from "./team-workload-badge";
import { TeamWorkloadBar } from "./team-workload-bar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
  member: TeamMemberWithDetails;
  onEdit: (member: TeamMemberWithDetails) => void;
  onDelete: (member: TeamMemberWithDetails) => void;
  onQuickAvailabilityChange: (member: TeamMemberWithDetails) => void;
}

export function TeamMemberCard({
  member,
  onEdit,
  onDelete,
  onQuickAvailabilityChange,
}: TeamMemberCardProps) {
  return (
    <div className="group relative rounded-xl border border-[#E6EAF2] bg-white p-5 flex flex-col justify-between scalemorphic-card">
      <div>
        {/* Header: Avatar + Name + Badges + Dropdown */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <Link href={`/team/${member.id}`} className="shrink-0">
              <Avatar
                name={member.full_name}
                src={member.avatar_url}
                size="lg"
                className="ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/team/${member.id}`}
                  className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate block font-display"
                >
                  {member.full_name}
                </Link>
                {member.is_founder && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    Founder
                  </span>
                )}
              </div>

              <p className="text-xs text-blue-600 font-semibold truncate mt-0.5">
                {member.designation}
              </p>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                <span className="truncate">{member.department}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[10px] text-slate-600 font-semibold">{member.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <TeamAvailabilityBadge status={member.availability_status} size="sm" />

            <Dropdown
              align="right"
              trigger={
                <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
            >
              <Link href={`/team/${member.id}`}>
                <DropdownItem>
                  <Eye className="w-3.5 h-3.5 text-blue-600 mr-2" />
                  <span>View Full Profile</span>
                </DropdownItem>
              </Link>
              <DropdownItem onClick={() => onQuickAvailabilityChange(member)}>
                <Activity className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                <span>Change Availability</span>
              </DropdownItem>
              <DropdownItem onClick={() => onEdit(member)}>
                <Edit2 className="w-3.5 h-3.5 text-slate-500 mr-2" />
                <span>Edit Member</span>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => onDelete(member)} destructive>
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                <span>Deactivate / Delete</span>
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Email & Contact */}
        <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>

        {/* Workload Capacity Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 font-display">Workforce Capacity</span>
            <TeamWorkloadBadge
              status={member.workload_status}
              percentage={member.capacity_percentage}
              size="sm"
            />
          </div>

          <TeamWorkloadBar
            assignedHours={member.active_tasks_count * 8}
            capacityHours={member.weekly_capacity_hours || 40}
            percentage={member.capacity_percentage}
            status={member.workload_status}
            showLabels={false}
            size="sm"
          />
        </div>

        {/* Skills Tags Strip */}
        {member.skills && member.skills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {member.skills.slice(0, 4).map((skill: any, idx: number) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200"
              >
                {typeof skill === "string" ? skill : skill.skill_name}
              </span>
            ))}
            {member.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200">
                +{member.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats & Profile Link */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <strong className="text-slate-900">{member.active_tasks_count}</strong> active
          </div>
          <div className="flex items-center gap-1">
            <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
            <strong className="text-slate-900">{member.active_projects_count}</strong> projects
          </div>
        </div>

        <Link
          href={`/team/${member.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
