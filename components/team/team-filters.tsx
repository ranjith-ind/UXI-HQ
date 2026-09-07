"use client";

import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  AvailabilityStatus,
  EmploymentType,
  MemberStatus,
  TeamSortOption,
  TeamWorkloadFilter,
  AVAILABILITY_STATUS_LIST,
  EMPLOYMENT_TYPE_LIST,
  MEMBER_STATUS_LIST,
} from "@/types/team";
import { cn } from "@/lib/utils";

interface TeamFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: MemberStatus | "All";
  onStatusChange: (val: MemberStatus | "All") => void;
  availability: AvailabilityStatus | "All";
  onAvailabilityChange: (val: AvailabilityStatus | "All") => void;
  employmentType: EmploymentType | "All";
  onEmploymentTypeChange: (val: EmploymentType | "All") => void;
  role: string;
  onRoleChange: (val: string) => void;
  workload: TeamWorkloadFilter;
  onWorkloadChange: (val: TeamWorkloadFilter) => void;
  sortBy: TeamSortOption;
  onSortByChange: (val: TeamSortOption) => void;
  totalCount: number;
}

const workloadOptions: Array<{ id: TeamWorkloadFilter; label: string }> = [
  { id: "all", label: "All Workloads" },
  { id: "normal", label: "Normal Load (0–59%)" },
  { id: "high_load", label: "High Load (60–89%)" },
  { id: "near_capacity", label: "Near Capacity (90–99%)" },
  { id: "overloaded", label: "Overloaded (100%+)" },
];

const sortOptions: Array<{ id: TeamSortOption; label: string }> = [
  { id: "name_asc", label: "Name (A-Z)" },
  { id: "workload_desc", label: "Highest Workload %" },
  { id: "workload_asc", label: "Lowest Workload %" },
  { id: "tasks_desc", label: "Most Active Tasks" },
  { id: "projects_desc", label: "Most Assigned Projects" },
  { id: "recently_joined", label: "Recently Joined" },
];

export function TeamFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  availability,
  onAvailabilityChange,
  employmentType,
  onEmploymentTypeChange,
  role,
  onRoleChange,
  workload,
  onWorkloadChange,
  sortBy,
  onSortByChange,
  totalCount,
}: TeamFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    search.length > 0 ||
    status !== "All" ||
    availability !== "All" ||
    employmentType !== "All" ||
    role.length > 0 ||
    workload !== "all" ||
    sortBy !== "name_asc";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("All");
    onAvailabilityChange("All");
    onEmploymentTypeChange("All");
    onRoleChange("");
    onWorkloadChange("all");
    onSortByChange("name_asc");
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            placeholder="Search engineers by name, email, designation, skills..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] pl-10 pr-9 text-xs text-[#0F172A] placeholder:text-[#8A93A3] focus:outline-none focus:border-[#2451EB] focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A93A3] hover:text-[#0F172A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-[#8A93A3] pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as TeamSortOption)}
              className="h-9 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] pl-8 pr-8 text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] focus:bg-white cursor-pointer appearance-none transition-all"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-white text-[#0F172A]">
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-all scalemorphic-button",
              showAdvanced
                ? "bg-[#EFF4FE] text-[#2451EB] border-[#2451EB]/30 font-semibold"
                : "bg-white text-[#5B6472] border-[#E6EAF2] hover:bg-[#F7F9FC]"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E6EAF2] pb-2">
        <button
          onClick={() => onStatusChange("All")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 scalemorphic-button",
            status === "All"
              ? "bg-[#2451EB] text-white font-semibold"
              : "bg-white text-[#5B6472] hover:bg-[#F7F9FC] hover:text-[#0F172A] border border-[#E6EAF2]"
          )}
        >
          <span>All Members</span>
          {status === "All" && totalCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold font-tabular">
              {totalCount}
            </span>
          )}
        </button>

        {MEMBER_STATUS_LIST.map((st) => {
          const isSelected = status === st;
          return (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 scalemorphic-button",
                isSelected
                  ? "bg-[#2451EB] text-white font-semibold"
                  : "bg-white text-[#5B6472] hover:bg-[#F7F9FC] hover:text-[#0F172A] border border-[#E6EAF2]"
              )}
            >
              {st}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Availability</label>
            <select
              value={availability}
              onChange={(e) => onAvailabilityChange(e.target.value as AvailabilityStatus | "All")}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="All">All Availability</option>
              {AVAILABILITY_STATUS_LIST.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Workload Load</label>
            <select
              value={workload}
              onChange={(e) => onWorkloadChange(e.target.value as TeamWorkloadFilter)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              {workloadOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => onEmploymentTypeChange(e.target.value as EmploymentType | "All")}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="All">All Types</option>
              {EMPLOYMENT_TYPE_LIST.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Role</label>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="QA">QA Engineer</option>
              <option value="Contractor">Contractor</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
