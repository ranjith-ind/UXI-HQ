"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { TeamService } from "@/services/team.service";
import { TeamMemberWithDetails, TeamStats } from "@/types/team";
import { Avatar } from "@/components/ui/avatar";
import { TeamAvailabilityBadge } from "@/components/team/team-availability-badge";

export function TeamSnapshot() {
  const [members, setMembers] = useState<TeamMemberWithDetails[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);

  useEffect(() => {
    Promise.all([TeamService.getTeamMembers(), TeamService.getStats()]).then(
      ([mList, sList]) => {
        setMembers(mList);
        setStats(sList);
      }
    );
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Workforce Snapshot</h3>
            <p className="text-xs text-slate-500">Live capacity & active assignments</p>
          </div>
        </div>

        <Link
          href="/team"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
        >
          <span>View Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Available</span>
          <span className="text-base font-extrabold text-emerald-700 mt-0.5 block font-display">
            {stats?.availableNow ?? 2} Engineers
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Active Tasks</span>
          <span className="text-base font-extrabold text-blue-700 mt-0.5 block font-display">
            {stats?.totalActiveTasks ?? 7} Tasks
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block font-display">Overloaded</span>
          <span className="text-base font-extrabold text-slate-700 mt-0.5 block font-display">
            {stats?.overloadedMembers ?? 0} Members
          </span>
        </div>
      </div>

      {/* Member mini list */}
      <div className="space-y-2 pt-1">
        {members.slice(0, 4).map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={m.full_name} src={m.avatar_url} size="sm" />
              <span className="font-bold text-slate-900 truncate">{m.full_name}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500 font-medium">{m.active_tasks_count} tasks</span>
              <TeamAvailabilityBadge status={m.availability_status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
