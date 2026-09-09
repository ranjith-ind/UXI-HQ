"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FolderPlus,
  FolderKanban,
  Building,
  Users,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectTeamSelector } from "./project-team-selector";
import {
  Project,
  ProjectFormData,
  ProjectPriority,
  ProjectStatus,
  ProjectType,
  PROJECT_PRIORITY_LIST,
  PROJECT_STATUS_LIST,
  PROJECT_TYPES_LIST,
} from "@/types/project";
import { ClientWithDetails } from "@/types/client";
import { ProjectService } from "@/services/project.service";
import { cn, formatCurrency } from "@/lib/utils";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  clientsList: ClientWithDetails[];
  initialData?: Project | null;
  mode?: "add" | "edit";
}

const formSteps = [
  { id: 1, title: "Basic Info", icon: FolderKanban },
  { id: 2, title: "Team", icon: Users },
  { id: 3, title: "Financials", icon: DollarSign },
  { id: 4, title: "Timeline", icon: Calendar },
  { id: 5, title: "Links & Notes", icon: LinkIcon },
];

export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  clientsList,
  initialData,
  mode = "add",
}: ProjectFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    client_id: "",
    project_name: "",
    project_code: "",
    project_type: "Web Application",
    description: "",
    requirements: "",
    project_status: "Confirmed",
    priority: "Medium",
    estimated_budget: 0,
    final_budget: 0,
    currency: "INR",
    advance_amount: 0,
    start_date: new Date().toISOString().split("T")[0],
    estimated_deadline: "",
    project_url: "",
    repository_url: "",
    project_notes: "",
    team_member_ids: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === "edit") {
      const existingMembers = (initialData as any)?.team_members;
      const memberIds = Array.isArray(existingMembers)
        ? existingMembers.map((m: any) => m.team_member_id || m.id).filter(Boolean)
        : [];

      setFormData({
        client_id: initialData.client_id || (clientsList[0]?.id || ""),
        project_name: initialData.project_name || "",
        project_code: initialData.project_code || "",
        project_type: initialData.project_type || "Web Application",
        description: initialData.description || "",
        requirements: initialData.requirements || "",
        project_status: initialData.project_status || "Confirmed",
        priority: initialData.priority || "Medium",
        estimated_budget: Number(initialData.estimated_budget || 0),
        final_budget: Number(initialData.final_budget || initialData.estimated_budget || 0),
        currency: initialData.currency || "INR",
        advance_amount: Number(initialData.advance_amount || 0),
        start_date: initialData.start_date
          ? new Date(initialData.start_date).toISOString().split("T")[0]
          : "",
        estimated_deadline: initialData.estimated_deadline
          ? new Date(initialData.estimated_deadline).toISOString().split("T")[0]
          : "",
        project_url: initialData.project_url || "",
        repository_url: initialData.repository_url || "",
        project_notes: initialData.project_notes || "",
        team_member_ids: memberIds,
      });
    } else {
      setFormData({
        client_id: clientsList[0]?.id || "",
        project_name: "",
        project_code: "",
        project_type: "Web Application",
        description: "",
        requirements: "",
        project_status: "Confirmed",
        priority: "Medium",
        estimated_budget: 0,
        final_budget: 0,
        currency: "INR",
        advance_amount: 0,
        start_date: new Date().toISOString().split("T")[0],
        estimated_deadline: "",
        project_url: "",
        repository_url: "",
        project_notes: "",
        team_member_ids: [],
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [initialData, mode, isOpen, clientsList]);

  if (!isOpen) return null;

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.project_name.trim()) {
        newErrors.project_name = "Project name is required.";
      }
      if (!formData.client_id) {
        newErrors.client_id = "Please select a client account.";
      }
      if (!formData.project_code.trim()) {
        newErrors.project_code = "Project code is required.";
      }
    }

    if (stepNumber === 3) {
      if (formData.final_budget < 0) {
        newErrors.final_budget = "Final budget cannot be negative.";
      }
      if (formData.advance_amount < 0) {
        newErrors.advance_amount = "Advance amount cannot be negative.";
      }
      if (formData.advance_amount > formData.final_budget) {
        newErrors.advance_amount = "Advance cannot exceed the final budget.";
      }
    }

    if (stepNumber === 4) {
      if (formData.start_date && formData.estimated_deadline) {
        if (new Date(formData.estimated_deadline) < new Date(formData.start_date)) {
          newErrors.estimated_deadline = "Deadline cannot be earlier than start date.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, formSteps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep(1) || !validateStep(3) || !validateStep(4) || loading) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const pendingAmount = Math.max(
    0,
    Number(formData.final_budget || 0) - Number(formData.advance_amount || 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {mode === "add" ? "Create New Project" : "Edit Project"}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === "add"
                  ? "Configure deliverables, client association, team and budgets"
                  : `Update specifications for ${formData.project_name || "Project"}`}
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

        {/* Multi-Step Stepper Navigation */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
          {formSteps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isCompleted || isCurrent) setCurrentStep(step.id);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                  isCurrent
                    ? "bg-blue-600 text-white shadow-sm"
                    : isCompleted
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-400 opacity-60"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.id}. {step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. AI-Powered FinTech Analytics Dashboard"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  />
                  {errors.project_name && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.project_name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Client Account <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="">Select a client...</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} {c.company_name ? `(${c.company_name})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.client_id && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.client_id}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Project Code <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="UXI-WEB-01"
                    value={formData.project_code}
                    onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                  />
                  {errors.project_code && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.project_code}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Project Type</label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    {PROJECT_TYPES_LIST.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Initial Status</label>
                  <select
                    value={formData.project_status}
                    onChange={(e) => setFormData({ ...formData, project_status: e.target.value as ProjectStatus })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    {PROJECT_STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 font-display">Priority Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PROJECT_PRIORITY_LIST.map((p) => {
                      const isSelected = formData.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={cn(
                            "py-2 rounded-xl text-xs font-bold border transition-all",
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 font-display">Brief Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a high-level summary of deliverables and engineering targets..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Team Members */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <ProjectTeamSelector
                selectedIds={formData.team_member_ids || []}
                onChange={(ids) => setFormData({ ...formData, team_member_ids: ids })}
              />
            </div>
          )}

          {/* STEP 3: Financials */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Estimated Budget (INR)</label>
                  <Input
                    type="number"
                    value={formData.estimated_budget}
                    onChange={(e) => setFormData({ ...formData, estimated_budget: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Final Agreed Budget (INR) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.final_budget}
                    onChange={(e) => setFormData({ ...formData, final_budget: Number(e.target.value) })}
                  />
                  {errors.final_budget && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.final_budget}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Advance Amount (INR)</label>
                  <Input
                    type="number"
                    value={formData.advance_amount}
                    onChange={(e) => setFormData({ ...formData, advance_amount: Number(e.target.value) })}
                  />
                  {errors.advance_amount && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.advance_amount}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Pending Balance</label>
                  <div className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 flex items-center font-mono font-bold text-amber-700 text-xs shadow-2xs">
                    {formatCurrency(pendingAmount, "INR")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Timeline */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Project Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Target Deadline</label>
                  <Input
                    type="date"
                    value={formData.estimated_deadline || ""}
                    onChange={(e) => setFormData({ ...formData, estimated_deadline: e.target.value })}
                  />
                  {errors.estimated_deadline && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.estimated_deadline}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Links & Notes */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Live Deployment URL</label>
                  <Input
                    placeholder="https://client-staging.vercel.app"
                    value={formData.project_url || ""}
                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                    icon={<Globe className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">GitHub / Git Repository</label>
                  <Input
                    placeholder="https://github.com/uxihq/project"
                    value={formData.repository_url || ""}
                    onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                    icon={<GitBranch className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 font-display">Technical Notes & Deliverables</label>
                  <textarea
                    rows={4}
                    placeholder="Architecture notes, milestones, API tokens reference..."
                    value={formData.project_notes || ""}
                    onChange={(e) => setFormData({ ...formData, project_notes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50/70">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-1 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>

            {currentStep < formSteps.length ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleNext}
                className="gap-1 font-semibold"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleSubmit()}
                isLoading={loading}
                className="font-bold"
              >
                {mode === "add" ? "Create Project" : "Save Specifications"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
