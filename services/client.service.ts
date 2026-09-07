import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Client,
  ClientFormData,
  ClientSortOption,
  ClientStats,
  ClientStatus,
  ClientWithDetails,
} from "@/types/client";
import { ActivityItem, ProjectSummary } from "@/types";

const LOCAL_CLIENTS_KEY = "uxi_clients_store";
const LOCAL_ACTIVITY_KEY = "uxi_activity_store";

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "c1-finpulse-uuid",
    full_name: "Vikramaditya Sharma",
    company_name: "FinPulse Technologies",
    email: "vikram@finpulse.io",
    phone: "+91 98450 11223",
    whatsapp_number: "+91 98450 11223",
    location: "Bengaluru, India",
    website: "https://finpulse.io",
    client_status: "Active",
    source: "Referral",
    notes: "Enterprise fintech platform client. Currently building next-gen banking & merchant web portal.",
    avatar_url: null,
    created_at: "2026-07-10T10:00:00Z",
    updated_at: "2026-08-28T14:30:00Z",
  },
  {
    id: "c2-aura-uuid",
    full_name: "Sophia Laurent",
    company_name: "Aura Brands Inc",
    email: "sophia@aurabrands.com",
    phone: "+1 (415) 890-3344",
    whatsapp_number: "+14158903344",
    location: "San Francisco, USA",
    website: "https://aurabrands.com",
    client_status: "Active",
    source: "Website",
    notes: "Luxury lifestyle and ecommerce brand. High fidelity UI/UX and headless storefront required.",
    avatar_url: null,
    created_at: "2026-07-22T08:15:00Z",
    updated_at: "2026-08-29T10:45:00Z",
  },
  {
    id: "c3-omnihealth-uuid",
    full_name: "Dr. Rajesh Menon",
    company_name: "OmniHealth Care",
    email: "dr.menon@omnihealth.in",
    phone: "+91 98840 99882",
    whatsapp_number: "+91 98840 99882",
    location: "Hyderabad, India",
    website: "https://omnihealthcare.in",
    client_status: "Active",
    source: "LinkedIn",
    notes: "Healthcare cloud systems, doctor consultation scheduling and patient records dashboard.",
    avatar_url: null,
    created_at: "2026-08-01T12:00:00Z",
    updated_at: "2026-08-29T12:15:00Z",
  },
  {
    id: "c4-nexus-uuid",
    full_name: "David Sterling",
    company_name: "Nexus Freight Ltd",
    email: "david.s@nexusfreight.co.uk",
    phone: "+44 20 7946 0912",
    whatsapp_number: "+442079460912",
    location: "London, UK",
    website: "https://nexusfreight.co.uk",
    client_status: "Lead",
    source: "Direct Contact",
    notes: "Global freight logistics and tracking portal CMS redesign. Proposal submitted, awaiting PO.",
    avatar_url: null,
    created_at: "2026-08-15T15:30:00Z",
    updated_at: "2026-08-28T18:20:00Z",
  },
  {
    id: "c5-krypton-uuid",
    full_name: "Elena Rostova",
    company_name: "Krypton Labs",
    email: "elena@kryptonlabs.io",
    phone: "+971 50 123 4567",
    whatsapp_number: "+971501234567",
    location: "Dubai, UAE",
    website: "https://kryptonlabs.io",
    client_status: "Completed",
    source: "Instagram",
    notes: "Web3 exchange dashboard design and responsive front-end completed on schedule.",
    avatar_url: null,
    created_at: "2026-06-20T09:00:00Z",
    updated_at: "2026-08-20T16:00:00Z",
  },
];

export class ClientService {
  private static getLocalClients(): Client[] {
    if (typeof window === "undefined") return INITIAL_CLIENTS;
    try {
      const stored = localStorage.getItem(LOCAL_CLIENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  }

  private static saveLocalClients(clients: Client[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
    } catch (err) {
      console.error("Failed to save local clients:", err);
    }
  }

  static async logActivity(
    actorName: string,
    action: string,
    targetName: string,
    clientId?: string
  ) {
    const newLog = {
      id: "act-" + Date.now(),
      actorName: actorName || "UXI Member",
      action,
      targetName,
      timestamp: new Date().toISOString(),
      category: "client" as const,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("activity_logs") as any).insert({
          actor_name: actorName || "UXI Member",
          action: `${action} ${targetName}`,
          entity_type: "Client",
          entity_id: clientId || null,
        });
      } catch (err) {
        console.error("Failed to log activity to Supabase:", err);
      }
    } else {
      if (typeof window !== "undefined") {
        try {
          const logsStr = localStorage.getItem(LOCAL_ACTIVITY_KEY);
          const logs: ActivityItem[] = logsStr ? JSON.parse(logsStr) : [];
          logs.unshift(newLog);
          localStorage.setItem(LOCAL_ACTIVITY_KEY, JSON.stringify(logs.slice(0, 30)));
        } catch {
          // ignore
        }
      }
    }
  }

  static async getClients(params?: {
    search?: string;
    status?: ClientStatus | "All";
    sortBy?: ClientSortOption;
  }): Promise<ClientWithDetails[]> {
    let clients: Client[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("clients").select("*");

        if (params?.status && params.status !== "All") {
          query = query.eq("client_status", params.status);
        }

        if (params?.sortBy === "oldest") {
          query = query.order("created_at", { ascending: true });
        } else if (params?.sortBy === "name_asc") {
          query = query.order("full_name", { ascending: true });
        } else if (params?.sortBy === "name_desc") {
          query = query.order("full_name", { ascending: false });
        } else if (params?.sortBy === "company_asc") {
          query = query.order("company_name", { ascending: true });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error || !data) {
          console.warn("Supabase fetch clients error, fallback to local:", error);
          clients = this.getLocalClients();
        } else {
          clients = data as unknown as Client[];
        }
      } catch (err) {
        console.warn("Supabase client fetch failed:", err);
        clients = this.getLocalClients();
      }
    } else {
      clients = this.getLocalClients();

      // Local Filter
      if (params?.status && params.status !== "All") {
        clients = clients.filter((c) => c.client_status === params.status);
      }

      // Local Sort
      if (params?.sortBy === "oldest") {
        clients.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (params?.sortBy === "name_asc") {
        clients.sort((a, b) => a.full_name.localeCompare(b.full_name));
      } else if (params?.sortBy === "name_desc") {
        clients.sort((a, b) => b.full_name.localeCompare(a.full_name));
      } else if (params?.sortBy === "company_asc") {
        clients.sort((a, b) => (a.company_name || "").localeCompare(b.company_name || ""));
      } else {
        clients.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    }

    // Local search filter (handles client name, company name, email, phone, location)
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      clients = clients.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.company_name && c.company_name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q))
      );
    }

    // Read projects from local storage or defaults to calculate live client statistics
    let allLiveProjects: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const storedProjs = localStorage.getItem("uxi_projects_store");
        if (storedProjs) {
          allLiveProjects = JSON.parse(storedProjs);
        }
      } catch {
        allLiveProjects = [];
      }
    }

    // Map into ClientWithDetails
    return clients.map((c) => {
      const clientProjs = allLiveProjects.filter((p: any) => p.client_id === c.id);

      let projectsCount = clientProjs.length;
      let activeProjectsCount = clientProjs.filter((p: any) => !["Completed", "Delivered", "Cancelled"].includes(p.project_status)).length;
      let totalValue = clientProjs.reduce((sum: number, p: any) => sum + Number(p.final_budget || p.estimated_budget || 0), 0);
      let totalPaid = clientProjs.reduce((sum: number, p: any) => sum + Number(p.total_paid_amount || p.advance_amount || 0), 0);
      let pendingAmount = clientProjs.reduce((sum: number, p: any) => sum + Number(p.pending_amount || 0), 0);

      // Fallback initial seeds if store was uninitialized
      if (projectsCount === 0) {
        if (c.company_name?.includes("FinPulse")) {
          projectsCount = 1; activeProjectsCount = 1; totalValue = 450000; totalPaid = 225000; pendingAmount = 225000;
        } else if (c.company_name?.includes("Aura")) {
          projectsCount = 1; activeProjectsCount = 1; totalValue = 320000; totalPaid = 200000; pendingAmount = 120000;
        } else if (c.company_name?.includes("Omni")) {
          projectsCount = 1; activeProjectsCount = 1; totalValue = 680000; totalPaid = 340000; pendingAmount = 340000;
        } else if (c.company_name?.includes("Nexus")) {
          projectsCount = 1; activeProjectsCount = 1; totalValue = 520000; totalPaid = 0; pendingAmount = 520000;
        } else if (c.company_name?.includes("Krypton")) {
          projectsCount = 1; activeProjectsCount = 0; totalValue = 380000; totalPaid = 380000; pendingAmount = 0;
        }
      }

      return {
        ...c,
        projects_count: projectsCount,
        active_projects_count: activeProjectsCount,
        total_project_value: totalValue,
        total_paid: totalPaid,
        pending_amount: pendingAmount,
      };
    });
  }

  static async getClientById(id: string): Promise<ClientWithDetails | null> {
    const clients = await this.getClients();
    return clients.find((c) => c.id === id) || null;
  }

  static async getStats(): Promise<ClientStats> {
    const allClients = await this.getClients();

    return {
      totalClients: allClients.length,
      activeClients: allClients.filter((c) => c.client_status === "Active").length,
      leads: allClients.filter((c) => c.client_status === "Lead").length,
      inactiveClients: allClients.filter((c) => c.client_status === "Inactive").length,
      completedClients: allClients.filter((c) => c.client_status === "Completed").length,
    };
  }

  static async createClient(
    data: ClientFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; client?: Client; error?: string }> {
    const newClient: Client = {
      id: "client-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      full_name: data.full_name.trim(),
      company_name: data.company_name?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      whatsapp_number: data.whatsapp_number?.trim() || data.phone?.trim() || null,
      location: data.location?.trim() || null,
      website: data.website?.trim() || null,
      client_status: data.client_status || "Active",
      source: data.source || "Direct Contact",
      notes: data.notes?.trim() || null,
      avatar_url: data.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("clients") as any)
          .insert({
            full_name: newClient.full_name,
            company_name: newClient.company_name,
            email: newClient.email,
            phone: newClient.phone,
            whatsapp_number: newClient.whatsapp_number,
            location: newClient.location,
            website: newClient.website,
            client_status: newClient.client_status,
            source: newClient.source,
            notes: newClient.notes,
            avatar_url: newClient.avatar_url,
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const client = inserted as unknown as Client;
        await this.logActivity(actorName, "added new client", client.company_name || client.full_name, client.id);
        return { success: true, client };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create client";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalClients();
      local.unshift(newClient);
      this.saveLocalClients(local);
      await this.logActivity(actorName, "added new client", newClient.company_name || newClient.full_name, newClient.id);
      return { success: true, client: newClient };
    }
  }

  static async updateClient(
    id: string,
    data: Partial<ClientFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; client?: Client; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: updated, error } = await (supabase.from("clients") as any)
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const client = updated as unknown as Client;
        await this.logActivity(actorName, "updated client details for", client.company_name || client.full_name, client.id);
        return { success: true, client };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update client";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalClients();
      const idx = local.findIndex((c) => c.id === id);
      if (idx === -1) {
        return { success: false, error: "Client not found." };
      }

      const updatedClient: Client = {
        ...local[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };

      local[idx] = updatedClient;
      this.saveLocalClients(local);
      await this.logActivity(actorName, "updated client details for", updatedClient.company_name || updatedClient.full_name, updatedClient.id);
      return { success: true, client: updatedClient };
    }
  }

  static async deleteClient(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase.from("clients") as any).select("full_name, company_name").eq("id", id).single();
        const clientName = existing?.company_name || existing?.full_name || "Client";

        const { error } = await supabase.from("clients").delete().eq("id", id);
        if (error) {
          return { success: false, error: error.message };
        }

        await this.logActivity(actorName, "deleted client record", clientName, id);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete client";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalClients();
      const existing = local.find((c) => c.id === id);
      const clientName = existing?.company_name || existing?.full_name || "Client";

      const filtered = local.filter((c) => c.id !== id);
      this.saveLocalClients(filtered);
      await this.logActivity(actorName, "deleted client record", clientName, id);
      return { success: true };
    }
  }

  static async getClientProjects(clientId: string): Promise<ProjectSummary[]> {
    if (typeof window !== "undefined") {
      try {
        const storedProjs = localStorage.getItem("uxi_projects_store");
        if (storedProjs) {
          const projs = JSON.parse(storedProjs);
          const matched = projs.filter((p: any) => p.client_id === clientId);
          if (matched.length > 0) {
            return matched.map((p: any) => ({
              id: p.id,
              name: p.project_name,
              code: p.project_code,
              clientName: "This Client",
              status: p.project_status,
              deadline: p.estimated_deadline || "2026-10-01",
              progressPercent: p.project_status === "Completed" ? 100 : p.project_status === "Client Review" ? 85 : 55,
              budget: Number(p.final_budget || p.estimated_budget || 0),
              leadName: "UXI Lead",
            }));
          }
        }
      } catch {
        // fallback
      }
    }

    if (clientId === "c1-finpulse-uuid") {
      return [
        {
          id: "proj-1",
          name: "FinPulse Banking Portal",
          code: "UXI-2026-001",
          clientName: "FinPulse Technologies",
          status: "Development" as any,
          deadline: "2026-09-15",
          progressPercent: 55,
          budget: 450000,
          leadName: "Praneeth",
        },
      ];
    } else if (clientId === "c2-aura-uuid") {
      return [
        {
          id: "proj-2",
          name: "Aura Luxury Ecommerce",
          code: "UXI-2026-002",
          clientName: "Aura Brands Inc",
          status: "Client Review" as any,
          deadline: "2026-09-05",
          progressPercent: 80,
          budget: 320000,
          leadName: "Vedesh",
        },
      ];
    } else if (clientId === "c3-omnihealth-uuid") {
      return [
        {
          id: "proj-3",
          name: "OmniHealth Patient Cloud",
          code: "UXI-2026-003",
          clientName: "OmniHealth Care",
          status: "Designing" as any,
          deadline: "2026-09-28",
          progressPercent: 35,
          budget: 680000,
          leadName: "Hafi",
        },
      ];
    }

    return [];
  }
}
