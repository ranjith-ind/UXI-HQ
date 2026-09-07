"use client";

import React, { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Subtask, TaskPriority } from "@/types/task";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskService } from "@/services/task.service";
import { cn } from "@/lib/utils";

interface SubtaskListProps {
  parentTaskId: string;
  subtasks: Subtask[];
  onSubtasksChange: () => void;
  canEdit?: boolean;
}

export function SubtaskList({
  parentTaskId,
  subtasks,
  onSubtasksChange,
  canEdit = true,
}: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("Medium");
  const [isAdding, setIsAdding] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const completedCount = subtasks.filter((s) => s.task_status === "Completed").length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleToggleSubtask = async (subtask: Subtask) => {
    setLoadingId(subtask.id);
    try {
      const nextStatus = subtask.task_status === "Completed" ? "To Do" : "Completed";
      await TaskService.updateSubtaskStatus(subtask.id, nextStatus);
      onSubtasksChange();
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await TaskService.createSubtask(parentTaskId, newTitle.trim(), newPriority);
      setNewTitle("");
      setIsAdding(false);
      onSubtasksChange();
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await TaskService.deleteSubtask(subtaskId);
      onSubtasksChange();
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 font-display">
            Subtasks ({completedCount}/{subtasks.length})
          </h4>
          <p className="text-[11px] text-slate-500 font-medium">Granular work deliverables checklist</p>
        </div>

        {subtasks.length > 0 && (
          <span className="text-xs font-mono font-bold text-blue-600">
            {progressPercent}% Complete
          </span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Subtask items list */}
      <div className="space-y-2">
        {subtasks.map((sub) => {
          const isDone = sub.task_status === "Completed";
          const isLoading = loadingId === sub.id;

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors group"
            >
              <button
                type="button"
                onClick={() => handleToggleSubtask(sub)}
                disabled={!canEdit || isLoading}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-blue-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium truncate",
                    isDone ? "line-through text-slate-400 font-normal" : "text-slate-900 font-semibold"
                  )}
                >
                  {sub.title}
                </span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <TaskPriorityBadge priority={sub.priority} size="sm" showIcon={false} />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subtask Form */}
      {canEdit && (
        <>
          {isAdding ? (
            <form onSubmit={handleAddSubtask} className="p-3 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
              <input
                type="text"
                placeholder="Enter subtask deliverable description..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
                  >
                    Add Subtask
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-xs font-bold text-blue-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subtask</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
