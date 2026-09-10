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

export const INITIAL_CLIENTS: Client[] = [];


export class ClientService {
  private static getLocalClients(): Client[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_CLIENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
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
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          return { success: false, error: "Authentication required to create client." };
        }

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
            created_by: authData.user.id,
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
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_archived", false);

        if (!error && data) {
          return data.map((p: any) => ({
            id: p.id,
            name: p.project_name,
            code: p.project_code,
            clientName: p.client_company || p.client_name || "Client",
            status: p.project_status,
            deadline: p.estimated_deadline || "",
            progressPercent: p.progress_percent || 0,
            budget: Number(p.final_budget || p.estimated_budget || 0),
            leadName: "Lead",
          }));
        }
      } catch {
        // fallback
      }
    }

    return [];
  }
}
