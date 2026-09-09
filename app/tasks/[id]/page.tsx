"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  Calendar,
  Zap,
  Edit2,
  Trash2,
  Users,
  Building,
  UserPlus,
  X,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { SubtaskList } from "@/components/tasks/subtask-list";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskDeleteModal } from "@/components/tasks/task-delete-modal";
import { TaskService } from "@/services/task.service";
import { ProjectService } from "@/services/project.service";
import { SprintService } from "@/services/sprint.service";
import { TeamService } from "@/services/team.service";
import {
  TaskFormData,
  TaskStatus,
  TaskWithDetails,
  TASK_STATUS_LIST,
} from "@/types/task";
import { ProjectWithDetails } from "@/types/project";
import { SprintWithDetails } from "@/types/sprint";
import { TeamMemberWithDetails } from "@/types/team";
import { formatDate, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectWithDetails[]>([]);
  const [sprintsList, setSprintsList] = useState<SprintWithDetails[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);

  const loadTaskData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedTask, fetchedProjects, fetchedSprints, fetchedTeam] = await Promise.all([
        TaskService.getTaskById(id),
        ProjectService.getProjects({ isArchived: false }),
        SprintService.getSprints(),
        TeamService.getTeamMembers(),
      ]);

      if (!fetchedTask) {
        toastError("Task not found", "The requested task does not exist.");
        router.push("/tasks");
        return;
      }

      setTask(fetchedTask);
      setProjectsList(fetchedProjects);
      setSprintsList(fetchedSprints);
      setAllTeamMembers(fetchedTeam);
    } catch (err) {
      console.error("Failed to load task:", err);
      toastError("Error loading task details");
    } finally {
      setLoading(false);
    }
  }, [id, router, toastError]);

  useEffect(() => {
    loadTaskData();
  }, [loadTaskData]);

  const handleEditSubmit = async (formData: TaskFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TaskService.updateTask(id, formData, actorName);
    if (res.success) {
      success("Task updated successfully");
      loadTaskData();
    } else {
      toastError("Failed to update task", res.error);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TaskService.updateTaskStatus(id, newStatus, actorName);
    if (res.success) {
      success("Status updated", `Task moved to ${newStatus}.`);
      loadTaskData();
    } else {
      toastError("Failed to change status", res.error);
    }
  };

  const handleDeleteConfirm = async (taskId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TaskService.deleteTask(taskId, actorName);
    if (res.success) {
      success("Task deleted successfully", "Redirecting to tasks dashboard...");
      router.push("/tasks");
    } else {
      toastError("Failed to delete task", res.error);
    }
  };

  const handleToggleMember = async (memberId: string) => {
    if (!task) return;
    const currentAssigneeIds = task.assignees.map((a) => a.id);
    const newAssigneeIds = currentAssigneeIds.includes(memberId)
      ? currentAssigneeIds.filter((mId) => mId !== memberId)
      : [...currentAssigneeIds, memberId];

    const actorName = user?.fullName || "Ranjith";
    await TaskService.updateTask(id, { assignee_ids: newAssigneeIds }, actorName);
    success("Task assignees updated");
    loadTaskData();
  };

  if (loading || !task) {
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

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-600" />
          <span>Back to Tasks Command</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick Status Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors shadow-2xs">
                <span>Status: {task.task_status}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
              Change Status
            </div>
            {TASK_STATUS_LIST.map((st) => (
              <DropdownItem
                key={st}
                onClick={() => handleStatusChange(st)}
                className={task.task_status === st ? "bg-blue-50 text-blue-700 font-bold" : ""}
              >
                <span>{st}</span>
              </DropdownItem>
            ))}
          </Dropdown>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="gap-1.5 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/projects/${task.project_id}`}
              className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-mono font-bold hover:bg-blue-100"
            >
              {task.project_code} • {task.project_name}
            </Link>
            <TaskStatusBadge status={task.task_status} />
            <TaskPriorityBadge priority={task.priority} />
            {task.sprint_name && (
              <Link
                href={`/tasks/sprints/${task.sprint_id}`}
                className="px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold hover:underline"
              >
                {task.sprint_name}
              </Link>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {task.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Created: {formatDate(task.created_at)}</span>
            </div>
            {task.due_date && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Date: <strong className="text-slate-700">{formatDate(task.due_date)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Estimated Hours
          </span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {task.estimated_hours ?? 0} hrs
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Estimated deliverable weight</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Assigned Developers
          </span>
          <p className="text-2xl font-extrabold text-blue-700 mt-2 font-display">
            {task.assignees?.length || 0} Engineers
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Active workforce allocation</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Checklist Progress
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-display">
            {task.subtasks_total > 0
              ? `${Math.round((task.subtasks_completed / task.subtasks_total) * 100)}%`
              : "0%"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {task.subtasks_completed}/{task.subtasks_total} subtasks completed
          </p>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope & Subtasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-display">Task Scope & Technical Specs</h3>
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 whitespace-pre-line font-sans">
              {task.description || "No specific technical requirements documented for this task."}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <SubtaskList
              parentTaskId={task.id}
              subtasks={task.subtasks || []}
              onSubtasksChange={loadTaskData}
            />
          </div>
        </div>

        {/* Right Column: Assignees & Project Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Assignees */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Assignees</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsAssignMemberOpen(!isAssignMemberOpen)}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                + Assign
              </button>
            </div>

            {/* Quick Member Assignment Drawer */}
            {isAssignMemberOpen && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                  <span>Toggle Developers</span>
                  <button onClick={() => setIsAssignMemberOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {allTeamMembers.map((tm) => {
                    const isAssigned = task.assignees?.some((a) => a.id === tm.id);
                    return (
                      <button
                        key={tm.id}
                        onClick={() => handleToggleMember(tm.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                          isAssigned ? "bg-blue-50 text-blue-700 border border-blue-200" : "hover:bg-white text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={tm.full_name || (tm as any).name} size="sm" />
                          <span>{tm.full_name || (tm as any).name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{isAssigned ? "✓ Assigned" : "+ Add"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Assignees */}
            <div className="space-y-2">
              {task.assignees && task.assignees.length > 0 ? (
                task.assignees.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.name} src={a.avatar_url} size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block">{a.name}</span>
                        <span className="text-[10px] text-slate-500">{a.role}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No developers assigned yet.</p>
              )}
            </div>
          </div>

          {/* Project Details */}
          {task.project_name && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Parent Project</h3>
              </div>

              <div>
                <Link
                  href={`/projects/${task.project_id}`}
                  className="text-xs font-bold text-blue-600 hover:underline block"
                >
                  {task.project_name}
                </Link>
                {task.project_code && (
                  <span className="text-[10px] font-mono text-slate-400">{task.project_code}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        projectsList={projectsList}
        sprintsList={sprintsList}
        initialData={task}
        mode="edit"
      />

      <TaskDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        task={task}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
