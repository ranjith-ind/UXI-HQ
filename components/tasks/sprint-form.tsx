"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprint, SprintFormData, SprintStatus } from "@/types/sprint";
import { ProjectWithDetails } from "@/types/project";

interface SprintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SprintFormData) => Promise<void>;
  projectsList: ProjectWithDetails[];
  initialData?: Sprint | null;
  mode?: "add" | "edit";
}

export function SprintForm({
  isOpen,
  onClose,
  onSubmit,
  projectsList,
  initialData,
  mode = "add",
}: SprintFormProps) {
  const [formData, setFormData] = useState<SprintFormData>({
    project_id: "",
    name: "",
    goal: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    sprint_status: "Planned",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        project_id: initialData.project_id,
        name: initialData.name,
        goal: initialData.goal || "",
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        sprint_status: initialData.sprint_status,
      });
    } else {
      const today = new Date();
      const nextTwoWeeks = new Date(today);
      nextTwoWeeks.setDate(today.getDate() + 14);

      setFormData({
        project_id: projectsList[0]?.id || "",
        name: "",
        goal: "",
        start_date: today.toISOString().split("T")[0],
        end_date: nextTwoWeeks.toISOString().split("T")[0],
        sprint_status: "Planned",
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen, projectsList]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Sprint name is required.";
    if (!formData.project_id) newErrors.project_id = "Project association is required.";
    if (!formData.start_date) newErrors.start_date = "Start date is required.";
    if (!formData.end_date) newErrors.end_date = "End date is required.";
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = "End date cannot be earlier than start date.";
    }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {mode === "add" ? "Create New Sprint" : "Edit Sprint"}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === "add"
                  ? "Define sprint goals, duration, and target deliverables"
                  : `Update specifications for ${formData.name}`}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">
              Sprint Name <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Sprint 04 - Core Auth & Payments"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-[11px] text-rose-600 font-medium">{errors.name}</p>}
          </div>

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
            <label className="text-xs font-bold text-slate-700 font-display">Sprint Goal</label>
            <textarea
              rows={3}
              placeholder="What is the objective of this sprint iteration?"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Start Date</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">End Date</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
              {errors.end_date && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">Status</label>
            <select
              value={formData.sprint_status}
              onChange={(e) => setFormData({ ...formData, sprint_status: e.target.value as SprintStatus })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
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
            {mode === "add" ? "Create Sprint" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
