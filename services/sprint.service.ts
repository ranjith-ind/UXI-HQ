import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Sprint,
  SprintFormData,
  SprintStats,
  SprintStatus,
  SprintWithDetails,
} from "@/types/sprint";
import { ClientService } from "./client.service";
import { ProjectService } from "./project.service";

const LOCAL_SPRINTS_KEY = "uxi_sprints_store";

export const INITIAL_SPRINTS: Sprint[] = [];


export class SprintService {
  private static getLocalSprints(): Sprint[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_SPRINTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  }

  private static saveLocalSprints(sprints: Sprint[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_SPRINTS_KEY, JSON.stringify(sprints));
    } catch (err) {
      console.error("Failed to save local sprints:", err);
    }
  }

  static async getSprints(params?: {
    projectId?: string;
    status?: SprintStatus | "All";
  }): Promise<SprintWithDetails[]> {
    let rawSprints: Sprint[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("sprints").select("*");

        if (params?.projectId) {
          query = query.eq("project_id", params.projectId);
        }
        if (params?.status && params.status !== "All") {
          query = query.eq("sprint_status", params.status);
        }

        const { data, error } = await query;
        if (error || !data) {
          rawSprints = this.getLocalSprints();
        } else {
          rawSprints = data as unknown as Sprint[];
        }
      } catch {
        rawSprints = this.getLocalSprints();
      }
    } else {
      rawSprints = this.getLocalSprints();
      if (params?.projectId) {
        rawSprints = rawSprints.filter((s) => s.project_id === params.projectId);
      }
      if (params?.status && params.status !== "All") {
        rawSprints = rawSprints.filter((s) => s.sprint_status === params.status);
      }
    }

    const projects = await ProjectService.getProjects({ isArchived: false });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Read tasks from local storage for task counts
    let allTasks: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("uxi_tasks_store");
        if (stored) allTasks = JSON.parse(stored);
      } catch {
        allTasks = [];
      }
    }

    return rawSprints.map((s) => {
      const proj = projects.find((p) => p.id === s.project_id);
      const sprintTasks = allTasks.filter((t: any) => t.sprint_id === s.id && !t.parent_task_id);
      const totalTasks = sprintTasks.length > 0 ? sprintTasks.length : s.id === "sprint-1" ? 4 : s.id === "sprint-2" ? 3 : 2;
      const completedTasks = sprintTasks.length > 0 ? sprintTasks.filter((t: any) => t.task_status === "Completed").length : s.id === "sprint-1" ? 2 : s.id === "sprint-2" ? 2 : 0;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      let daysRemaining: number | null = null;
      let isOverdue = false;

      if (s.end_date) {
        const endDate = new Date(s.end_date);
        endDate.setHours(0, 0, 0, 0);
        daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0 && s.sprint_status === "Active") {
          isOverdue = true;
        }
      }

      return {
        ...s,
        project_name: proj?.project_name || "Enterprise Project",
        project_code: proj?.project_code || "UXI-2026",
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        progress_percent: progressPercent,
        days_remaining: daysRemaining,
        is_overdue: isOverdue,
      };
    });
  }

  static async getSprintById(id: string): Promise<SprintWithDetails | null> {
    const all = await this.getSprints();
    return all.find((s) => s.id === id) || null;
  }

  static async getStats(): Promise<SprintStats> {
    const all = await this.getSprints();
    return {
      totalSprints: all.length,
      activeSprints: all.filter((s) => s.sprint_status === "Active").length,
      plannedSprints: all.filter((s) => s.sprint_status === "Planned").length,
      completedSprints: all.filter((s) => s.sprint_status === "Completed").length,
    };
  }

  static async createSprint(
    data: SprintFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; sprint?: Sprint; error?: string }> {
    const newSprint: Sprint = {
      id: "sprint-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      project_id: data.project_id,
      name: data.name.trim(),
      goal: data.goal?.trim() || null,
      start_date: data.start_date,
      end_date: data.end_date,
      sprint_status: data.sprint_status || "Planned",
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("sprints") as any)
          .insert(newSprint)
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        const sprint = inserted as unknown as Sprint;
        await ClientService.logActivity(actorName, "created sprint", sprint.name, sprint.id);
        return { success: true, sprint };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create sprint";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalSprints();
      local.unshift(newSprint);
      this.saveLocalSprints(local);
      await ClientService.logActivity(actorName, "created sprint", newSprint.name, newSprint.id);
      return { success: true, sprint: newSprint };
    }
  }

  static async updateSprint(
    id: string,
    data: Partial<SprintFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("sprints") as any)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update sprint";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalSprints();
      const idx = local.findIndex((s) => s.id === id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...data, updated_at: new Date().toISOString() };
        this.saveLocalSprints(local);
      }
    }

    const sprint = await this.getSprintById(id);
    await ClientService.logActivity(actorName, "updated sprint specifications for", sprint?.name || "Sprint", id);
    return { success: true };
  }

  static async updateSprintStatus(
    id: string,
    newStatus: SprintStatus,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const sprint = await this.getSprintById(id);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("sprints") as any)
          .update({ sprint_status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update status";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalSprints();
      const idx = local.findIndex((s) => s.id === id);
      if (idx !== -1) {
        local[idx].sprint_status = newStatus;
        local[idx].updated_at = new Date().toISOString();
        this.saveLocalSprints(local);
      }
    }

    await ClientService.logActivity(
      actorName,
      newStatus === "Active" ? "started sprint" : newStatus === "Completed" ? "completed sprint" : "updated status for sprint",
      sprint?.name || "Sprint",
      id
    );

    return { success: true };
  }

  static async deleteSprint(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const sprint = await this.getSprintById(id);
    const sprintName = sprint?.name || "Sprint";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("sprints").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete sprint";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalSprints().filter((s) => s.id !== id);
      this.saveLocalSprints(local);
    }

    await ClientService.logActivity(actorName, "deleted sprint", sprintName, id);
    return { success: true };
  }
}
