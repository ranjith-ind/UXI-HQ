import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DeadlineFilterOption,
  Project,
  ProjectFormData,
  ProjectMember,
  ProjectPriority,
  ProjectSortOption,
  ProjectStats,
  ProjectStatus,
  ProjectType,
  ProjectWithDetails,
  PROJECT_STATUS_PROGRESS,
} from "@/types/project";
import { ClientService, INITIAL_CLIENTS } from "./client.service";

const LOCAL_PROJECTS_KEY = "uxi_projects_store";
const LOCAL_PROJECT_MEMBERS_KEY = "uxi_project_members_store";

export const INITIAL_TEAM_MEMBERS = [
  {
    id: "tm-1-ranjith",
    name: "Ranjith",
    email: "ranjith@uxitech.in",
    role: "Admin",
    title: "Founder & CEO",
    avatar_url: "/avatars/ranjith.png",
  },
  {
    id: "tm-2-hafi",
    name: "Hafi",
    email: "hafi@uxitech.in",
    role: "Admin",
    title: "Co-Founder & CTO",
    avatar_url: "/avatars/hafi.png",
  },
  {
    id: "tm-3-vedesh",
    name: "Vedesh",
    email: "vedesh@uxitech.in",
    role: "Admin",
    title: "Co-Founder & Head of Design",
    avatar_url: "/avatars/vedesh.png",
  },
  {
    id: "tm-4-praneeth",
    name: "Praneeth",
    email: "praneeth@uxitech.in",
    role: "Admin",
    title: "Co-Founder & Lead Engineer",
    avatar_url: "/avatars/praneeth.png",
  },
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_PROJECT_MEMBERS: Record<string, string[]> = {};

export class ProjectService {
  private static getLocalProjects(): Project[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_PROJECTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  }


  private static saveLocalProjects(projects: Project[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
    } catch (err) {
      console.error("Failed to save local projects:", err);
    }
  }

  private static getLocalMembersMap(): Record<string, string[]> {
    if (typeof window === "undefined") return INITIAL_PROJECT_MEMBERS;
    try {
      const stored = localStorage.getItem(LOCAL_PROJECT_MEMBERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(LOCAL_PROJECT_MEMBERS_KEY, JSON.stringify(INITIAL_PROJECT_MEMBERS));
      return INITIAL_PROJECT_MEMBERS;
    } catch {
      return INITIAL_PROJECT_MEMBERS;
    }
  }

  private static saveLocalMembersMap(map: Record<string, string[]>) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_PROJECT_MEMBERS_KEY, JSON.stringify(map));
    } catch (err) {
      console.error("Failed to save local project members:", err);
    }
  }

  static getTeamMembers() {
    return INITIAL_TEAM_MEMBERS;
  }

  static generateNextProjectCode(): string {
    const projects = this.getLocalProjects();
    const currentYear = new Date().getFullYear();
    const prefix = `UXI-${currentYear}-`;

    const existingNums = projects
      .map((p) => {
        if (p.project_code && p.project_code.startsWith(prefix)) {
          const numPart = p.project_code.replace(prefix, "");
          return parseInt(numPart, 10);
        }
        return 0;
      })
      .filter((n) => !isNaN(n));

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, "0")}`;
  }

  static async getProjects(params?: {
    search?: string;
    status?: ProjectStatus | "All";
    priority?: ProjectPriority | "All";
    projectType?: ProjectType | "All";
    clientId?: string;
    teamMemberId?: string;
    deadlineFilter?: DeadlineFilterOption;
    isArchived?: boolean;
    sortBy?: ProjectSortOption;
  }): Promise<ProjectWithDetails[]> {
    let rawProjects: Project[] = [];
    const isArchivedTarget = params?.isArchived ?? false;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("projects").select("*").eq("is_archived", isArchivedTarget);

        if (params?.status && params.status !== "All") {
          query = query.eq("project_status", params.status);
        }
        if (params?.priority && params.priority !== "All") {
          query = query.eq("priority", params.priority);
        }
        if (params?.projectType && params.projectType !== "All") {
          query = query.eq("project_type", params.projectType);
        }
        if (params?.clientId) {
          query = query.eq("client_id", params.clientId);
        }

        const { data, error } = await query;
        if (error) {
          console.error("Supabase project query error:", error);
          rawProjects = [];
        } else if (!data) {
          rawProjects = [];
        } else {
          rawProjects = data as unknown as Project[];
        }
      } catch (err) {
        console.error("Supabase project query exception:", err);
        rawProjects = [];
      }
    } else {
      rawProjects = this.getLocalProjects().filter((p) => p.is_archived === isArchivedTarget);

      if (params?.status && params.status !== "All") {
        rawProjects = rawProjects.filter((p) => p.project_status === params.status);
      }
      if (params?.priority && params.priority !== "All") {
        rawProjects = rawProjects.filter((p) => p.priority === params.priority);
      }
      if (params?.projectType && params.projectType !== "All") {
        rawProjects = rawProjects.filter((p) => p.project_type === params.projectType);
      }
      if (params?.clientId) {
        rawProjects = rawProjects.filter((p) => p.client_id === params.clientId);
      }
    }

    const allClients = await ClientService.getClients();
    const membersMap = this.getLocalMembersMap();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map projects into ProjectWithDetails
    let detailedProjects: ProjectWithDetails[] = rawProjects.map((p) => {
      const client = allClients.find((c) => c.id === p.client_id) || null;
      const assignedIds = membersMap[p.id] || ["tm-1-ranjith"];
      const team_members: ProjectMember[] = assignedIds.map((mid) => {
        const tm = INITIAL_TEAM_MEMBERS.find((m) => m.id === mid) || INITIAL_TEAM_MEMBERS[0];
        return {
          id: `pm-${p.id}-${tm.id}`,
          project_id: p.id,
          team_member_id: tm.id,
          name: tm.name,
          email: tm.email,
          role: tm.role,
          title: tm.title,
          avatar_url: tm.avatar_url,
          assigned_at: p.created_at,
        };
      });

      let isOverdue = false;
      let daysRemaining: number | null = null;

      if (p.estimated_deadline) {
        const deadlineDate = new Date(p.estimated_deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffMs = deadlineDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (
          daysRemaining < 0 &&
          !["Completed", "Delivered", "Cancelled"].includes(p.project_status)
        ) {
          isOverdue = true;
        }
      }

      const progress = PROJECT_STATUS_PROGRESS[p.project_status] ?? 50;

      return {
        ...p,
        client,
        client_name: client ? client.full_name : "Direct Client",
        client_company: client ? client.company_name || client.full_name : "Enterprise Client",
        team_members,
        progress_percent: progress,
        is_overdue: isOverdue,
        days_remaining: daysRemaining,
      };
    });

    // Team Member Filter
    if (params?.teamMemberId && params.teamMemberId !== "All") {
      detailedProjects = detailedProjects.filter((p) =>
        p.team_members.some((tm) => tm.team_member_id === params.teamMemberId)
      );
    }

    // Deadline Filter
    if (params?.deadlineFilter && params.deadlineFilter !== "all") {
      if (params.deadlineFilter === "overdue") {
        detailedProjects = detailedProjects.filter((p) => p.is_overdue);
      } else if (params.deadlineFilter === "due_today") {
        detailedProjects = detailedProjects.filter((p) => p.days_remaining === 0);
      } else if (params.deadlineFilter === "this_week") {
        detailedProjects = detailedProjects.filter((p) => p.days_remaining !== null && p.days_remaining >= 0 && p.days_remaining <= 7);
      } else if (params.deadlineFilter === "this_month") {
        detailedProjects = detailedProjects.filter((p) => p.days_remaining !== null && p.days_remaining >= 0 && p.days_remaining <= 30);
      } else if (params.deadlineFilter === "no_deadline") {
        detailedProjects = detailedProjects.filter((p) => !p.estimated_deadline);
      }
    }

    // Search filter (Project name, code, client name, company, project type)
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      detailedProjects = detailedProjects.filter(
        (p) =>
          p.project_name.toLowerCase().includes(q) ||
          p.project_code.toLowerCase().includes(q) ||
          p.project_type.toLowerCase().includes(q) ||
          p.client_name.toLowerCase().includes(q) ||
          p.client_company.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sort = params?.sortBy || "recently_created";
    detailedProjects.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sort === "name_asc") {
        return a.project_name.localeCompare(b.project_name);
      } else if (sort === "name_desc") {
        return b.project_name.localeCompare(a.project_name);
      } else if (sort === "highest_budget") {
        return Number(b.final_budget || 0) - Number(a.final_budget || 0);
      } else if (sort === "lowest_budget") {
        return Number(a.final_budget || 0) - Number(b.final_budget || 0);
      } else if (sort === "deadline_nearest") {
        if (!a.estimated_deadline) return 1;
        if (!b.estimated_deadline) return -1;
        return new Date(a.estimated_deadline).getTime() - new Date(b.estimated_deadline).getTime();
      } else if (sort === "deadline_furthest") {
        if (!a.estimated_deadline) return 1;
        if (!b.estimated_deadline) return -1;
        return new Date(b.estimated_deadline).getTime() - new Date(a.estimated_deadline).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return detailedProjects;
  }

  static async getProjectById(id: string): Promise<ProjectWithDetails | null> {
    const all = await this.getProjects({ isArchived: false });
    const match = all.find((p) => p.id === id);
    if (match) return match;

    // Check archived list
    const archived = await this.getProjects({ isArchived: true });
    return archived.find((p) => p.id === id) || null;
  }

  static async getStats(): Promise<ProjectStats> {
    const activeProjects = await this.getProjects({ isArchived: false });
    const allProjects = [...activeProjects, ...(await this.getProjects({ isArchived: true }))];

    const activeList = activeProjects.filter(
      (p) => !["Completed", "Delivered", "Cancelled"].includes(p.project_status)
    );
    const completedList = allProjects.filter((p) => p.project_status === "Completed" || p.project_status === "Delivered");
    const overdueList = activeProjects.filter((p) => p.is_overdue);
    const totalContractValue = allProjects.reduce((sum, p) => sum + Number(p.final_budget || 0), 0);

    return {
      totalProjects: allProjects.length,
      activeProjects: activeList.length,
      completedProjects: completedList.length,
      overdueProjects: overdueList.length,
      totalContractValue,
    };
  }

  static async createProject(
    data: ProjectFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; project?: Project; error?: string }> {
    const finalBudget = Number(data.final_budget || data.estimated_budget || 0);
    const advanceAmount = Number(data.advance_amount || 0);
    const pendingAmount = Math.max(0, finalBudget - advanceAmount);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const insertPayload: Record<string, unknown> = {
          client_id: data.client_id,
          project_name: data.project_name.trim(),
          project_code: data.project_code?.trim() || this.generateNextProjectCode(),
          project_type: data.project_type || "Web Application",
          description: data.description?.trim() || null,
          requirements: data.requirements?.trim() || null,
          project_status: data.project_status || "Confirmed",
          priority: data.priority || "Medium",
          estimated_budget: Number(data.estimated_budget || 0),
          final_budget: finalBudget,
          currency: data.currency || "INR",
          advance_amount: advanceAmount,
          total_paid_amount: advanceAmount,
          pending_amount: pendingAmount,
          start_date: data.start_date || null,
          estimated_deadline: data.estimated_deadline || null,
          actual_completion_date: null,
          project_url: data.project_url?.trim() || null,
          repository_url: data.repository_url?.trim() || null,
          project_notes: data.project_notes?.trim() || null,
          is_archived: false,
          archived_at: null,
          created_by: user?.id || null,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("projects") as any)
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          console.error("Supabase project insert error:", error);
          return { success: false, error: error.message };
        }

        const project = inserted as unknown as Project;
        await ClientService.logActivity(
          actorName,
          "created new project",
          `${project.project_name} (${project.project_code})`,
          project.id
        );
        return { success: true, project };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create project";
        return { success: false, error: msg };
      }
    } else {
      const newProject: Project = {
        id: crypto.randomUUID ? crypto.randomUUID() : "proj-" + Date.now(),
        client_id: data.client_id,
        project_name: data.project_name.trim(),
        project_code: data.project_code?.trim() || this.generateNextProjectCode(),
        project_type: data.project_type || "Web Application",
        description: data.description?.trim() || null,
        requirements: data.requirements?.trim() || null,
        project_status: data.project_status || "Confirmed",
        priority: data.priority || "Medium",
        estimated_budget: Number(data.estimated_budget || 0),
        final_budget: finalBudget,
        currency: data.currency || "INR",
        advance_amount: advanceAmount,
        total_paid_amount: advanceAmount,
        pending_amount: pendingAmount,
        start_date: data.start_date || null,
        estimated_deadline: data.estimated_deadline || null,
        actual_completion_date: null,
        project_url: data.project_url?.trim() || null,
        repository_url: data.repository_url?.trim() || null,
        project_notes: data.project_notes?.trim() || null,
        is_archived: false,
        archived_at: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const local = this.getLocalProjects();
      local.unshift(newProject);
      this.saveLocalProjects(local);

      // Save assigned team members
      if (data.team_member_ids && data.team_member_ids.length > 0) {
        const membersMap = this.getLocalMembersMap();
        membersMap[newProject.id] = data.team_member_ids;
        this.saveLocalMembersMap(membersMap);
      }

      await ClientService.logActivity(
        actorName,
        "created new project",
        `${newProject.project_name} (${newProject.project_code})`,
        newProject.id
      );
      return { success: true, project: newProject };
    }
  }


  static async updateProject(
    id: string,
    data: Partial<ProjectFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; project?: Project; error?: string }> {
    const finalBudget = data.final_budget !== undefined ? Number(data.final_budget) : undefined;
    const advance = data.advance_amount !== undefined ? Number(data.advance_amount) : undefined;

    let pending: number | undefined;
    if (finalBudget !== undefined && advance !== undefined) {
      pending = Math.max(0, finalBudget - advance);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: updated, error } = await (supabase.from("projects") as any)
          .update({
            ...data,
            ...(pending !== undefined ? { pending_amount: pending } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const project = updated as unknown as Project;
        await ClientService.logActivity(actorName, "updated project details for", `${project.project_name}`, project.id);
        return { success: true, project };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update project";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalProjects();
      const idx = local.findIndex((p) => p.id === id);
      if (idx === -1) {
        return { success: false, error: "Project not found." };
      }

      const existing = local[idx];
      const updatedProject: Project = {
        ...existing,
        ...data,
        final_budget: finalBudget !== undefined ? finalBudget : existing.final_budget,
        advance_amount: advance !== undefined ? advance : existing.advance_amount,
        pending_amount: pending !== undefined ? pending : existing.pending_amount,
        updated_at: new Date().toISOString(),
      };

      local[idx] = updatedProject;
      this.saveLocalProjects(local);

      if (data.team_member_ids) {
        const membersMap = this.getLocalMembersMap();
        membersMap[id] = data.team_member_ids;
        this.saveLocalMembersMap(membersMap);
      }

      await ClientService.logActivity(actorName, "updated project details for", `${updatedProject.project_name}`, updatedProject.id);
      return { success: true, project: updatedProject };
    }
  }

  static async updateProjectStatus(
    id: string,
    newStatus: ProjectStatus,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const completionDate = newStatus === "Completed" || newStatus === "Delivered" ? new Date().toISOString().split("T")[0] : null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("projects") as any)
          .update({
            project_status: newStatus,
            actual_completion_date: completionDate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update status";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalProjects();
      const idx = local.findIndex((p) => p.id === id);
      if (idx !== -1) {
        local[idx].project_status = newStatus;
        local[idx].actual_completion_date = completionDate;
        local[idx].updated_at = new Date().toISOString();
        this.saveLocalProjects(local);
      }
    }

    const project = await this.getProjectById(id);
    await ClientService.logActivity(
      actorName,
      `changed project status to ${newStatus} for`,
      project?.project_name || "Project",
      id
    );

    return { success: true };
  }

  static async archiveProject(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const project = await this.getProjectById(id);
    const newArchiveState = !project?.is_archived;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("projects") as any)
          .update({
            is_archived: newArchiveState,
            archived_at: newArchiveState ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to archive project";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalProjects();
      const idx = local.findIndex((p) => p.id === id);
      if (idx !== -1) {
        local[idx].is_archived = newArchiveState;
        local[idx].archived_at = newArchiveState ? new Date().toISOString() : null;
        local[idx].updated_at = new Date().toISOString();
        this.saveLocalProjects(local);
      }
    }

    await ClientService.logActivity(
      actorName,
      newArchiveState ? "archived project" : "restored project from archive",
      project?.project_name || "Project",
      id
    );

    return { success: true };
  }

  static async deleteProject(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const project = await this.getProjectById(id);
    const projectName = project ? `${project.project_name} (${project.project_code})` : "Project";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete project";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalProjects().filter((p) => p.id !== id);
      this.saveLocalProjects(local);

      const membersMap = this.getLocalMembersMap();
      delete membersMap[id];
      this.saveLocalMembersMap(membersMap);
    }

    await ClientService.logActivity(actorName, "deleted project record", projectName, id);
    return { success: true };
  }

  static async assignTeamMember(
    projectId: string,
    memberId: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const membersMap = this.getLocalMembersMap();
    const current = membersMap[projectId] || [];
    if (!current.includes(memberId)) {
      current.push(memberId);
      membersMap[projectId] = current;
      this.saveLocalMembersMap(membersMap);

      const member = INITIAL_TEAM_MEMBERS.find((m) => m.id === memberId);
      const project = await this.getProjectById(projectId);
      await ClientService.logActivity(
        actorName,
        `assigned ${member?.name || "member"} to`,
        project?.project_name || "Project",
        projectId
      );
    }
    return { success: true };
  }

  static async removeTeamMember(
    projectId: string,
    memberId: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const membersMap = this.getLocalMembersMap();
    let current = membersMap[projectId] || [];
    current = current.filter((id) => id !== memberId);
    membersMap[projectId] = current;
    this.saveLocalMembersMap(membersMap);

    const member = INITIAL_TEAM_MEMBERS.find((m) => m.id === memberId);
    const project = await this.getProjectById(projectId);
    await ClientService.logActivity(
      actorName,
      `removed ${member?.name || "member"} from`,
      project?.project_name || "Project",
      projectId
    );

    return { success: true };
  }
}
