"use client";

import React from "react";
import { FolderPlus, FolderKanban, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectEmptyStateProps {
  isFiltered?: boolean;
  onAddProject: () => void;
  onResetFilters?: () => void;
}

export function ProjectEmptyState({
  isFiltered = false,
  onAddProject,
  onResetFilters,
}: ProjectEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 mb-4">
          <FolderKanban className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 font-display">No projects match your filter</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Try adjusting your search criteria, clearing status tabs, or removing priority filters.
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters} className="mt-5">
            Reset all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
      <div className="relative mb-5">
        <div className="relative w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <FolderKanban className="w-8 h-8" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700 mb-3">
        <Sparkles className="w-3 h-3 text-blue-600" />
        <span>UXI Project Engineering</span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
        No projects yet
      </h3>

      <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed font-sans">
        Create your first project and start managing your workflow from one place. Track deliverables, deadlines, client payments, and assigned team members.
      </p>

      <Button
        variant="default"
        size="lg"
        onClick={onAddProject}
        className="mt-6 gap-2 shadow-sm font-semibold"
      >
        <FolderPlus className="w-4 h-4" />
        <span>Create First Project</span>
      </Button>
    </div>
  );
}
