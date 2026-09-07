"use client";

import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  TaskDueDateFilter,
  TaskPriority,
  TaskSortOption,
  TaskStatus,
  TASK_PRIORITY_LIST,
  TASK_STATUS_LIST,
} from "@/types/task";
import { ProjectWithDetails } from "@/types/project";
import { SprintWithDetails } from "@/types/sprint";
import { INITIAL_TEAM_MEMBERS } from "@/services/project.service";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: TaskStatus | "All";
  onStatusChange: (val: TaskStatus | "All") => void;
  priority: TaskPriority | "All";
  onPriorityChange: (val: TaskPriority | "All") => void;
  projectId: string;
  onProjectIdChange: (val: string) => void;
  teamMemberId: string;
  onTeamMemberIdChange: (val: string) => void;
  sprintId: string;
  onSprintIdChange: (val: string) => void;
  dueDateFilter: TaskDueDateFilter;
  onDueDateFilterChange: (val: TaskDueDateFilter) => void;
  sortBy: TaskSortOption;
  onSortByChange: (val: TaskSortOption) => void;
  projectsList: ProjectWithDetails[];
  sprintsList: SprintWithDetails[];
  totalCount: number;
}

const dueDateOptions: Array<{ id: TaskDueDateFilter; label: string }> = [
  { id: "all", label: "All Due Dates" },
  { id: "overdue", label: "Overdue Only" },
  { id: "due_today", label: "Due Today" },
  { id: "this_week", label: "Due This Week" },
  { id: "this_month", label: "Due This Month" },
  { id: "no_due_date", label: "No Due Date" },
];

const sortOptions: Array<{ id: TaskSortOption; label: string }> = [
  { id: "recently_created", label: "Recently Created" },
  { id: "oldest", label: "Oldest First" },
  { id: "due_date_nearest", label: "Due Date (Nearest)" },
  { id: "due_date_furthest", label: "Due Date (Furthest)" },
  { id: "priority_high", label: "Priority (High to Low)" },
  { id: "priority_low", label: "Priority (Low to High)" },
  { id: "progress_high", label: "Progress (High to Low)" },
  { id: "name_asc", label: "Task Title (A-Z)" },
];

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  projectId,
  onProjectIdChange,
  teamMemberId,
  onTeamMemberIdChange,
  sprintId,
  onSprintIdChange,
  dueDateFilter,
  onDueDateFilterChange,
  sortBy,
  onSortByChange,
  projectsList,
  sprintsList,
  totalCount,
}: TaskFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    search.length > 0 ||
    status !== "All" ||
    priority !== "All" ||
    projectId.length > 0 ||
    teamMemberId.length > 0 ||
    sprintId.length > 0 ||
    dueDateFilter !== "all" ||
    sortBy !== "recently_created";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("All");
    onPriorityChange("All");
    onProjectIdChange("");
    onTeamMemberIdChange("");
    onSprintIdChange("");
    onDueDateFilterChange("all");
    onSortByChange("recently_created");
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, sprint goals..."
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
              onChange={(e) => onSortByChange(e.target.value as TaskSortOption)}
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
          <span>All Tasks</span>
          {status === "All" && totalCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold font-tabular">
              {totalCount}
            </span>
          )}
        </button>

        {TASK_STATUS_LIST.map((st) => {
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
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Priority</label>
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "All")}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="All">All Priorities</option>
              {TASK_PRIORITY_LIST.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Project</label>
            <select
              value={projectId}
              onChange={(e) => onProjectIdChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="">All Projects</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} ({p.project_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Assignee</label>
            <select
              value={teamMemberId}
              onChange={(e) => onTeamMemberIdChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="">All Engineers</option>
              {INITIAL_TEAM_MEMBERS.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name} ({tm.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Due Date</label>
            <select
              value={dueDateFilter}
              onChange={(e) => onDueDateFilterChange(e.target.value as TaskDueDateFilter)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              {dueDateOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
