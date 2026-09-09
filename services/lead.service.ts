import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ALL_LEAD_STATUSES,
  LEAD_STAGE_PROBABILITIES,
  Lead,
  LeadFormData,
  LeadQuickFilter,
  LeadSortOption,
  LeadStats,
  LeadStatus,
  LeadWithDetails,
} from "@/types/lead";
import { LeadActivity, LeadActivityFormData } from "@/types/lead-activity";
import {
  LeadFollowUp,
  LeadFollowUpFormData,
  LeadFollowUpWithDetails,
} from "@/types/lead-followup";
import { ClientFormData } from "@/types/client";
import { ProjectFormData } from "@/types/project";
import { ClientService } from "./client.service";
import { ProjectService } from "./project.service";
import { TeamService } from "./team.service";

const LOCAL_LEADS_KEY = "uxi_leads_store";
const LOCAL_LEAD_ACTIVITIES_KEY = "uxi_lead_activities_store";
const LOCAL_LEAD_FOLLOWUPS_KEY = "uxi_lead_followups_store";

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_LEAD_ACTIVITIES: LeadActivity[] = [];

export const INITIAL_LEAD_FOLLOWUPS: LeadFollowUp[] = [];

export class LeadService {
  private static getLocalLeads(): Lead[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_LEADS_KEY);
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  }

  private static saveLocalLeads(leads: Lead[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(leads));
    } catch (err) {
      console.error("Failed to save local leads:", err);
    }
  }

  private static getLocalActivities(): LeadActivity[] {
    if (typeof window === "undefined") return INITIAL_LEAD_ACTIVITIES;
    try {
      const stored = localStorage.getItem(LOCAL_LEAD_ACTIVITIES_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_LEAD_ACTIVITIES_KEY, JSON.stringify(INITIAL_LEAD_ACTIVITIES));
      return INITIAL_LEAD_ACTIVITIES;
    } catch {
      return INITIAL_LEAD_ACTIVITIES;
    }
  }

  private static saveLocalActivities(activities: LeadActivity[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_LEAD_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch (err) {
      console.error("Failed to save local lead activities:", err);
    }
  }

  private static getLocalFollowUps(): LeadFollowUp[] {
    if (typeof window === "undefined") return INITIAL_LEAD_FOLLOWUPS;
    try {
      const stored = localStorage.getItem(LOCAL_LEAD_FOLLOWUPS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_LEAD_FOLLOWUPS_KEY, JSON.stringify(INITIAL_LEAD_FOLLOWUPS));
      return INITIAL_LEAD_FOLLOWUPS;
    } catch {
      return INITIAL_LEAD_FOLLOWUPS;
    }
  }

  private static saveLocalFollowUps(followUps: LeadFollowUp[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_LEAD_FOLLOWUPS_KEY, JSON.stringify(followUps));
    } catch (err) {
      console.error("Failed to save local lead followups:", err);
    }
  }

  static async generateNextLeadCode(): Promise<string> {
    const year = new Date().getFullYear();
    const all = await this.getLeads();
    const yearLeads = all.filter((l) => l.lead_code.includes(`UXI-LEAD-${year}`));
    const nextSeq = yearLeads.length + 1;
    const padded = nextSeq.toString().padStart(3, "0");
    return `UXI-LEAD-${year}-${padded}`;
  }

  static async getLeads(params?: {
    search?: string;
    status?: LeadStatus | "All";
    source?: string | "All";
    service?: string | "All";
    priority?: string | "All";
    assignedTo?: string;
    quickFilter?: LeadQuickFilter;
    sortBy?: LeadSortOption;
  }): Promise<LeadWithDetails[]> {
    let rawLeads: Lead[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("leads").select("*");

        if (params?.status && params.status !== "All") {
          query = query.eq("lead_status", params.status);
        }
        if (params?.source && params.source !== "All") {
          query = query.eq("lead_source", params.source);
        }
        if (params?.service && params.service !== "All") {
          query = query.eq("service_interest", params.service);
        }
        if (params?.priority && params.priority !== "All") {
          query = query.eq("priority", params.priority);
        }
        if (params?.assignedTo) {
          query = query.eq("assigned_to", params.assignedTo);
        }

        const { data, error } = await query;
        if (error) {
          console.error("Supabase lead query error:", error);
          rawLeads = [];
        } else if (!data) {
          rawLeads = [];
        } else {
          rawLeads = data as unknown as Lead[];
        }
      } catch (err) {
        console.error("Supabase lead query exception:", err);
        rawLeads = [];
      }
    } else {
      rawLeads = this.getLocalLeads();
      if (params?.status && params.status !== "All") {
        rawLeads = rawLeads.filter((l) => l.lead_status === params.status);
      }
      if (params?.source && params.source !== "All") {
        rawLeads = rawLeads.filter((l) => l.lead_source === params.source);
      }
      if (params?.service && params.service !== "All") {
        rawLeads = rawLeads.filter((l) => l.service_interest === params.service);
      }
      if (params?.priority && params.priority !== "All") {
        rawLeads = rawLeads.filter((l) => l.priority === params.priority);
      }
      if (params?.assignedTo) {
        rawLeads = rawLeads.filter((l) => l.assigned_to === params.assignedTo);
      }
    }

    const [teamMembers, clients, projects, allActivities, allFollowUps] = await Promise.all([
      TeamService.getTeamMembers(),
      ClientService.getClients(),
      ProjectService.getProjects({ isArchived: false }),
      this.getAllActivities(),
      this.getAllFollowUps(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let detailed: LeadWithDetails[] = rawLeads.map((lead) => {
      const assigned = teamMembers.find((m) => m.id === lead.assigned_to);
      const convertedClient = clients.find((c) => c.id === lead.converted_client_id);
      const convertedProject = projects.find((p) => p.id === lead.converted_project_id);

      const createdDate = new Date(lead.created_at);
      const daysInPipeline = Math.max(
        0,
        Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      let isFollowupOverdue = false;
      if (lead.next_follow_up_date) {
        const fDate = new Date(lead.next_follow_up_date);
        fDate.setHours(0, 0, 0, 0);
        if (fDate < today && lead.lead_status !== "Won" && lead.lead_status !== "Lost") {
          isFollowupOverdue = true;
        }
      }

      const activities = allActivities.filter((a) => a.lead_id === lead.id);
      const pendingFollowups = allFollowUps.filter(
        (f) => f.lead_id === lead.id && f.status === "Pending"
      );

      const weightedValue = Math.round((Number(lead.estimated_value) * Number(lead.probability)) / 100);

      return {
        ...lead,
        assigned_member_name: assigned?.full_name || null,
        assigned_member_avatar: assigned?.avatar_url || null,
        assigned_member_role: assigned?.designation || null,
        weighted_value: weightedValue,
        days_in_pipeline: daysInPipeline,
        is_followup_overdue: isFollowupOverdue,
        activities_count: activities.length,
        pending_followups_count: pendingFollowups.length,
        converted_client_name: convertedClient?.full_name || convertedClient?.company_name || null,
        converted_project_name: convertedProject?.project_name || null,
      };
    });

    // Quick filters
    if (params?.quickFilter && params.quickFilter !== "all") {
      const qf = params.quickFilter;
      if (qf === "due_today") {
        const todayStr = new Date().toISOString().split("T")[0];
        detailed = detailed.filter((l) => l.next_follow_up_date === todayStr);
      } else if (qf === "overdue_followups") {
        detailed = detailed.filter((l) => l.is_followup_overdue);
      } else if (qf === "high_value") {
        detailed = detailed.filter((l) => l.estimated_value >= 250000);
      } else if (qf === "unassigned") {
        detailed = detailed.filter((l) => !l.assigned_to);
      } else if (qf === "won") {
        detailed = detailed.filter((l) => l.lead_status === "Won");
      } else if (qf === "lost") {
        detailed = detailed.filter((l) => l.lead_status === "Lost");
      } else if (qf === "on_hold") {
        detailed = detailed.filter((l) => l.lead_status === "On Hold");
      }
    }

    // Search filter
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      detailed = detailed.filter(
        (l) =>
          l.lead_code.toLowerCase().includes(q) ||
          l.full_name.toLowerCase().includes(q) ||
          (l.company_name && l.company_name.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q)) ||
          (l.location && l.location.toLowerCase().includes(q)) ||
          l.service_interest.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sort = params?.sortBy || "recently_created";
    detailed.sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "highest_value") return b.estimated_value - a.estimated_value;
      if (sort === "lowest_value") return a.estimated_value - b.estimated_value;
      if (sort === "highest_probability") return b.probability - a.probability;
      if (sort === "name_asc") return a.full_name.localeCompare(b.full_name);
      if (sort === "expected_close_nearest") {
        if (!a.expected_close_date) return 1;
        if (!b.expected_close_date) return -1;
        return new Date(a.expected_close_date).getTime() - new Date(b.expected_close_date).getTime();
      }
      if (sort === "next_followup_nearest") {
        if (!a.next_follow_up_date) return 1;
        if (!b.next_follow_up_date) return -1;
        return new Date(a.next_follow_up_date).getTime() - new Date(b.next_follow_up_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return detailed;
  }

  static async getLeadById(id: string): Promise<LeadWithDetails | null> {
    const all = await this.getLeads();
    return all.find((l) => l.id === id) || null;
  }

  static async getLeadStats(): Promise<LeadStats> {
    const all = await this.getLeads();
    const active = all.filter((l) => l.lead_status !== "Won" && l.lead_status !== "Lost");
    const won = all.filter((l) => l.lead_status === "Won");
    const lost = all.filter((l) => l.lead_status === "Lost");

    const pipelineValue = active.reduce((sum, l) => sum + Number(l.estimated_value), 0);
    const weightedPipelineValue = active.reduce((sum, l) => sum + Number(l.weighted_value), 0);
    const wonValue = won.reduce((sum, l) => sum + Number(l.estimated_value), 0);

    const totalDecided = won.length + lost.length;
    const conversionRate = totalDecided > 0 ? Math.round((won.length / totalDecided) * 100) : 0;

    const followUps = await this.getAllFollowUps();
    const today = new Date().toISOString().split("T")[0];

    const overdueCount = followUps.filter(
      (f) => f.status === "Pending" && f.follow_up_date.split("T")[0] < today
    ).length;

    const dueTodayCount = followUps.filter(
      (f) => f.status === "Pending" && f.follow_up_date.split("T")[0] === today
    ).length;

    return {
      totalLeads: all.length,
      activeOpportunities: active.length,
      pipelineValue,
      weightedPipelineValue,
      wonCount: won.length,
      wonValue,
      lostCount: lost.length,
      conversionRate,
      overdueFollowupsCount: overdueCount,
      dueTodayFollowupsCount: dueTodayCount,
    };
  }

  static async createLead(
    data: LeadFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; lead?: Lead; error?: string }> {
    const leadCode = await this.generateNextLeadCode();
    const defaultProb = LEAD_STAGE_PROBABILITIES[data.lead_status] ?? 10;
    const probability = data.probability !== undefined ? data.probability : defaultProb;

    const newLead: Lead = {
      id: "lead-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      lead_code: leadCode,
      full_name: data.full_name.trim(),
      company_name: data.company_name?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      whatsapp_number: data.whatsapp_number?.trim() || null,
      location: data.location?.trim() || null,
      website: data.website?.trim() || null,
      lead_source: data.lead_source || "Website",
      lead_status: data.lead_status || "New",
      priority: data.priority || "Medium",
      service_interest: data.service_interest || "Web Application",
      estimated_value: Number(data.estimated_value) || 0,
      probability,
      expected_close_date: data.expected_close_date || null,
      next_follow_up_date: data.next_follow_up_date || null,
      last_contacted_at: new Date().toISOString(),
      assigned_to: data.assigned_to || null,
      description: data.description?.trim() || null,
      requirements: data.requirements?.trim() || null,
      notes: data.notes?.trim() || null,
      lost_reason: data.lost_reason?.trim() || null,
      on_hold_reason: data.on_hold_reason?.trim() || null,
      resume_date: data.resume_date || null,
      converted_client_id: null,
      converted_project_id: null,
      converted_at: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("leads") as any)
          .insert(newLead)
          .select()
          .single();
        if (error) return { success: false, error: error.message };

        await ClientService.logActivity(
          actorName,
          "created sales lead",
          `${newLead.full_name} (${newLead.lead_code})`,
          newLead.id
        );

        // Record initial activity
        await this.createLeadActivity(
          newLead.id,
          {
            activity_type: "Note",
            title: `Lead Record Initialized (${newLead.lead_code})`,
            description: `Lead created from source ${newLead.lead_source} with estimated value ₹${newLead.estimated_value.toLocaleString()}.`,
          },
          actorName
        );

        return { success: true, lead: inserted as unknown as Lead };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create lead";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalLeads();
      local.unshift(newLead);
      this.saveLocalLeads(local);

      await ClientService.logActivity(
        actorName,
        "created sales lead",
        `${newLead.full_name} (${newLead.lead_code})`,
        newLead.id
      );

      await this.createLeadActivity(
        newLead.id,
        {
          activity_type: "Note",
          title: `Lead Record Initialized (${newLead.lead_code})`,
          description: `Lead created from source ${newLead.lead_source} with estimated value ₹${newLead.estimated_value.toLocaleString()}.`,
        },
        actorName
      );

      return { success: true, lead: newLead };
    }
  }

  static async updateLead(
    id: string,
    data: Partial<LeadFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getLeadById(id);
    if (!existing) return { success: false, error: "Lead not found" };

    const updatedPayload = {
      ...data,
      estimated_value:
        data.estimated_value !== undefined ? Number(data.estimated_value) : existing.estimated_value,
      probability:
        data.probability !== undefined
          ? Number(data.probability)
          : data.lead_status && data.lead_status !== existing.lead_status
          ? LEAD_STAGE_PROBABILITIES[data.lead_status]
          : existing.probability,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("leads") as any)
          .update(updatedPayload)
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update lead";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalLeads();
      const idx = local.findIndex((l) => l.id === id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...updatedPayload };
        this.saveLocalLeads(local);
      }
    }

    await ClientService.logActivity(actorName, "updated lead details", existing.lead_code, id);
    return { success: true };
  }

  static async updateLeadStatus(
    id: string,
    newStatus: LeadStatus,
    lostReason?: string,
    onHoldReason?: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getLeadById(id);
    if (!existing) return { success: false, error: "Lead not found" };

    const newProbability = LEAD_STAGE_PROBABILITIES[newStatus] ?? existing.probability;

    const res = await this.updateLead(
      id,
      {
        lead_status: newStatus,
        probability: newProbability,
        lost_reason: lostReason || undefined,
        on_hold_reason: onHoldReason || undefined,
      },
      actorName
    );

    if (res.success) {
      await this.createLeadActivity(
        id,
        {
          activity_type: "Status Change",
          title: `Pipeline Stage Changed to "${newStatus}"`,
          description: `Stage updated from ${existing.lead_status} to ${newStatus}. Probability calibrated to ${newProbability}%.${
            lostReason ? ` Lost Reason: ${lostReason}` : ""
          }${onHoldReason ? ` Reason: ${onHoldReason}` : ""}`,
        },
        actorName
      );
    }

    return res;
  }

  static async assignLead(
    id: string,
    assignedTo: string | null,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getLeadById(id);
    if (!existing) return { success: false, error: "Lead not found" };

    const teamMembers = await TeamService.getTeamMembers();
    const assignedMember = teamMembers.find((m) => m.id === assignedTo);

    const res = await this.updateLead(id, { assigned_to: assignedTo || undefined }, actorName);
    if (res.success) {
      await this.createLeadActivity(
        id,
        {
          activity_type: "Note",
          title: assignedMember
            ? `Assigned to ${assignedMember.full_name}`
            : "Lead Unassigned",
          description: assignedMember
            ? `${assignedMember.full_name} (${assignedMember.designation}) assigned as opportunity owner.`
            : "Lead returned to unassigned queue.",
        },
        actorName
      );
    }

    return res;
  }

  static async deleteLead(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getLeadById(id);
    const code = existing?.lead_code || "Lead";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("leads").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete lead";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalLeads().filter((l) => l.id !== id);
      this.saveLocalLeads(local);
    }

    await ClientService.logActivity(actorName, "deleted lead record", code, id);
    return { success: true };
  }

  // ==============================================================================
  // ACTIVITIES
  // ==============================================================================
  private static async getAllActivities(): Promise<LeadActivity[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("lead_activities")
          .select("*")
          .order("activity_date", { ascending: false });
        if (error || !data) return this.getLocalActivities();
        return data as unknown as LeadActivity[];
      } catch {
        return this.getLocalActivities();
      }
    }
    return this.getLocalActivities();
  }

  static async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    const all = await this.getAllActivities();
    return all
      .filter((a) => a.lead_id === leadId)
      .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());
  }

  static async createLeadActivity(
    leadId: string,
    data: LeadActivityFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; activity?: LeadActivity; error?: string }> {
    const newAct: LeadActivity = {
      id: "act-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      lead_id: leadId,
      activity_type: data.activity_type || "Note",
      title: data.title.trim(),
      description: data.description?.trim() || null,
      activity_date: data.activity_date || new Date().toISOString(),
      created_by: null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("lead_activities") as any)
          .insert(newAct)
          .select()
          .single();
        if (error) return { success: false, error: error.message };
        return { success: true, activity: inserted as unknown as LeadActivity };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to record activity";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalActivities();
      local.unshift(newAct);
      this.saveLocalActivities(local);
      return { success: true, activity: newAct };
    }
  }

  // ==============================================================================
  // FOLLOW-UPS
  // ==============================================================================
  private static async getAllFollowUps(): Promise<LeadFollowUp[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("lead_followups")
          .select("*")
          .order("follow_up_date", { ascending: true });
        if (error || !data) return this.getLocalFollowUps();
        return data as unknown as LeadFollowUp[];
      } catch {
        return this.getLocalFollowUps();
      }
    }
    return this.getLocalFollowUps();
  }

  static async getLeadFollowUps(params?: {
    leadId?: string;
    status?: string;
  }): Promise<LeadFollowUpWithDetails[]> {
    const [rawFollowups, leads] = await Promise.all([
      this.getAllFollowUps(),
      this.getLeads(),
    ]);

    let filtered = rawFollowups;
    if (params?.leadId) {
      filtered = filtered.filter((f) => f.lead_id === params.leadId);
    }
    if (params?.status && params.status !== "All") {
      filtered = filtered.filter((f) => f.status === params.status);
    }

    const todayStr = new Date().toISOString().split("T")[0];

    return filtered.map((f) => {
      const lead = leads.find((l) => l.id === f.lead_id);
      const fDateStr = f.follow_up_date.split("T")[0];
      const isOverdue = f.status === "Pending" && fDateStr < todayStr;
      const isDueToday = f.status === "Pending" && fDateStr === todayStr;

      return {
        ...f,
        lead_code: lead?.lead_code || "LEAD",
        lead_name: lead?.full_name || "Unknown Lead",
        company_name: lead?.company_name || null,
        phone: lead?.phone || null,
        whatsapp_number: lead?.whatsapp_number || null,
        email: lead?.email || null,
        lead_status: lead?.lead_status || "New",
        lead_priority: lead?.priority || "Medium",
        is_overdue: isOverdue,
        is_due_today: isDueToday,
      };
    }).sort((a, b) => new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime());
  }

  static async createFollowUp(
    leadId: string,
    data: LeadFollowUpFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; followUp?: LeadFollowUp; error?: string }> {
    const newFup: LeadFollowUp = {
      id: "fup-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      lead_id: leadId,
      follow_up_date: data.follow_up_date,
      follow_up_type: data.follow_up_type || "Call",
      notes: data.notes?.trim() || null,
      status: "Pending",
      completed_at: null,
      created_by: null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("lead_followups") as any)
          .insert(newFup)
          .select()
          .single();
        if (error) return { success: false, error: error.message };

        // Update lead's next_follow_up_date
        await this.updateLead(leadId, { next_follow_up_date: data.follow_up_date.split("T")[0] }, actorName);

        await this.createLeadActivity(
          leadId,
          {
            activity_type: "Follow Up",
            title: `Scheduled Follow-up (${data.follow_up_type})`,
            description: data.notes || `Scheduled for ${new Date(data.follow_up_date).toLocaleDateString()}.`,
          },
          actorName
        );

        return { success: true, followUp: inserted as unknown as LeadFollowUp };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create follow-up";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalFollowUps();
      local.push(newFup);
      this.saveLocalFollowUps(local);

      await this.updateLead(leadId, { next_follow_up_date: data.follow_up_date.split("T")[0] }, actorName);

      await this.createLeadActivity(
        leadId,
        {
          activity_type: "Follow Up",
          title: `Scheduled Follow-up (${data.follow_up_type})`,
          description: data.notes || `Scheduled for ${new Date(data.follow_up_date).toLocaleDateString()}.`,
        },
        actorName
      );

      return { success: true, followUp: newFup };
    }
  }

  static async completeFollowUp(
    followUpId: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("lead_followups") as any)
          .update({
            status: "Completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", followUpId);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to complete follow-up";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalFollowUps();
      const idx = local.findIndex((f) => f.id === followUpId);
      if (idx !== -1) {
        local[idx].status = "Completed";
        local[idx].completed_at = new Date().toISOString();
        this.saveLocalFollowUps(local);
      }
    }

    await ClientService.logActivity(actorName, "completed lead follow-up", followUpId);
    return { success: true };
  }

  static async rescheduleFollowUp(
    followUpId: string,
    newDate: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("lead_followups") as any)
          .update({
            follow_up_date: newDate,
            status: "Pending",
          })
          .eq("id", followUpId);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to reschedule follow-up";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalFollowUps();
      const idx = local.findIndex((f) => f.id === followUpId);
      if (idx !== -1) {
        local[idx].follow_up_date = newDate;
        local[idx].status = "Pending";
        this.saveLocalFollowUps(local);
      }
    }

    await ClientService.logActivity(actorName, "rescheduled lead follow-up", newDate);
    return { success: true };
  }

  // ==============================================================================
  // LEAD CONVERSION WIZARD
  // ==============================================================================
  static async convertLead(
    leadId: string,
    clientData: ClientFormData,
    projectData?: ProjectFormData,
    actorName: string = "Ranjith"
  ): Promise<{
    success: boolean;
    clientId?: string;
    projectId?: string;
    error?: string;
  }> {
    const lead = await this.getLeadById(leadId);
    if (!lead) return { success: false, error: "Lead not found." };
    if (lead.converted_client_id) {
      return { success: false, error: "This lead has already been converted to a client." };
    }

    // 1. Create Client
    const clientRes = await ClientService.createClient(clientData, actorName);
    if (!clientRes.success || !clientRes.client) {
      return { success: false, error: clientRes.error || "Failed to create client record." };
    }
    const createdClient = clientRes.client;

    let createdProjectId: string | undefined = undefined;

    // 2. Create Project if provided
    if (projectData && projectData.project_name?.trim()) {
      const projPayload: ProjectFormData = {
        ...projectData,
        client_id: createdClient.id,
      };
      const projRes = await ProjectService.createProject(projPayload, actorName);
      if (!projRes.success) {
        // Rollback client creation on failure
        await ClientService.deleteClient(createdClient.id, actorName);
        return { success: false, error: `Project creation failed: ${projRes.error}` };
      }
      createdProjectId = projRes.project?.id;
    }

    // 3. Update Lead to Won & Converted
    const nowStr = new Date().toISOString();
    const updatePayload: Partial<Lead> = {
      lead_status: "Won",
      probability: 100,
      converted_client_id: createdClient.id,
      converted_project_id: createdProjectId || null,
      converted_at: nowStr,
      updated_at: nowStr,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("leads") as any).update(updatePayload).eq("id", leadId);
      } catch (err: unknown) {
        console.error("Failed to update lead status in Supabase:", err);
      }
    } else {
      const local = this.getLocalLeads();
      const idx = local.findIndex((l) => l.id === leadId);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...updatePayload };
        this.saveLocalLeads(local);
      }
    }

    // 4. Log activities
    await ClientService.logActivity(
      actorName,
      `converted lead ${lead.lead_code} to client`,
      createdClient.full_name,
      createdClient.id
    );

    await this.createLeadActivity(
      leadId,
      {
        activity_type: "Status Change",
        title: "Lead Converted to Customer (Won)",
        description: `Successfully converted to Client "${createdClient.full_name}"${
          createdProjectId ? ` with new Project "${projectData?.project_name}"` : ""
        }.`,
      },
      actorName
    );

    return {
      success: true,
      clientId: createdClient.id,
      projectId: createdProjectId,
    };
  }
}
