"use client";

import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  Archive,
} from "lucide-react";
import {
  DeadlineFilterOption,
  ProjectPriority,
  ProjectSortOption,
  ProjectStatus,
  ProjectType,
  PROJECT_PRIORITY_LIST,
  PROJECT_STATUS_LIST,
  PROJECT_TYPES_LIST,
} from "@/types/project";
import { ClientWithDetails } from "@/types/client";
import { INITIAL_TEAM_MEMBERS } from "@/services/project.service";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: ProjectStatus | "All";
  onStatusChange: (val: ProjectStatus | "All") => void;
  priority: ProjectPriority | "All";
  onPriorityChange: (val: ProjectPriority | "All") => void;
  projectType: ProjectType | "All";
  onProjectTypeChange: (val: ProjectType | "All") => void;
  deadlineFilter: DeadlineFilterOption;
  onDeadlineFilterChange: (val: DeadlineFilterOption) => void;
  clientId: string;
  onClientIdChange: (val: string) => void;
  teamMemberId: string;
  onTeamMemberIdChange: (val: string) => void;
  isArchived: boolean;
  onIsArchivedChange: (val: boolean) => void;
  sortBy: ProjectSortOption;
  onSortByChange: (val: ProjectSortOption) => void;
  clientsList: ClientWithDetails[];
  totalCount: number;
}

const deadlineOptions: Array<{ id: DeadlineFilterOption; label: string }> = [
  { id: "all", label: "All Deadlines" },
  { id: "overdue", label: "Overdue Only" },
  { id: "due_today", label: "Due Today" },
  { id: "this_week", label: "Due This Week" },
  { id: "this_month", label: "Due This Month" },
  { id: "no_deadline", label: "No Deadline Set" },
];

const sortOptions: Array<{ id: ProjectSortOption; label: string }> = [
  { id: "recently_created", label: "Recently Created" },
  { id: "oldest", label: "Oldest First" },
  { id: "deadline_nearest", label: "Deadline (Nearest)" },
  { id: "deadline_furthest", label: "Deadline (Furthest)" },
  { id: "name_asc", label: "Project Name (A-Z)" },
  { id: "name_desc", label: "Project Name (Z-A)" },
  { id: "highest_budget", label: "Highest Budget" },
  { id: "lowest_budget", label: "Lowest Budget" },
];

export function ProjectFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  projectType,
  onProjectTypeChange,
  deadlineFilter,
  onDeadlineFilterChange,
  clientId,
  onClientIdChange,
  teamMemberId,
  onTeamMemberIdChange,
  isArchived,
  onIsArchivedChange,
  sortBy,
  onSortByChange,
  clientsList,
  totalCount,
}: ProjectFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    search.length > 0 ||
    status !== "All" ||
    priority !== "All" ||
    projectType !== "All" ||
    deadlineFilter !== "all" ||
    clientId.length > 0 ||
    teamMemberId.length > 0 ||
    isArchived ||
    sortBy !== "recently_created";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("All");
    onPriorityChange("All");
    onProjectTypeChange("All");
    onDeadlineFilterChange("all");
    onClientIdChange("");
    onTeamMemberIdChange("");
    onIsArchivedChange(false);
    onSortByChange("recently_created");
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by project name, code (UXI-...), client, tech..."
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

        {/* Sort & Advanced Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-[#8A93A3] pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as ProjectSortOption)}
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

          <button
            onClick={() => onIsArchivedChange(!isArchived)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-all scalemorphic-button",
              isArchived
                ? "bg-purple-50 text-purple-700 border-purple-200 font-semibold"
                : "bg-white text-[#5B6472] border-[#E6EAF2] hover:bg-[#F7F9FC]"
            )}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
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
          <span>All Projects</span>
          {status === "All" && totalCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold font-tabular">
              {totalCount}
            </span>
          )}
        </button>

        {PROJECT_STATUS_LIST.map((st) => {
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

      {/* Advanced Dropdown Controls */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2">
          {/* Priority */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Priority</label>
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value as ProjectPriority | "All")}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="All">All Priorities</option>
              {PROJECT_PRIORITY_LIST.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Type</label>
            <select
              value={projectType}
              onChange={(e) => onProjectTypeChange(e.target.value as ProjectType | "All")}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="All">All Types</option>
              {PROJECT_TYPES_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Client */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Client</label>
            <select
              value={clientId}
              onChange={(e) => onClientIdChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="">All Clients</option>
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} {c.company_name ? `(${c.company_name})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Team Lead */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Lead Engineer</label>
            <select
              value={teamMemberId}
              onChange={(e) => onTeamMemberIdChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="">All Team Leads</option>
              {INITIAL_TEAM_MEMBERS.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name} ({tm.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
