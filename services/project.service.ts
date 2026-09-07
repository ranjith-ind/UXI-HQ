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

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    client_id: "c1-finpulse-uuid",
    project_name: "FinPulse Banking Portal",
    project_code: "UXI-2026-001",
    project_type: "Web Application",
    description: "Next-generation merchant portal and core banking analytics dashboard with KYC verification flow.",
    requirements: "1. Secure OAuth2 & 2FA Auth\n2. Real-time transaction webhooks\n3. High-throughput ledger reconciliation\n4. Dark mode banking UI",
    project_status: "Development",
    priority: "Urgent",
    estimated_budget: 450000,
    final_budget: 450000,
    currency: "INR",
    advance_amount: 225000,
    total_paid_amount: 225000,
    pending_amount: 225000,
    start_date: "2026-07-28",
    estimated_deadline: "2026-09-15",
    actual_completion_date: null,
    project_url: "https://portal.finpulse.io",
    repository_url: "https://github.com/uxi-tech/finpulse-banking-portal",
    project_notes: "Milestone #2 frontend integration is active. Lead engineer Praneeth handling database caching.",
    is_archived: false,
    archived_at: null,
    created_by: "f1-ranjith-uuid",
    created_at: "2026-07-28T10:00:00Z",
    updated_at: "2026-08-29T14:30:00Z",
  },
  {
    id: "proj-2",
    client_id: "c2-aura-uuid",
    project_name: "Aura Luxury Ecommerce",
    project_code: "UXI-2026-002",
    project_type: "E-Commerce Website",
    description: "Headless luxury brand storefront with 3D product view, Shopify Plus integration and customized checkout experience.",
    requirements: "1. Headless Next.js storefront\n2. Ultra-fast sub-second page loads\n3. Custom product 3D carousel\n4. Multi-currency checkout",
    project_status: "Client Review",
    priority: "High",
    estimated_budget: 320000,
    final_budget: 320000,
    currency: "INR",
    advance_amount: 200000,
    total_paid_amount: 200000,
    pending_amount: 120000,
    start_date: "2026-07-15",
    estimated_deadline: "2026-09-05",
    actual_completion_date: null,
    project_url: "https://aurabrands.com",
    repository_url: "https://github.com/uxi-tech/aura-luxury-storefront",
    project_notes: "Design lead Vedesh presented the staging build to Sophia Laurent. Final sign-off pending this week.",
    is_archived: false,
    archived_at: null,
    created_by: "f3-vedesh-uuid",
    created_at: "2026-07-15T08:00:00Z",
    updated_at: "2026-08-29T10:45:00Z",
  },
  {
    id: "proj-3",
    client_id: "c3-omnihealth-uuid",
    project_name: "OmniHealth Patient Cloud",
    project_code: "UXI-2026-003",
    project_type: "SaaS Platform",
    description: "Telemedicine patient record portal, automated prescription manager and doctor calendar system.",
    requirements: "1. HIPAA compliant cloud storage\n2. WebRTC video consultation\n3. Patient health vitals telemetry\n4. SMS/WhatsApp alerts",
    project_status: "Designing",
    priority: "High",
    estimated_budget: 680000,
    final_budget: 680000,
    currency: "INR",
    advance_amount: 340000,
    total_paid_amount: 340000,
    pending_amount: 340000,
    start_date: "2026-08-10",
    estimated_deadline: "2026-09-28",
    actual_completion_date: null,
    project_url: "https://cloud.omnihealthcare.in",
    repository_url: "https://github.com/uxi-tech/omnihealth-cloud",
    project_notes: "CTO Hafi leading distributed system setup on Google Cloud with microservices.",
    is_archived: false,
    archived_at: null,
    created_by: "f2-hafi-uuid",
    created_at: "2026-08-10T12:00:00Z",
    updated_at: "2026-08-29T12:15:00Z",
  },
  {
    id: "proj-4",
    client_id: "c4-nexus-uuid",
    project_name: "Nexus Global Logistics CMS",
    project_code: "UXI-2026-004",
    project_type: "Custom Software",
    description: "Enterprise logistics container tracking, driver route dispatch and multi-warehouse inventory CMS.",
    requirements: "1. Real-time GPS container tracking\n2. Multi-region warehouse inventory\n3. Driver mobile dispatch",
    project_status: "Discussion",
    priority: "Medium",
    estimated_budget: 520000,
    final_budget: 520000,
    currency: "INR",
    advance_amount: 0,
    total_paid_amount: 0,
    pending_amount: 520000,
    start_date: "2026-08-28",
    estimated_deadline: "2026-10-12",
    actual_completion_date: null,
    project_url: null,
    repository_url: "https://github.com/uxi-tech/nexus-freight-cms",
    project_notes: "CEO Ranjith in talks with David Sterling for scope lock and initial 40% advance milestone.",
    is_archived: false,
    archived_at: null,
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-28T15:00:00Z",
    updated_at: "2026-08-28T18:20:00Z",
  },
  {
    id: "proj-5",
    client_id: "c5-krypton-uuid",
    project_name: "Krypton Web3 Exchange UI",
    project_code: "UXI-2026-005",
    project_type: "Admin Dashboard",
    description: "High-frequency trading terminal and cryptocurrency liquidity dashboard with WebSockets.",
    requirements: "1. Low latency WebSocket charts\n2. Orderbook depth visualization\n3. Multi-wallet Web3 connection",
    project_status: "Completed",
    priority: "Medium",
    estimated_budget: 380000,
    final_budget: 380000,
    currency: "INR",
    advance_amount: 380000,
    total_paid_amount: 380000,
    pending_amount: 0,
    start_date: "2026-06-15",
    estimated_deadline: "2026-08-20",
    actual_completion_date: "2026-08-20",
    project_url: "https://kryptonlabs.io",
    repository_url: "https://github.com/uxi-tech/krypton-exchange-ui",
    project_notes: "Project completed with 100% client satisfaction and 5-star testimonial.",
    is_archived: false,
    archived_at: null,
    created_by: "f4-praneeth-uuid",
    created_at: "2026-06-15T09:00:00Z",
    updated_at: "2026-08-20T16:00:00Z",
  },
];

export const INITIAL_PROJECT_MEMBERS: Record<string, string[]> = {
  "proj-1": ["tm-1-ranjith", "tm-4-praneeth"],
  "proj-2": ["tm-3-vedesh", "tm-1-ranjith"],
  "proj-3": ["tm-2-hafi", "tm-4-praneeth"],
  "proj-4": ["tm-1-ranjith", "tm-2-hafi"],
  "proj-5": ["tm-4-praneeth", "tm-3-vedesh"],
};

export class ProjectService {
  private static getLocalProjects(): Project[] {
    if (typeof window === "undefined") return INITIAL_PROJECTS;
    try {
      const stored = localStorage.getItem(LOCAL_PROJECTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
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
        if (error || !data) {
          rawProjects = this.getLocalProjects();
        } else {
          rawProjects = data as unknown as Project[];
        }
      } catch {
        rawProjects = this.getLocalProjects();
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

    const newProject: Project = {
      id: "proj-" + Math.random().toString(36).substring(2, 9) + Date.now(),
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

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("projects") as any)
          .insert(newProject)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const project = inserted as unknown as Project;
        await ClientService.logActivity(actorName, "created new project", `${project.project_name} (${project.project_code})`, project.id);
        return { success: true, project };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create project";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalProjects();
      local.unshift(newProject);
      this.saveLocalProjects(local);

      // Save assigned team members
      if (data.team_member_ids && data.team_member_ids.length > 0) {
        const membersMap = this.getLocalMembersMap();
        membersMap[newProject.id] = data.team_member_ids;
        this.saveLocalMembersMap(membersMap);
      }

      await ClientService.logActivity(actorName, "created new project", `${newProject.project_name} (${newProject.project_code})`, newProject.id);
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
