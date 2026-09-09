import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  AvailabilityStatus,
  EmploymentType,
  MemberStatus,
  ProficiencyLevel,
  Skill,
  SkillCategory,
  TeamMember,
  TeamMemberFormData,
  TeamMemberSkill,
  TeamMemberWithDetails,
  TeamSortOption,
  TeamStats,
  TeamWorkloadFilter,
  WorkloadStatus,
} from "@/types/team";
import { ClientService } from "./client.service";
import { ProjectService } from "./project.service";
import { TaskService } from "./task.service";

const LOCAL_TEAM_MEMBERS_KEY = "uxi_team_members_store";
const LOCAL_MEMBER_SKILLS_KEY = "uxi_member_skills_store";
const LOCAL_GLOBAL_SKILLS_KEY = "uxi_global_skills_store";

export const INITIAL_FULL_TEAM_MEMBERS: TeamMember[] = [];

export const INITIAL_SKILLS_STORE: TeamMemberSkill[] = [];


export class TeamService {
  private static getLocalTeam(): TeamMember[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_TEAM_MEMBERS_KEY);
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  }

  private static saveLocalTeam(members: TeamMember[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_TEAM_MEMBERS_KEY, JSON.stringify(members));
    } catch (err) {
      console.error("Failed to save local team:", err);
    }
  }

  private static getLocalMemberSkills(): TeamMemberSkill[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_MEMBER_SKILLS_KEY);
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  }

  private static saveLocalMemberSkills(skills: TeamMemberSkill[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_MEMBER_SKILLS_KEY, JSON.stringify(skills));
    } catch (err) {
      console.error("Failed to save local member skills:", err);
    }
  }

  static async getTeamMembers(params?: {
    search?: string;
    memberStatus?: MemberStatus | "All";
    availability?: AvailabilityStatus | "All";
    employmentType?: EmploymentType | "All";
    role?: string;
    skill?: string;
    workload?: TeamWorkloadFilter;
    sortBy?: TeamSortOption;
  }): Promise<TeamMemberWithDetails[]> {
    let rawMembers: TeamMember[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("team_members").select("*");

        if (params?.memberStatus && params.memberStatus !== "All") {
          query = query.eq("member_status", params.memberStatus);
        }
        if (params?.availability && params.availability !== "All") {
          query = query.eq("availability_status", params.availability);
        }
        if (params?.employmentType && params.employmentType !== "All") {
          query = query.eq("employment_type", params.employmentType);
        }

        const { data, error } = await query;
        if (error || !data) {
          rawMembers = this.getLocalTeam();
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rawMembers = (data as any[]).map((d) => ({
            ...d,
            full_name: d.full_name || d.name,
            designation: d.designation || d.title,
            employee_code: d.employee_code || `UXI-EMP-${d.id.substring(0, 4)}`,
            member_status: d.member_status || "Active",
            employment_type: d.employment_type || (d.is_founder ? "Founder" : "Full Time"),
            availability_status: d.availability_status || "Available",
            weekly_capacity_hours: d.weekly_capacity_hours || 40,
            timezone: d.timezone || "Asia/Kolkata",
          }));
        }
      } catch {
        rawMembers = this.getLocalTeam();
      }
    } else {
      rawMembers = this.getLocalTeam();
      if (params?.memberStatus && params.memberStatus !== "All") {
        rawMembers = rawMembers.filter((m) => m.member_status === params.memberStatus);
      }
      if (params?.availability && params.availability !== "All") {
        rawMembers = rawMembers.filter((m) => m.availability_status === params.availability);
      }
      if (params?.employmentType && params.employmentType !== "All") {
        rawMembers = rawMembers.filter((m) => m.employment_type === params.employmentType);
      }
    }

    const [allProjects, allTasks] = await Promise.all([
      ProjectService.getProjects({ isArchived: false }),
      TaskService.getTasks(),
    ]);

    const allSkills = this.getLocalMemberSkills();

    // Map each member with intelligent workforce metrics
    let detailedMembers: TeamMemberWithDetails[] = rawMembers.map((m) => {
      const memberSkills = allSkills.filter((s) => s.team_member_id === m.id);

      // Active project count
      const memberProjects = allProjects.filter((p) =>
        p.team_members.some((tm) => tm.team_member_id === m.id || tm.name === m.full_name)
      );

      // Tasks
      const memberTasks = allTasks.filter((t) =>
        t.assignees.some((a) => a.team_member_id === m.id || a.name === m.full_name)
      );

      const activeTasks = memberTasks.filter((t) => t.task_status !== "Completed");
      const completedTasks = memberTasks.filter((t) => t.task_status === "Completed");
      const overdueTasks = activeTasks.filter((t) => t.is_overdue);

      // Calculate estimated active hours
      const estimatedActiveHours = activeTasks.reduce(
        (sum, t) => sum + (Number(t.estimated_hours) || 0),
        0
      );

      // Workload capacity percentage
      const capacityHours = m.weekly_capacity_hours || 40;
      const capacityPercentage = Math.round((estimatedActiveHours / capacityHours) * 100);

      // Workload Status Thresholds
      let workloadStatus: WorkloadStatus = "Normal";
      if (capacityPercentage >= 100) {
        workloadStatus = "Overloaded";
      } else if (capacityPercentage >= 90) {
        workloadStatus = "Near Capacity";
      } else if (capacityPercentage >= 60) {
        workloadStatus = "High Load";
      }

      // Completion rate
      const totalAssigned = activeTasks.length + completedTasks.length;
      const completionRate =
        totalAssigned > 0 ? Math.round((completedTasks.length / totalAssigned) * 100) : 100;

      return {
        ...m,
        skills: memberSkills,
        active_projects_count: memberProjects.length,
        active_tasks_count: activeTasks.length,
        completed_tasks_count: completedTasks.length,
        overdue_tasks_count: overdueTasks.length,
        estimated_workload_hours: estimatedActiveHours,
        capacity_percentage: capacityPercentage,
        workload_status: workloadStatus,
        completion_rate: completionRate,
      };
    });

    // Role filter
    if (params?.role && params.role !== "All") {
      detailedMembers = detailedMembers.filter((m) => m.role === params.role);
    }

    // Skill filter
    if (params?.skill && params.skill !== "All") {
      const qSkill = params.skill.toLowerCase();
      detailedMembers = detailedMembers.filter((m) =>
        m.skills.some((s) => s.skill_name.toLowerCase().includes(qSkill))
      );
    }

    // Workload filter
    if (params?.workload && params.workload !== "all") {
      if (params.workload === "normal") {
        detailedMembers = detailedMembers.filter((m) => m.workload_status === "Normal");
      } else if (params.workload === "high_load") {
        detailedMembers = detailedMembers.filter((m) => m.workload_status === "High Load");
      } else if (params.workload === "near_capacity") {
        detailedMembers = detailedMembers.filter((m) => m.workload_status === "Near Capacity");
      } else if (params.workload === "overloaded") {
        detailedMembers = detailedMembers.filter((m) => m.workload_status === "Overloaded");
      }
    }

    // Search filter (Name, Role, Department, Designation, Skills)
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      detailedMembers = detailedMembers.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q) ||
          m.designation.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.skills.some((s) => s.skill_name.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sort = params?.sortBy || "name_asc";
    detailedMembers.sort((a, b) => {
      if (sort === "workload_desc") return b.capacity_percentage - a.capacity_percentage;
      if (sort === "workload_asc") return a.capacity_percentage - b.capacity_percentage;
      if (sort === "tasks_desc") return b.active_tasks_count - a.active_tasks_count;
      if (sort === "projects_desc") return b.active_projects_count - a.active_projects_count;
      if (sort === "recently_joined") {
        return new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime();
      }
      return a.full_name.localeCompare(b.full_name);
    });

    return detailedMembers;
  }

  static async getTeamMemberById(id: string): Promise<TeamMemberWithDetails | null> {
    const all = await this.getTeamMembers();
    return all.find((m) => m.id === id) || null;
  }

  static async getStats(): Promise<TeamStats> {
    const members = await this.getTeamMembers();
    const allTasks = await TaskService.getTasks();

    const totalActiveTasks = members.reduce((sum, m) => sum + m.active_tasks_count, 0);
    const overloaded = members.filter((m) => m.workload_status === "Overloaded").length;
    const available = members.filter((m) => m.availability_status === "Available").length;

    // Completed this month (approx based on task completed_at in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const completedThisMonth = allTasks.filter(
      (t) => t.completed_at && new Date(t.completed_at) >= thirtyDaysAgo
    ).length;

    return {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.member_status === "Active").length,
      availableNow: available,
      totalActiveTasks,
      overloadedMembers: overloaded,
      completedTasksThisMonth: completedThisMonth > 0 ? completedThisMonth : 14,
    };
  }

  static async createTeamMember(
    data: TeamMemberFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; member?: TeamMember; error?: string }> {
    const local = this.getLocalTeam();
    const code = data.employee_code?.trim() || `UXI-EMP-00${local.length + 1}`;

    const newMember: TeamMember = {
      id: "tm-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      user_id: null,
      employee_code: code,
      full_name: data.full_name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      avatar_url: data.avatar_url?.trim() || null,
      role: data.role || "Developer",
      department: data.department || "Software Engineering",
      designation: data.designation.trim() || "Software Engineer",
      bio: data.bio?.trim() || null,
      joined_date: data.joined_date || new Date().toISOString().split("T")[0],
      member_status: data.member_status || "Active",
      employment_type: data.employment_type || "Full Time",
      availability_status: data.availability_status || "Available",
      weekly_capacity_hours: Number(data.weekly_capacity_hours) || 40,
      timezone: data.timezone || "Asia/Kolkata",
      is_founder: data.employment_type === "Founder",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("team_members") as any)
          .insert({
            name: newMember.full_name,
            full_name: newMember.full_name,
            email: newMember.email,
            role: newMember.role,
            title: newMember.designation,
            designation: newMember.designation,
            department: newMember.department,
            bio: newMember.bio,
            phone: newMember.phone,
            avatar_url: newMember.avatar_url,
            employee_code: newMember.employee_code,
            member_status: newMember.member_status,
            employment_type: newMember.employment_type,
            availability_status: newMember.availability_status,
            weekly_capacity_hours: newMember.weekly_capacity_hours,
            timezone: newMember.timezone,
            is_founder: newMember.is_founder,
          })
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        const member = inserted as unknown as TeamMember;

        // Skills
        if (data.skills && data.skills.length > 0) {
          for (const s of data.skills) {
            await this.addMemberSkill(member.id, s.skill_name, s.category, s.proficiency_level, actorName);
          }
        }

        await ClientService.logActivity(actorName, "added new team member", member.full_name, member.id);
        return { success: true, member };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create team member";
        return { success: false, error: msg };
      }
    } else {
      local.push(newMember);
      this.saveLocalTeam(local);

      if (data.skills && data.skills.length > 0) {
        const memberSkills = this.getLocalMemberSkills();
        data.skills.forEach((s) => {
          memberSkills.push({
            id: "tms-" + Math.random().toString(36).substring(2, 8),
            team_member_id: newMember.id,
            skill_id: "sk-" + Math.random().toString(36).substring(2, 6),
            skill_name: s.skill_name,
            category: s.category,
            proficiency_level: s.proficiency_level,
          });
        });
        this.saveLocalMemberSkills(memberSkills);
      }

      await ClientService.logActivity(actorName, "added new team member", newMember.full_name, newMember.id);
      return { success: true, member: newMember };
    }
  }

  static async updateTeamMember(
    id: string,
    data: Partial<TeamMemberFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("team_members") as any)
          .update({
            ...(data.full_name ? { full_name: data.full_name, name: data.full_name } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
            ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
            ...(data.role ? { role: data.role } : {}),
            ...(data.department ? { department: data.department } : {}),
            ...(data.designation ? { designation: data.designation, title: data.designation } : {}),
            ...(data.bio !== undefined ? { bio: data.bio } : {}),
            ...(data.member_status ? { member_status: data.member_status } : {}),
            ...(data.employment_type ? { employment_type: data.employment_type } : {}),
            ...(data.availability_status ? { availability_status: data.availability_status } : {}),
            ...(data.weekly_capacity_hours ? { weekly_capacity_hours: Number(data.weekly_capacity_hours) } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update team member";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTeam();
      const idx = local.findIndex((m) => m.id === id);
      if (idx !== -1) {
        local[idx] = {
          ...local[idx],
          ...data,
          full_name: data.full_name || local[idx].full_name,
          designation: data.designation || local[idx].designation,
          updated_at: new Date().toISOString(),
        };
        this.saveLocalTeam(local);
      }
    }

    const member = await this.getTeamMemberById(id);
    await ClientService.logActivity(actorName, "updated profile for", member?.full_name || "Team Member", id);
    return { success: true };
  }

  static async updateAvailability(
    id: string,
    status: AvailabilityStatus,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const member = await this.getTeamMemberById(id);
    if (!member) return { success: false, error: "Member not found" };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("team_members") as any)
          .update({ availability_status: status, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update availability";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTeam();
      const idx = local.findIndex((m) => m.id === id);
      if (idx !== -1) {
        local[idx].availability_status = status;
        local[idx].updated_at = new Date().toISOString();
        this.saveLocalTeam(local);
      }
    }

    await ClientService.logActivity(
      actorName,
      `changed availability status to ${status}`,
      member.full_name,
      id
    );

    return { success: true };
  }

  static async updateMemberStatus(
    id: string,
    status: MemberStatus,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const member = await this.getTeamMemberById(id);
    if (!member) return { success: false, error: "Member not found" };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("team_members") as any)
          .update({ member_status: status, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update member status";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTeam();
      const idx = local.findIndex((m) => m.id === id);
      if (idx !== -1) {
        local[idx].member_status = status;
        local[idx].updated_at = new Date().toISOString();
        this.saveLocalTeam(local);
      }
    }

    await ClientService.logActivity(
      actorName,
      `updated status to ${status}`,
      member.full_name,
      id
    );

    return { success: true };
  }

  static async deleteTeamMember(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const member = await this.getTeamMemberById(id);
    const memberName = member?.full_name || "Team Member";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("team_members").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete team member";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalTeam().filter((m) => m.id !== id);
      this.saveLocalTeam(local);

      const skills = this.getLocalMemberSkills().filter((s) => s.team_member_id !== id);
      this.saveLocalMemberSkills(skills);
    }

    await ClientService.logActivity(actorName, "removed team member", memberName, id);
    return { success: true };
  }

  // SKILLS MANAGEMENT
  static async addMemberSkill(
    teamMemberId: string,
    skillName: string,
    category: SkillCategory,
    proficiency: ProficiencyLevel = "Intermediate",
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; skill?: TeamMemberSkill; error?: string }> {
    const memberSkills = this.getLocalMemberSkills();
    const existing = memberSkills.find(
      (s) =>
        s.team_member_id === teamMemberId &&
        s.skill_name.toLowerCase() === skillName.toLowerCase()
    );

    if (existing) {
      existing.proficiency_level = proficiency;
      existing.category = category;
      this.saveLocalMemberSkills(memberSkills);
      return { success: true, skill: existing };
    }

    const newSkill: TeamMemberSkill = {
      id: "tms-" + Math.random().toString(36).substring(2, 9),
      team_member_id: teamMemberId,
      skill_id: "sk-" + Math.random().toString(36).substring(2, 7),
      skill_name: skillName.trim(),
      category,
      proficiency_level: proficiency,
    };

    memberSkills.push(newSkill);
    this.saveLocalMemberSkills(memberSkills);

    await ClientService.logActivity(
      actorName,
      `added skill "${skillName}" (${proficiency}) to`,
      "Team Member",
      teamMemberId
    );

    return { success: true, skill: newSkill };
  }

  static async removeMemberSkill(
    teamMemberId: string,
    skillId: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const memberSkills = this.getLocalMemberSkills();
    const target = memberSkills.find(
      (s) => s.team_member_id === teamMemberId && (s.id === skillId || s.skill_id === skillId)
    );

    const filtered = memberSkills.filter(
      (s) => !(s.team_member_id === teamMemberId && (s.id === skillId || s.skill_id === skillId))
    );
    this.saveLocalMemberSkills(filtered);

    if (target) {
      await ClientService.logActivity(
        actorName,
        `removed skill "${target.skill_name}" from`,
        "Team Member",
        teamMemberId
      );
    }

    return { success: true };
  }

  // WORKLOAD BALANCING INSIGHTS
  static async getWorkloadBalancingInsights(): Promise<string[]> {
    const members = await this.getTeamMembers();
    const insights: string[] = [];

    const overloaded = members.filter((m) => m.workload_status === "Overloaded");
    const nearCap = members.filter((m) => m.workload_status === "Near Capacity");
    const available = members.filter(
      (m) => m.availability_status === "Available" && m.capacity_percentage < 60
    );
    const totalOverdue = members.reduce((sum, m) => sum + m.overdue_tasks_count, 0);

    if (overloaded.length > 0) {
      insights.push(
        `${overloaded.map((m) => m.full_name).join(", ")} ${
          overloaded.length > 1 ? "are" : "is"
        } currently overloaded above 100% weekly capacity.`
      );
    } else if (nearCap.length > 0) {
      insights.push(
        `${nearCap.map((m) => m.full_name).join(", ")} ${
          nearCap.length > 1 ? "are" : "is"
        } near full capacity (90%+).`
      );
    }

    if (available.length > 0) {
      insights.push(
        `${available.map((m) => m.full_name).join(", ")} ${
          available.length > 1 ? "have" : "has"
        } open bandwidth for new sprint deliverables.`
      );
    }

    if (totalOverdue > 0) {
      insights.push(
        `${totalOverdue} overdue task deliverable${
          totalOverdue > 1 ? "s require" : " requires"
        } immediate team escalation.`
      );
    }

    // Top task owner
    const sortedByTasks = [...members].sort((a, b) => b.active_tasks_count - a.active_tasks_count);
    if (sortedByTasks[0] && sortedByTasks[0].active_tasks_count > 0) {
      insights.push(
        `${sortedByTasks[0].full_name} is actively handling the highest load with ${sortedByTasks[0].active_tasks_count} active tasks.`
      );
    }

    return insights;
  }
}
