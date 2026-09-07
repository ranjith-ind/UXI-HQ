import React from "react";
import { Search, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import {
  ALL_LEAD_STATUSES,
  LEAD_PRIORITIES_LIST,
  LEAD_SOURCES_LIST,
  SERVICE_INTERESTS_LIST,
  LeadPriority,
  LeadQuickFilter,
  LeadSortOption,
  LeadSource,
  LeadStatus,
  ServiceInterest,
} from "@/types/lead";
import { TeamMember } from "@/types/team";
import { cn } from "@/lib/utils";

interface LeadFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: LeadStatus | "All";
  onStatusChange: (val: LeadStatus | "All") => void;
  source: string;
  onSourceChange: (val: string) => void;
  service: string;
  onServiceChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  assignedTo: string;
  onAssignedToChange: (val: string) => void;
  quickFilter: LeadQuickFilter;
  onQuickFilterChange: (val: LeadQuickFilter) => void;
  sortBy: LeadSortOption;
  onSortByChange: (val: LeadSortOption) => void;
  teamMembers: TeamMember[];
  viewMode: "table" | "kanban";
  onViewModeChange: (val: "table" | "kanban") => void;
}

export function LeadFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  service,
  onServiceChange,
  priority,
  onPriorityChange,
  assignedTo,
  onAssignedToChange,
  quickFilter,
  onQuickFilterChange,
  sortBy,
  onSortByChange,
  teamMembers,
  viewMode,
  onViewModeChange,
}: LeadFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const quickFilters: { id: LeadQuickFilter; label: string }[] = [
    { id: "all", label: "All Leads" },
    { id: "my_leads", label: "My Leads" },
    { id: "high_value", label: "High Value" },
    { id: "due_today", label: "Due Today" },
    { id: "overdue_followups", label: "Overdue Follow-ups" },
    { id: "won", label: "Won Deals" },
    { id: "unassigned", label: "Unassigned" },
  ];

  const isFiltered =
    search !== "" ||
    status !== "All" ||
    source !== "all" ||
    service !== "all" ||
    priority !== "all" ||
    assignedTo !== "all" ||
    quickFilter !== "all" ||
    sortBy !== "recently_created";

  const handleReset = () => {
    onSearchChange("");
    onStatusChange("All");
    onSourceChange("all");
    onServiceChange("all");
    onPriorityChange("all");
    onAssignedToChange("all");
    onQuickFilterChange("all");
    onSortByChange("recently_created");
  };

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads by contact name, company, email, or requirements..."
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

        {/* View Switcher and Quick Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Table / Kanban View Toggle */}
          <div className="flex items-center rounded-lg bg-[#F7F9FC] p-1 border border-[#E6EAF2]">
            <button
              onClick={() => onViewModeChange("table")}
              className={cn(
                "p-1.5 rounded-md transition-all scalemorphic-button",
                viewMode === "table"
                  ? "bg-[#2451EB] text-white font-semibold"
                  : "text-[#5B6472] hover:text-[#0F172A]"
              )}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("kanban")}
              className={cn(
                "p-1.5 rounded-md transition-all scalemorphic-button",
                viewMode === "kanban"
                  ? "bg-[#2451EB] text-white font-semibold"
                  : "text-[#5B6472] hover:text-[#0F172A]"
              )}
              title="Kanban Pipeline"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as LeadSortOption)}
            className="h-9 px-3 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2451EB] cursor-pointer"
          >
            <option value="recently_created">Recently Created</option>
            <option value="recently_updated">Recently Updated</option>
            <option value="highest_value">Highest Value</option>
            <option value="lowest_value">Lowest Value</option>
            <option value="next_followup">Upcoming Follow-Up</option>
            <option value="company_name_asc">Company Name (A-Z)</option>
          </select>

          {/* More Filters Toggle */}
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

          {/* Reset */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Segmented Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E6EAF2] pb-2">
        {quickFilters.map((qf) => {
          const isSelected = quickFilter === qf.id;
          return (
            <button
              key={qf.id}
              onClick={() => onQuickFilterChange(qf.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 scalemorphic-button",
                isSelected
                  ? "bg-[#2451EB] text-white font-semibold"
                  : "bg-white text-[#5B6472] hover:bg-[#F7F9FC] hover:text-[#0F172A] border border-[#E6EAF2]"
              )}
            >
              {qf.label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filters Drawer */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Stage / Status</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as LeadStatus | "All")}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Pipeline Stages</option>
              {ALL_LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Lead Source</label>
            <select
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Lead Sources</option>
              {LEAD_SOURCES_LIST.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Service Required</label>
            <select
              value={service}
              onChange={(e) => onServiceChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Service Lines</option>
              {SERVICE_INTERESTS_LIST.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 font-display">Deal Owner</label>
            <select
              value={assignedTo}
              onChange={(e) => onAssignedToChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Team Members</option>
              <option value="unassigned">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
