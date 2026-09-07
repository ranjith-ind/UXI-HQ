"use client";

import React, { useState } from "react";
import { Archive, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectWithDetails } from "@/types/project";

interface ProjectArchiveModalProps {
  project: ProjectWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (projectId: string) => Promise<void>;
}

export function ProjectArchiveModal({
  project,
  isOpen,
  onClose,
  onConfirm,
}: ProjectArchiveModalProps) {
  const [archiving, setArchiving] = useState(false);

  if (!isOpen || !project) return null;

  const isArchived = project.is_archived;

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await onConfirm(project.id);
      onClose();
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {isArchived ? "Restore Project?" : "Archive Project?"}
              </h3>
              <p className="text-xs text-slate-500">
                {isArchived
                  ? "Reactivate project in the main directory"
                  : "Hide from active views while preserving all data"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            {isArchived ? (
              <>
                Project <span className="font-bold text-slate-900">{project.project_name}</span>{" "}
                will be restored to your active project pipelines.
              </>
            ) : (
              <>
                Project <span className="font-bold text-slate-900">{project.project_name}</span>{" "}
                will be archived. It will be hidden from daily views and sprint boards, but all tasks, financial ledgers, and logs are preserved.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={archiving}>
            Cancel
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleArchive}
            isLoading={archiving}
            className="font-bold"
          >
            {isArchived ? "Restore Project" : "Archive Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
