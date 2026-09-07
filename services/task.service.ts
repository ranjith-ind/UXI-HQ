import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Subtask,
  Task,
  TaskAssignee,
  TaskDueDateFilter,
  TaskFormData,
  TaskPriority,
  TaskSortOption,
  TaskStats,
  TaskStatus,
  TaskWithDetails,
} from "@/types/task";
import { ClientService } from "./client.service";
import { ProjectService, INITIAL_TEAM_MEMBERS } from "./project.service";
import { SprintService } from "./sprint.service";

const LOCAL_TASKS_KEY = "uxi_tasks_store";
const LOCAL_TASK_ASSIGNEES_KEY = "uxi_task_assignees_store";

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    project_id: "proj-1",
    sprint_id: "sprint-1",
    title: "Implement Merchant OAuth2 & Multi-Factor Auth Flow",
    description: "Design secure JWT token rotation and 2FA authentication flow for FinPulse enterprise banking clients.",
    task_status: "Completed",
    priority: "Urgent",
    progress: 100,
    estimated_hours: 16,
    actual_hours: 14,
    start_date: "2026-08-20",
    due_date: "2026-08-26",
    completed_at: "2026-08-26T16:30:00Z",
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-26T16:30:00Z",
  },
  {
    id: "task-2",
    project_id: "proj-1",
    sprint_id: "sprint-1",
    title: "Develop Real-Time Transaction Settlement Webhooks",
    description: "Connect microservice listener for instant credit/debit transaction webhooks and ledger reconciliation.",
    task_status: "In Progress",
    priority: "High",
    progress: 60,
    estimated_hours: 24,
    actual_hours: 15,
    start_date: "2026-08-26",
    due_date: "2026-09-02",
    completed_at: null,
    created_by: "f4-praneeth-uuid",
    created_at: "2026-08-26T09:00:00Z",
    updated_at: "2026-08-29T14:00:00Z",
  },
  {
    id: "task-3",
    project_id: "proj-1",
    sprint_id: "sprint-1",
    title: "FinPulse KYC Document Verification UI & Scanner",
    description: "Interactive client document upload pipeline with image compression and status telemetry.",
    task_status: "To Do",
    priority: "Medium",
    progress: 0,
    estimated_hours: 12,
    actual_hours: 0,
    start_date: "2026-09-01",
    due_date: "2026-09-08",
    completed_at: null,
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-28T11:00:00Z",
    updated_at: "2026-08-28T11:00:00Z",
  },
  {
    id: "task-4",
    project_id: "proj-2",
    sprint_id: "sprint-2",
    title: "Headless 3D Product View Carousel Integration",
    description: "Optimize Three.js 3D luxury product viewer for mobile touch performance and WebGL rendering.",
    task_status: "In Review",
    priority: "High",
    progress: 85,
    estimated_hours: 20,
    actual_hours: 18,
    start_date: "2026-08-22",
    due_date: "2026-09-01",
    completed_at: null,
    created_by: "f3-vedesh-uuid",
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-29T11:30:00Z",
  },
  {
    id: "task-5",
    project_id: "proj-2",
    sprint_id: "sprint-2",
    title: "Shopify Plus Headless Checkout & Cart State Synchronization",
    description: "Synchronize client side cart items with Shopify Plus GraphQL Storefront API.",
    task_status: "Completed",
    priority: "Urgent",
    progress: 100,
    estimated_hours: 18,
    actual_hours: 16,
    start_date: "2026-08-24",
    due_date: "2026-08-28",
    completed_at: "2026-08-28T18:00:00Z",
    created_by: "f4-praneeth-uuid",
    created_at: "2026-08-24T09:00:00Z",
    updated_at: "2026-08-28T18:00:00Z",
  },
  {
    id: "task-6",
    project_id: "proj-3",
    sprint_id: "sprint-3",
    title: "HIPAA Compliant Patient Cloud Database Encryption Schema",
    description: "Design column-level encryption keys and auditing trails for electronic medical records.",
    task_status: "To Do",
    priority: "Urgent",
    progress: 0,
    estimated_hours: 30,
    actual_hours: 0,
    start_date: "2026-09-01",
    due_date: "2026-09-10",
    completed_at: null,
    created_by: "f2-hafi-uuid",
    created_at: "2026-08-27T12:00:00Z",
    updated_at: "2026-08-27T12:00:00Z",
  },
  {
    id: "task-7",
    project_id: "proj-4",
    sprint_id: null,
    title: "Draft Logistics Container Tracking Schema & Scope Lock",
    description: "Define real-time GPS telemetry structure and driver dispatch requirements with David Sterling.",
    task_status: "Backlog",
    priority: "Medium",
    progress: 10,
    estimated_hours: 8,
    actual_hours: 2,
    start_date: "2026-08-29",
    due_date: "2026-09-12",
    completed_at: null,
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-29T08:00:00Z",
    updated_at: "2026-08-29T08:00:00Z",
  },
];

export const INITIAL_SUBTASKS: Subtask[] = [
  {
    id: "sub-1",
    parent_task_id: "task-2",
    project_id: "proj-1",
    title: "Create webhook receiver API endpoint in Next.js App Router",
    task_status: "Completed",
    priority: "High",
    due_date: "2026-08-28",
    created_at: "2026-08-26T10:00:00Z",
    updated_at: "2026-08-28T14:00:00Z",
  },
  {
    id: "sub-2",
    parent_task_id: "task-2",
    project_id: "proj-1",
    title: "Implement HMAC signature verification against FinPulse Gateway",
    task_status: "Completed",
    priority: "Urgent",
    due_date: "2026-08-29",
    created_at: "2026-08-26T10:00:00Z",
    updated_at: "2026-08-29T12:00:00Z",
  },
  {
    id: "sub-3",
    parent_task_id: "task-2",
    project_id: "proj-1",
    title: "Setup retry queue for dropped settlement callbacks",
    task_status: "In Progress",
    priority: "High",
    due_date: "2026-09-02",
    created_at: "2026-08-26T10:00:00Z",
    updated_at: "2026-08-29T14:00:00Z",
  },
  {
    id: "sub-4",
    parent_task_id: "task-4",
    project_id: "proj-2",
    title: "Convert GLTF assets to Draco compressed buffers",
    task_status: "Completed",
    priority: "Medium",
    due_date: "2026-08-25",
    created_at: "2026-08-22T11:00:00Z",
    updated_at: "2026-08-25T16:00:00Z",
  },
  {
    id: "sub-5",
    parent_task_id: "task-4",
    project_id: "proj-2",
    title: "Test responsive rotation controls on iOS Safari & Android Chrome",
    task_status: "In Review",
    priority: "High",
    due_date: "2026-09-01",
    created_at: "2026-08-22T11:00:00Z",
    updated_at: "2026-08-29T11:30:00Z",
  },
];

export const INITIAL_TASK_ASSIGNEES: Record<string, string[]> = {
  "task-1": ["tm-4-praneeth", "tm-1-ranjith"],
  "task-2": ["tm-4-praneeth"],
  "task-3": ["tm-3-vedesh", "tm-1-ranjith"],
  "task-4": ["tm-3-vedesh"],
  "task-5": ["tm-4-praneeth", "tm-3-vedesh"],
  "task-6": ["tm-2-hafi"],
  "task-7": ["tm-1-ranjith"],
};

export class TaskService {
  private static getLocalTasks(): Task[] {
    if (typeof window === "undefined") return INITIAL_TASKS;
    try {
      const stored = localStorage.getItem(LOCAL_TASKS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  }

  private static saveLocalTasks(tasks: Task[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Failed to save local tasks:", err);
    }
  }

  private static getLocalSubtasks(): Subtask[] {
    if (typeof window === "undefined") return INITIAL_SUBTASKS;
    try {
      const stored = localStorage.getItem("uxi_subtasks_store");
      if (stored) return JSON.parse(stored);
      localStorage.setItem("uxi_subtasks_store", JSON.stringify(INITIAL_SUBTASKS));
      return INITIAL_SUBTASKS;
    } catch {
      return INITIAL_SUBTASKS;
    }
  }

  private static saveLocalSubtasks(subtasks: Subtask[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("uxi_subtasks_store", JSON.stringify(subtasks));
    } catch (err) {
      console.error("Failed to save local subtasks:", err);
    }
  }

  private static getLocalAssigneesMap(): Record<string, string[]> {
    if (typeof window === "undefined") return INITIAL_TASK_ASSIGNEES;
    try {
      const stored = localStorage.getItem(LOCAL_TASK_ASSIGNEES_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_TASK_ASSIGNEES_KEY, JSON.stringify(INITIAL_TASK_ASSIGNEES));
      return INITIAL_TASK_ASSIGNEES;
    } catch {
      return INITIAL_TASK_ASSIGNEES;
    }
  }

  private static saveLocalAssigneesMap(map: Record<string, string[]>) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_TASK_ASSIGNEES_KEY, JSON.stringify(map));
    } catch (err) {
      console.error("Failed to save local task assignees:", err);
    }
  }

  static async getTasks(params?: {
    search?: string;
    status?: TaskStatus | "All";
    priority?: TaskPriority | "All";
    projectId?: string;
    teamMemberId?: string;
    sprintId?: string;
    dueDateFilter?: TaskDueDateFilter;
    sortBy?: TaskSortOption;
  }): Promise<TaskWithDetails[]> {
    let rawTasks: Task[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("tasks").select("*").is("parent_task_id", null);

        if (params?.status && params.status !== "All") {
          query = query.eq("task_status", params.status);
        }
        if (params?.priority && params.priority !== "All") {
          query = query.eq("priority", params.priority);
        }
        if (params?.projectId) {
          query = query.eq("project_id", params.projectId);
        }
        if (params?.sprintId) {
          query = query.eq("sprint_id", params.sprintId);
        }

        const { data, error } = await query;
        if (error || !data) {
          rawTasks = this.getLocalTasks();
        } else {
          rawTasks = data as unknown as Task[];
        }
      } catch {
        rawTasks = this.getLocalTasks();
      }
    } else {
      rawTasks = this.getLocalTasks().filter((t) => !t.parent_task_id);

      if (params?.status && params.status !== "All") {
        rawTasks = rawTasks.filter((t) => t.task_status === params.status);
      }
      if (params?.priority && params.priority !== "All") {
        rawTasks = rawTasks.filter((t) => t.priority === params.priority);
      }
      if (params?.projectId) {
        rawTasks = rawTasks.filter((t) => t.project_id === params.projectId);
      }
      if (params?.sprintId) {
        rawTasks = rawTasks.filter((t) => t.sprint_id === params.sprintId);
      }
    }

    const [projects, sprints] = await Promise.all([
      ProjectService.getProjects({ isArchived: false }),
      SprintService.getSprints(),
    ]);

    const assigneesMap = this.getLocalAssigneesMap();
    const allSubtasks = this.getLocalSubtasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let detailedTasks: TaskWithDetails[] = rawTasks.map((t) => {
      const proj = projects.find((p) => p.id === t.project_id);
      const sprint = sprints.find((s) => s.id === t.sprint_id);
      const assignedIds = assigneesMap[t.id] || ["tm-1-ranjith"];

      const assignees: TaskAssignee[] = assignedIds.map((mid) => {
        const member = INITIAL_TEAM_MEMBERS.find((m) => m.id === mid) || INITIAL_TEAM_MEMBERS[0];
        return {
          id: `ta-${t.id}-${member.id}`,
          task_id: t.id,
          team_member_id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          title: member.title,
          avatar_url: member.avatar_url,
          assigned_at: t.created_at,
        };
      });

      const taskSubtasks = allSubtasks.filter((s) => s.parent_task_id === t.id);
      const completedSubtasks = taskSubtasks.filter((s) => s.task_status === "Completed").length;

      let progress = t.progress;
      if (taskSubtasks.length > 0) {
        progress = Math.round((completedSubtasks / taskSubtasks.length) * 100);
      }

      let isOverdue = false;
      let daysRemaining: number | null = null;

      if (t.due_date) {
        const dueDate = new Date(t.due_date);
        dueDate.setHours(0, 0, 0, 0);
        daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0 && t.task_status !== "Completed") {
          isOverdue = true;
        }
      }

      return {
        ...t,
        project_name: proj?.project_name || "Enterprise Project",
        project_code: proj?.project_code || "UXI-2026",
        sprint_name: sprint?.name || null,
        assignees,
        subtasks: taskSubtasks,
        subtasks_total: taskSubtasks.length,
        subtasks_completed: completedSubtasks,
        progress,
        is_overdue: isOverdue,
        days_remaining: daysRemaining,
      };
    });

    // Team Member Filter
    if (params?.teamMemberId && params.teamMemberId !== "All") {
      detailedTasks = detailedTasks.filter((t) =>
        t.assignees.some((a) => a.team_member_id === params.teamMemberId)
      );
    }

    // Due Date Filter
    if (params?.dueDateFilter && params.dueDateFilter !== "all") {
      if (params.dueDateFilter === "overdue") {
        detailedTasks = detailedTasks.filter((t) => t.is_overdue);
      } else if (params.dueDateFilter === "due_today") {
        detailedTasks = detailedTasks.filter((t) => t.days_remaining === 0);
      } else if (params.dueDateFilter === "this_week") {
        detailedTasks = detailedTasks.filter(
          (t) => t.days_remaining !== null && t.days_remaining >= 0 && t.days_remaining <= 7
        );
      } else if (params.dueDateFilter === "this_month") {
        detailedTasks = detailedTasks.filter(
          (t) => t.days_remaining !== null && t.days_remaining >= 0 && t.days_remaining <= 30
        );
      } else if (params.dueDateFilter === "no_due_date") {
        detailedTasks = detailedTasks.filter((t) => !t.due_date);
      }
    }

    // Search Filter (Title, Description, Project Name, Project Code)
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      detailedTasks = detailedTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.project_name.toLowerCase().includes(q) ||
          t.project_code.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sort = params?.sortBy || "recently_created";
    const priorityWeight: Record<TaskPriority, number> = {
      Urgent: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

    detailedTasks.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sort === "name_asc") {
        return a.title.localeCompare(b.title);
      } else if (sort === "priority_high") {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (sort === "priority_low") {
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      } else if (sort === "progress_high") {
        return b.progress - a.progress;
      } else if (sort === "due_date_nearest") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sort === "due_date_furthest") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return detailedTasks;
  }

  static async getTaskById(id: string): Promise<TaskWithDetails | null> {
    const all = await this.getTasks();
    return all.find((t) => t.id === id) || null;
  }

  static async getStats(): Promise<TaskStats> {
    const tasks = await this.getTasks();
    return {
      totalTasks: tasks.length,
      inProgressTasks: tasks.filter((t) => t.task_status === "In Progress").length,
      completedTasks: tasks.filter((t) => t.task_status === "Completed").length,
      overdueTasks: tasks.filter((t) => t.is_overdue).length,
      dueTodayTasks: tasks.filter((t) => t.days_remaining === 0).length,
    };
  }

  static async getProjectTaskStats(projectId: string) {
    const tasks = await this.getTasks({ projectId });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.task_status === "Completed").length;
    const inProgress = tasks.filter((t) => t.task_status === "In Progress").length;
    const overdue = tasks.filter((t) => t.is_overdue).length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, overdue, progressPercent, tasks };
  }

  static async createTask(
    data: TaskFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; task?: Task; error?: string }> {
    const isCompleted = data.task_status === "Completed";
    const newTask: Task = {
      id: "task-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      project_id: data.project_id,
      parent_task_id: data.parent_task_id || null,
      sprint_id: data.sprint_id || null,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      task_status: data.task_status || "To Do",
      priority: data.priority || "Medium",
      progress: isCompleted ? 100 : data.progress || 0,
      estimated_hours: Number(data.estimated_hours || 0),
      actual_hours: Number(data.actual_hours || 0),
      start_date: data.start_date || null,
      due_date: data.due_date || null,
      completed_at: isCompleted ? new Date().toISOString() : null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("tasks") as any)
          .insert(newTask)
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        const task = inserted as unknown as Task;
        await ClientService.logActivity(actorName, "created task", task.title, task.id);
        return { success: true, task };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create task";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTasks();
      local.unshift(newTask);
      this.saveLocalTasks(local);

      if (data.assignee_ids && data.assignee_ids.length > 0) {
        const assigneesMap = this.getLocalAssigneesMap();
        assigneesMap[newTask.id] = data.assignee_ids;
        this.saveLocalAssigneesMap(assigneesMap);
      }

      if (data.subtasks && data.subtasks.length > 0) {
        const subtasks = this.getLocalSubtasks();
        data.subtasks.forEach((st) => {
          subtasks.push({
            id: "sub-" + Math.random().toString(36).substring(2, 8) + Date.now(),
            parent_task_id: newTask.id,
            project_id: newTask.project_id,
            title: st.title.trim(),
            task_status: "To Do",
            priority: st.priority || "Medium",
            due_date: st.due_date || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });
        this.saveLocalSubtasks(subtasks);
      }

      await ClientService.logActivity(actorName, "created task", newTask.title, newTask.id);
      return { success: true, task: newTask };
    }
  }

  static async updateTask(
    id: string,
    data: Partial<TaskFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; task?: Task; error?: string }> {
    const isCompleted = data.task_status === "Completed";
    const completedAt = isCompleted ? new Date().toISOString() : data.task_status ? null : undefined;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: updated, error } = await (supabase.from("tasks") as any)
          .update({
            ...data,
            ...(completedAt !== undefined ? { completed_at: completedAt } : {}),
            ...(isCompleted ? { progress: 100 } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        const task = updated as unknown as Task;
        await ClientService.logActivity(actorName, "updated task", task.title, task.id);
        return { success: true, task };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update task";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTasks();
      const idx = local.findIndex((t) => t.id === id);
      if (idx === -1) return { success: false, error: "Task not found." };

      const updatedTask: Task = {
        ...local[idx],
        ...data,
        completed_at: completedAt !== undefined ? completedAt : local[idx].completed_at,
        progress: isCompleted ? 100 : data.progress !== undefined ? data.progress : local[idx].progress,
        updated_at: new Date().toISOString(),
      };

      local[idx] = updatedTask;
      this.saveLocalTasks(local);

      if (data.assignee_ids) {
        const assigneesMap = this.getLocalAssigneesMap();
        assigneesMap[id] = data.assignee_ids;
        this.saveLocalAssigneesMap(assigneesMap);
      }

      await ClientService.logActivity(actorName, "updated task", updatedTask.title, updatedTask.id);
      return { success: true, task: updatedTask };
    }
  }

  static async updateTaskStatus(
    id: string,
    newStatus: TaskStatus,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const isCompleted = newStatus === "Completed";
    const completedAt = isCompleted ? new Date().toISOString() : null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("tasks") as any)
          .update({
            task_status: newStatus,
            completed_at: completedAt,
            progress: isCompleted ? 100 : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update status";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTasks();
      const idx = local.findIndex((t) => t.id === id);
      if (idx !== -1) {
        local[idx].task_status = newStatus;
        local[idx].completed_at = completedAt;
        if (isCompleted) local[idx].progress = 100;
        local[idx].updated_at = new Date().toISOString();
        this.saveLocalTasks(local);
      }
    }

    const task = await this.getTaskById(id);
    await ClientService.logActivity(
      actorName,
      `moved task to ${newStatus}`,
      task?.title || "Task",
      id
    );

    return { success: true };
  }

  static async deleteTask(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const task = await this.getTaskById(id);
    const taskTitle = task?.title || "Task";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete task";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTasks().filter((t) => t.id !== id);
      this.saveLocalTasks(local);

      const subtasks = this.getLocalSubtasks().filter((s) => s.parent_task_id !== id);
      this.saveLocalSubtasks(subtasks);

      const assigneesMap = this.getLocalAssigneesMap();
      delete assigneesMap[id];
      this.saveLocalAssigneesMap(assigneesMap);
    }

    await ClientService.logActivity(actorName, "deleted task", taskTitle, id);
    return { success: true };
  }

  // SUBTASK METHODS
  static async createSubtask(
    parentTaskId: string,
    title: string,
    priority: TaskPriority = "Medium",
    dueDate?: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; subtask?: Subtask; error?: string }> {
    const parent = await this.getTaskById(parentTaskId);
    const newSubtask: Subtask = {
      id: "sub-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      parent_task_id: parentTaskId,
      project_id: parent?.project_id || "proj-1",
      title: title.trim(),
      task_status: "To Do",
      priority,
      due_date: dueDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const subtasks = this.getLocalSubtasks();
    subtasks.push(newSubtask);
    this.saveLocalSubtasks(subtasks);

    // Recalculate parent progress
    await this.recalculateParentProgress(parentTaskId);

    await ClientService.logActivity(actorName, "created subtask", newSubtask.title, parentTaskId);
    return { success: true, subtask: newSubtask };
  }

  static async updateSubtaskStatus(
    subtaskId: string,
    newStatus: TaskStatus,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const subtasks = this.getLocalSubtasks();
    const idx = subtasks.findIndex((s) => s.id === subtaskId);
    if (idx === -1) return { success: false, error: "Subtask not found" };

    subtasks[idx].task_status = newStatus;
    subtasks[idx].updated_at = new Date().toISOString();
    this.saveLocalSubtasks(subtasks);

    const parentTaskId = subtasks[idx].parent_task_id;
    await this.recalculateParentProgress(parentTaskId);

    await ClientService.logActivity(
      actorName,
      `updated subtask status to ${newStatus}`,
      subtasks[idx].title,
      parentTaskId
    );

    return { success: true };
  }

  static async deleteSubtask(
    subtaskId: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const subtasks = this.getLocalSubtasks();
    const target = subtasks.find((s) => s.id === subtaskId);
    if (!target) return { success: false, error: "Subtask not found" };

    const parentTaskId = target.parent_task_id;
    const filtered = subtasks.filter((s) => s.id !== subtaskId);
    this.saveLocalSubtasks(filtered);

    await this.recalculateParentProgress(parentTaskId);
    await ClientService.logActivity(actorName, "removed subtask", target.title, parentTaskId);
    return { success: true };
  }

  private static async recalculateParentProgress(parentTaskId: string) {
    const subtasks = this.getLocalSubtasks().filter((s) => s.parent_task_id === parentTaskId);
    if (subtasks.length === 0) return;

    const completed = subtasks.filter((s) => s.task_status === "Completed").length;
    const progress = Math.round((completed / subtasks.length) * 100);

    const tasks = this.getLocalTasks();
    const pIdx = tasks.findIndex((t) => t.id === parentTaskId);
    if (pIdx !== -1) {
      tasks[pIdx].progress = progress;
      if (progress === 100 && tasks[pIdx].task_status !== "Completed") {
        tasks[pIdx].task_status = "Completed";
        tasks[pIdx].completed_at = new Date().toISOString();
      } else if (progress < 100 && tasks[pIdx].task_status === "Completed") {
        tasks[pIdx].task_status = "In Progress";
        tasks[pIdx].completed_at = null;
      }
      tasks[pIdx].updated_at = new Date().toISOString();
      this.saveLocalTasks(tasks);
    }
  }
}
