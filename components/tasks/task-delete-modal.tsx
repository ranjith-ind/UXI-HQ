"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskWithDetails } from "@/types/task";
import { useAuth } from "@/hooks/use-auth";

interface TaskDeleteModalProps {
  task: TaskWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
}

export function TaskDeleteModal({
  task,
  isOpen,
  onClose,
  onConfirm,
}: TaskDeleteModalProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !task) return null;

  const canDelete = user?.role === "Admin" || user?.role === "Manager" || user?.role === "Developer";

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await onConfirm(task.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Delete Task?</h3>
              <p className="text-xs text-slate-500">Irreversible action</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete task{" "}
            <span className="font-bold text-slate-900">{task.title}</span>?
            All nested subtasks and assignees will be unlinked.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={deleting}
            className="font-bold"
          >
            Yes, Delete Task
          </Button>
        </div>
      </div>
    </div>
  );
}
