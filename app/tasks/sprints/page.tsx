"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  ArrowLeft,
  Calendar,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SprintCard } from "@/components/tasks/sprint-card";
import { SprintForm } from "@/components/tasks/sprint-form";
import { SprintService } from "@/services/sprint.service";
import { ProjectService } from "@/services/project.service";
import { SprintFormData, SprintStats, SprintStatus, SprintWithDetails } from "@/types/sprint";
import { ProjectWithDetails } from "@/types/project";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function SprintsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [sprints, setSprints] = useState<SprintWithDetails[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectWithDetails[]>([]);
  const [stats, setStats] = useState<SprintStats>({
    totalSprints: 0,
    activeSprints: 0,
    plannedSprints: 0,
    completedSprints: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedSprint, setSelectedSprint] = useState<SprintWithDetails | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedSprints, fetchedProjects, fetchedStats] = await Promise.all([
        SprintService.getSprints(),
        ProjectService.getProjects({ isArchived: false }),
        SprintService.getStats(),
      ]);

      setSprints(fetchedSprints);
      setProjectsList(fetchedProjects);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to load sprints:", err);
      toastError("Failed to fetch sprints");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for sprints, projects, and tasks
  useRealtimeTables({
    tables: ["sprints", "projects", "tasks"],
    onChange: loadData,
  });

  const handleOpenAddSprint = () => {
    setSelectedSprint(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleOpenEditSprint = (sprint: SprintWithDetails) => {
    setSelectedSprint(sprint);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: SprintFormData) => {
    const actorName = user?.fullName || "Ranjith";

    if (formMode === "add") {
      const res = await SprintService.createSprint(formData, actorName);
      if (res.success) {
        success("Sprint created successfully", `${formData.name} is scheduled.`);
        loadData();
      } else {
        toastError("Failed to create sprint", res.error);
      }
    } else if (formMode === "edit" && selectedSprint) {
      const res = await SprintService.updateSprint(selectedSprint.id, formData, actorName);
      if (res.success) {
        success("Sprint updated successfully");
        loadData();
      } else {
        toastError("Failed to update sprint", res.error);
      }
    }
  };

  const handleStatusChange = async (sprint: SprintWithDetails, newStatus: SprintStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await SprintService.updateSprintStatus(sprint.id, newStatus, actorName);
    if (res.success) {
      success("Sprint status updated", `Moved to ${newStatus}.`);
      loadData();
    } else {
      toastError("Failed to update status", res.error);
    }
  };

  const handleDeleteSprint = async (sprint: SprintWithDetails) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await SprintService.deleteSprint(sprint.id, actorName);
    if (res.success) {
      success("Sprint deleted");
      loadData();
    } else {
      toastError("Failed to delete sprint", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="space-y-1">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tasks & Kanban</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Sprint Planning Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Manage agile development cycles, track story point velocity, plan iterations, and monitor milestone delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleOpenAddSprint}
            className="gap-2 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Sprint</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Total Sprints
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {stats.totalSprints}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">All planned and completed cycles</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Active Sprints
          </span>
          <p className="text-2xl font-extrabold text-blue-700 mt-2 font-display">
            {stats.activeSprints}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Currently in live engineering</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Planned Sprints
          </span>
          <p className="text-2xl font-extrabold text-purple-700 mt-2 font-display">
            {stats.plannedSprints}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Upcoming iteration queue</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Completed Sprints
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-display">
            {stats.completedSprints}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Delivered to QA / client</p>
        </div>
      </div>

      {/* Sprints Grid */}
      {sprints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              onEdit={handleOpenEditSprint}
              onDelete={handleDeleteSprint}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">No Sprints Planned Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Set up 2-week iterations to bundle deliverables and track developer velocity.
          </p>
          <Button variant="default" size="sm" onClick={handleOpenAddSprint} className="mt-5 font-semibold">
            Plan First Sprint
          </Button>
        </div>
      )}

      {/* Sprint Form Modal */}
      <SprintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        projectsList={projectsList}
        initialData={selectedSprint}
        mode={formMode}
      />
    </div>
  );
}
