"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Calendar,
  Plus,
  Play,
  Edit2,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskForm } from "@/components/tasks/task-form";
import { SprintForm } from "@/components/tasks/sprint-form";
import { SprintService } from "@/services/sprint.service";
import { TaskService } from "@/services/task.service";
import { ProjectService } from "@/services/project.service";
import { SprintFormData, SprintStatus, SprintWithDetails } from "@/types/sprint";
import { TaskFormData, TaskWithDetails } from "@/types/task";
import { ProjectWithDetails } from "@/types/project";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function SprintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [sprint, setSprint] = useState<SprintWithDetails | null>(null);
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectWithDetails[]>([]);
  const [sprintsList, setSprintsList] = useState<SprintWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isSprintEditOpen, setIsSprintEditOpen] = useState(false);

  const loadSprintData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedSprint, fetchedTasks, fetchedProjects, fetchedSprints] = await Promise.all([
        SprintService.getSprintById(id),
        TaskService.getTasks({ sprintId: id }),
        ProjectService.getProjects({ isArchived: false }),
        SprintService.getSprints(),
      ]);

      if (!fetchedSprint) {
        toastError("Sprint not found");
        router.push("/tasks/sprints");
        return;
      }

      setSprint(fetchedSprint);
      setTasks(fetchedTasks);
      setProjectsList(fetchedProjects);
      setSprintsList(fetchedSprints);
    } catch (err) {
      console.error("Failed to load sprint:", err);
      toastError("Error loading sprint workspace");
    } finally {
      setLoading(false);
    }
  }, [id, router, toastError]);

  useEffect(() => {
    loadSprintData();
  }, [loadSprintData]);

  // Realtime subscription for sprint, tasks, assignees, projects
  useRealtimeTables({
    tables: ["sprints", "tasks", "task_assignees", "projects"],
    onChange: loadSprintData,
  });

  const handleStatusChange = async (newStatus: SprintStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await SprintService.updateSprintStatus(id, newStatus, actorName);
    if (res.success) {
      success("Sprint status updated", `Moved to ${newStatus}.`);
      loadSprintData();
    } else {
      toastError("Failed to update status", res.error);
    }
  };

  const handleSprintEditSubmit = async (formData: SprintFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await SprintService.updateSprint(id, formData, actorName);
    if (res.success) {
      success("Sprint updated successfully");
      loadSprintData();
    } else {
      toastError("Failed to update sprint", res.error);
    }
  };

  const handleDeleteSprint = async () => {
    const actorName = user?.fullName || "Ranjith";
    const res = await SprintService.deleteSprint(id, actorName);
    if (res.success) {
      success("Sprint deleted");
      router.push("/tasks/sprints");
    } else {
      toastError("Failed to delete sprint", res.error);
    }
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TaskService.createTask(
      {
        ...formData,
        sprint_id: id,
        project_id: sprint?.project_id || formData.project_id,
      },
      actorName
    );
    if (res.success) {
      success("Task added to sprint");
      loadSprintData();
    } else {
      toastError("Failed to create task", res.error);
    }
  };

  if (loading || !sprint) {
    return (
      <div className="space-y-6">
        <div className="h-36 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.task_status === "Completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/tasks/sprints"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-600" />
          <span>Back to Sprint Hub</span>
        </Link>

        <div className="flex items-center gap-2">
          {sprint.sprint_status === "Planned" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("Active")}
              className="gap-1.5 font-semibold"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Sprint</span>
            </Button>
          )}

          {sprint.sprint_status === "Active" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("Completed")}
              className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Complete Sprint</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSprintEditOpen(true)}
            className="gap-1.5 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSprint}
            className="gap-1.5 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold">
              {sprint.sprint_status}
            </span>
            {sprint.project_code && (
              <Link
                href={`/projects/${sprint.project_id}`}
                className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-mono font-bold hover:underline"
              >
                {sprint.project_code} • {sprint.project_name || "Project"}
              </Link>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {sprint.name}
          </h1>

          {sprint.goal && (
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-sans">
              <strong>Goal:</strong> {sprint.goal}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {formatDate(sprint.start_date)} — {formatDate(sprint.end_date)}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Sprint Progress
          </span>
          <p className="text-2xl font-extrabold text-blue-700 mt-2 font-display">
            {progressPercent}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {completedTasks}/{tasks.length} tasks completed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Total Estimated Hours
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {totalHours} hrs
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Estimated sprint workload</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Active Tasks
          </span>
          <p className="text-2xl font-extrabold text-purple-700 mt-2 font-display">
            {tasks.length - completedTasks} Remaining
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">In backlog, dev or review</p>
        </div>
      </div>

      {/* Sprint Tasks Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Sprint Backlog ({tasks.length})</h3>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsTaskFormOpen(true)}
            className="gap-1 text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task to Sprint</span>
          </Button>
        </div>

        {tasks.length > 0 ? (
          <TaskTable
            tasks={tasks}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ) : (
          <p className="text-xs text-slate-400 py-8 text-center">No tasks assigned to this sprint yet.</p>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleCreateTask}
        projectsList={projectsList}
        sprintsList={sprintsList}
        defaultSprintId={id}
        defaultProjectId={sprint.project_id}
        mode="add"
      />

      {/* Sprint Edit Modal */}
      <SprintForm
        isOpen={isSprintEditOpen}
        onClose={() => setIsSprintEditOpen(false)}
        onSubmit={handleSprintEditSubmit}
        projectsList={projectsList}
        initialData={sprint}
        mode="edit"
      />
    </div>
  );
}
