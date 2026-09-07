"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Flame,
  Activity,
  Award,
  Users,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { TeamAvailabilityBadge } from "@/components/team/team-availability-badge";
import { TeamWorkloadBadge } from "@/components/team/team-workload-badge";
import { TeamWorkloadBar } from "@/components/team/team-workload-bar";
import { TeamService } from "@/services/team.service";
import { TeamMemberWithDetails, SkillCategory } from "@/types/team";

export default function TeamAnalyticsPage() {
  const [members, setMembers] = useState<TeamMemberWithDetails[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedMembers, fetchedInsights] = await Promise.all([
        TeamService.getTeamMembers(),
        TeamService.getWorkloadBalancingInsights(),
      ]);

      setMembers(fetchedMembers);
      setInsights(fetchedInsights);
    } catch (err) {
      console.error("Failed to load workforce analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-36 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Aggregate Skills by Category
  const skillCategoryCount: Record<SkillCategory, number> = {
    Frontend: 0,
    Backend: 0,
    "UI/UX": 0,
    Database: 0,
    DevOps: 0,
    "Project Management": 0,
    Marketing: 0,
    Other: 0,
  };

  members.forEach((m) => {
    m.skills.forEach((s) => {
      if (skillCategoryCount[s.category] !== undefined) {
        skillCategoryCount[s.category]++;
      }
    });
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-600" />
          <span>Back to Team Directory</span>
        </Link>
      </div>

      {/* 2. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Workforce Analytics & Load Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Capacity & Utilization Matrix
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Real-time workload distribution, bandwidth availability, bottleneck detection, and engineering talent distribution across UXI.
          </p>
        </div>
      </div>

      {/* 3. AI Workload Balancing Recommendations */}
      <div className="rounded-xl border border-[#2451EB]/20 bg-[#EFF4FE] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#2451EB]" />
          <h3 className="text-sm font-bold text-[#0F172A]">
            Capacity Balancing Insights & Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-[#E6EAF2] text-xs text-[#0F172A]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2451EB] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Real-time Workload Load Balancer */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">Workload Load Distribution</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {members.length} Engineers
            </span>
          </div>

          <div className="space-y-4">
            {members.map((m) => (
              <div key={m.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={m.full_name} src={m.avatar_url} size="sm" />
                    <span className="text-xs font-bold text-slate-900">{m.full_name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">({m.role})</span>
                  </div>
                  <TeamWorkloadBadge status={m.workload_status} percentage={m.capacity_percentage} size="sm" />
                </div>

                <TeamWorkloadBar
                  assignedHours={m.active_tasks_count * 8}
                  capacityHours={m.weekly_capacity_hours}
                  percentage={m.capacity_percentage}
                  status={m.workload_status}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Skills Category Breakdown */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">Technical Skill Density</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">By Category</span>
          </div>

          <div className="space-y-3">
            {Object.entries(skillCategoryCount).map(([cat, count]) => {
              const maxSkills = Math.max(...Object.values(skillCategoryCount), 1);
              const percent = Math.round((count / maxSkills) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-mono text-slate-900 font-bold">{count} tagged</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
