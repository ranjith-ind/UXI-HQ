"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  CheckSquare,
  FolderKanban,
  Zap,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskAssigneeSelector } from "./task-assignee-selector";
import {
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
  TASK_PRIORITY_LIST,
  TASK_STATUS_LIST,
} from "@/types/task";
import { ProjectWithDetails } from "@/types/project";
import { SprintWithDetails } from "@/types/sprint";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  projectsList: ProjectWithDetails[];
  sprintsList: SprintWithDetails[];
  initialData?: Task | null;
  defaultProjectId?: string;
  defaultSprintId?: string;
  mode?: "add" | "edit";
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  projectsList,
  sprintsList,
  initialData,
  defaultProjectId,
  defaultSprintId,
  mode = "add",
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    project_id: "",
    sprint_id: "",
    title: "",
    description: "",
    task_status: "To Do",
    priority: "Medium",
    progress: 0,
    estimated_hours: 8,
    actual_hours: 0,
    start_date: new Date().toISOString().split("T")[0],
    due_date: "",
    assignee_ids: ["tm-1-ranjith"],
    subtasks: [],
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        project_id: initialData.project_id || (projectsList[0]?.id || ""),
        sprint_id: initialData.sprint_id || "",
        title: initialData.title || "",
        description: initialData.description || "",
        task_status: initialData.task_status || "To Do",
        priority: initialData.priority || "Medium",
        progress: initialData.progress || 0,
        estimated_hours: Number(initialData.estimated_hours || 0),
        actual_hours: Number(initialData.actual_hours || 0),
        start_date: initialData.start_date || "",
        due_date: initialData.due_date || "",
        assignee_ids: ["tm-1-ranjith"],
        subtasks: [],
      });
    } else {
      setFormData({
        project_id: defaultProjectId || projectsList[0]?.id || "",
        sprint_id: defaultSprintId || "",
        title: "",
        description: "",
        task_status: "To Do",
        priority: "Medium",
        progress: 0,
        estimated_hours: 8,
        actual_hours: 0,
        start_date: new Date().toISOString().split("T")[0],
        due_date: "",
        assignee_ids: ["tm-1-ranjith"],
        subtasks: [],
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen, projectsList, defaultProjectId, defaultSprintId]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Task title is required.";
    if (!formData.project_id) newErrors.project_id = "Project association is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormData({
      ...formData,
      subtasks: [
        ...(formData.subtasks || []),
        { title: newSubtaskTitle.trim(), priority: "Medium" },
      ],
    });
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (index: number) => {
    setFormData({
      ...formData,
      subtasks: (formData.subtasks || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {mode === "add" ? "Create New Task" : "Edit Task"}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === "add"
                  ? "Assign work deliverables, sprints, and estimates"
                  : `Update specifications for ${formData.title || "Task"}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Implement Webhook Handlers for Stripe Payments"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <p className="text-[11px] text-rose-600 font-medium">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">
                Project <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">Select Project...</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name} ({p.project_code})
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.project_id}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Sprint (Optional)</label>
              <select
                value={formData.sprint_id || ""}
                onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">Backlog (No Sprint)</option>
                {sprintsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Status</label>
              <select
                value={formData.task_status}
                onChange={(e) => setFormData({ ...formData, task_status: e.target.value as TaskStatus })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {TASK_STATUS_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {TASK_PRIORITY_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Estimated Story Points / Hours</label>
              <Input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Due Date</label>
              <Input
                type="date"
                value={formData.due_date || ""}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          {/* Assignees */}
          <div className="pt-2 border-t border-slate-100">
            <TaskAssigneeSelector
              selectedIds={formData.assignee_ids || []}
              onChange={(ids) => setFormData({ ...formData, assignee_ids: ids })}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 font-display">Detailed Requirements & Scope</label>
            <textarea
              rows={3}
              placeholder="Provide technical context, acceptance criteria, test cases..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Subtasks (if add mode) */}
          {mode === "add" && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 font-display">Checklist / Subtasks (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a granular subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddSubtask}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add</span>
                </Button>
              </div>

              {(formData.subtasks || []).length > 0 && (
                <div className="space-y-1.5">
                  {formData.subtasks?.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="text-slate-800 font-medium">{sub.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/70">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
            className="font-bold shadow-sm"
          >
            {mode === "add" ? "Create Task" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
