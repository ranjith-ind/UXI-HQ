"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Zap,
  CheckSquare,
  LayoutList,
  Kanban,
  UserCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskStats } from "@/components/tasks/task-stats";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskKanban } from "@/components/tasks/task-kanban";
import { TaskForm } from "@/components/tasks/task-form";
import { SprintForm } from "@/components/tasks/sprint-form";
import { TaskDeleteModal } from "@/components/tasks/task-delete-modal";
import { TaskService } from "@/services/task.service";
import { SprintService } from "@/services/sprint.service";
import { ProjectService } from "@/services/project.service";
import { TeamService } from "@/services/team.service";
import {
  TaskDueDateFilter,
  TaskFormData,
  TaskPriority,
  TaskSortOption,
  TaskStats as ITaskStats,
  TaskStatus,
  TaskWithDetails,
} from "@/types/task";
import { SprintFormData, SprintWithDetails } from "@/types/sprint";
import { ProjectWithDetails } from "@/types/project";
import { TeamMemberWithDetails } from "@/types/team";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type TaskViewMode = "list" | "kanban" | "my_tasks";

export default function TasksPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [viewMode, setViewMode] = useState<TaskViewMode>("kanban");
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectWithDetails[]>([]);
  const [sprintsList, setSprintsList] = useState<SprintWithDetails[]>([]);
  const [teamMembersList, setTeamMembersList] = useState<TeamMemberWithDetails[]>([]);
  const [stats, setStats] = useState<ITaskStats>({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    dueTodayTasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "All">("All");
  const [projectIdFilter, setProjectIdFilter] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("");
  const [sprintIdFilter, setSprintIdFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState<TaskDueDateFilter>("all");
  const [sortBy, setSortBy] = useState<TaskSortOption>("recently_created");

  // Modals state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState<"add" | "edit">("add");
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [isSprintFormOpen, setIsSprintFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithDetails | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("uxi_task_view_mode") as TaskViewMode;
      if (saved && ["list", "kanban", "my_tasks"].includes(saved)) {
        setViewMode(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setAndSaveViewMode = (mode: TaskViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("uxi_task_view_mode", mode);
    } catch {
      // ignore
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveMemberFilter =
        viewMode === "my_tasks"
          ? user?.id || ""
          : teamMemberFilter;

      const [fetchedTasks, fetchedProjects, fetchedSprints, fetchedStats, fetchedTeam] =
        await Promise.all([
          TaskService.getTasks({
            search,
            status: statusFilter,
            priority: priorityFilter,
            projectId: projectIdFilter,
            teamMemberId: effectiveMemberFilter,
            sprintId: sprintIdFilter,
            dueDateFilter,
            sortBy,
          }),
          ProjectService.getProjects(),
          SprintService.getSprints(),
          TaskService.getStats(),
          TeamService.getTeamMembers(),
        ]);

      setTasks(fetchedTasks);
      setProjectsList(fetchedProjects);
      setSprintsList(fetchedSprints);
      setStats(fetchedStats);
      setTeamMembersList(fetchedTeam);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      toastError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    priorityFilter,
    projectIdFilter,
    teamMemberFilter,
    sprintIdFilter,
    dueDateFilter,
    sortBy,
    viewMode,
    user?.id,
    toastError,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleOpenAddTask = () => {
    setSelectedTask(null);
    setTaskFormMode("add");
    setIsTaskFormOpen(true);
  };

  const handleOpenEditTask = (task: TaskWithDetails) => {
    setSelectedTask(task);
    setTaskFormMode("edit");
    setIsTaskFormOpen(true);
  };

  const handleOpenDeleteTask = (task: TaskWithDetails) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  const handleTaskSubmit = async (formData: TaskFormData) => {
    const actorName = user?.fullName || "Ranjith";

    if (taskFormMode === "add") {
      const res = await TaskService.createTask(formData, actorName);
      if (res.success) {
        success("Task created", `${formData.title} added to project.`);
        loadData();
      } else {
        toastError("Error creating task", res.error);
      }
    } else if (taskFormMode === "edit" && selectedTask) {
      const res = await TaskService.updateTask(selectedTask.id, formData, actorName);
      if (res.success) {
        success("Task updated", "Changes saved.");
        loadData();
      } else {
        toastError("Error updating task", res.error);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TaskService.updateTaskStatus(taskId, newStatus, actorName);
    if (res.success) {
      success("Status updated", `Moved to ${newStatus}.`);
      loadData();
    } else {
      toastError("Failed to update status", res.error);
    }
  };

  const handleDeleteConfirm = async (taskId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TaskService.deleteTask(taskId, actorName);
    if (res.success) {
      success("Task deleted", "Task removed from backlog.");
      loadData();
    } else {
      toastError("Failed to delete task", res.error);
    }
  };

  const handleSprintSubmit = async (formData: SprintFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await SprintService.createSprint(formData, actorName);
    if (res.success) {
      success("Sprint created", `${formData.name} initialized.`);
      loadData();
    } else {
      toastError("Failed to create sprint", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>UXI Sprint & Execution Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Tasks & Sprints Management
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Organize engineering backlogs, plan 2-week sprint cycles, assign developer workloads, and drag-and-drop deliverables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/tasks/sprints">
            <Button variant="secondary" size="sm" className="gap-2 font-semibold">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Sprint Hub</span>
            </Button>
          </Link>

          <Button
            variant="default"
            size="sm"
            onClick={handleOpenAddTask}
            className="gap-2 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* 2. Task KPI Metrics Strip */}
      <TaskStats stats={stats} loading={loading} />

      {/* 3. View Switcher Mode Tabs (List vs Kanban vs My Tasks) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAndSaveViewMode("kanban")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all scalemorphic-button",
              viewMode === "kanban"
                ? "bg-[#2451EB] text-white font-semibold"
                : "text-[#5B6472] hover:bg-[#F7F9FC]"
            )}
          >
            <Kanban className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setAndSaveViewMode("list")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all scalemorphic-button",
              viewMode === "list"
                ? "bg-[#2451EB] text-white font-semibold"
                : "text-[#5B6472] hover:bg-[#F7F9FC]"
            )}
          >
            <LayoutList className="w-4 h-4" />
            <span>Table List</span>
          </button>

          <button
            onClick={() => setAndSaveViewMode("my_tasks")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all scalemorphic-button",
              viewMode === "my_tasks"
                ? "bg-purple-600 text-white font-semibold"
                : "text-[#5B6472] hover:bg-[#F7F9FC]"
            )}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Tasks</span>
          </button>
        </div>

        <div className="flex items-center gap-3 px-3 text-xs text-[#5B6472] font-medium">
          <span>
            Showing <strong className="text-[#0F172A] font-tabular">{tasks.length}</strong> tasks
          </span>
        </div>
      </div>

      {/* 4. Filters */}
      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        projectId={projectIdFilter}
        onProjectIdChange={setProjectIdFilter}
        teamMemberId={teamMemberFilter}
        onTeamMemberIdChange={setTeamMemberFilter}
        sprintId={sprintIdFilter}
        onSprintIdChange={setSprintIdFilter}
        dueDateFilter={dueDateFilter}
        onDueDateFilterChange={setDueDateFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        projectsList={projectsList}
        sprintsList={sprintsList}
        teamMembersList={teamMembersList}
        totalCount={tasks.length}
      />

      {/* 5. Main Task Content Render */}
      {viewMode === "kanban" ? (
        <TaskKanban
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEdit={handleOpenEditTask}
          onDelete={handleOpenDeleteTask}
          onAddTaskToStatus={(colStatus) => {
            setSelectedTask(null);
            setTaskFormMode("add");
            setIsTaskFormOpen(true);
          }}
        />
      ) : (
        <TaskTable
          tasks={tasks}
          onEdit={handleOpenEditTask}
          onDelete={handleOpenDeleteTask}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
      )}

      {/* 6. Modals */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        projectsList={projectsList}
        sprintsList={sprintsList}
        initialData={selectedTask}
        mode={taskFormMode}
      />

      <SprintForm
        isOpen={isSprintFormOpen}
        onClose={() => setIsSprintFormOpen(false)}
        onSubmit={handleSprintSubmit}
        projectsList={projectsList}
      />

      <TaskDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        task={taskToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
