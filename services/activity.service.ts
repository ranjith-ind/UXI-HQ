import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ActivityFilter,
  ActivityLog,
  ActivityModule,
  ActivityStats,
} from "@/types/activity";

// In-memory activities store
let mockActivities: ActivityLog[] = [];

export class ActivityService {
  /**
   * Fetch centralized activities with multi-faceted filtering
   */
  static async getActivities(filter?: ActivityFilter): Promise<ActivityLog[]> {
    let result: ActivityLog[] = [...mockActivities];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("activity_logs").select("*").order("created_at", { ascending: false });

        if (filter?.entityType && filter.entityType !== "All") {
          query = query.eq("entity_type", filter.entityType);
        }

        const { data, error } = await query;
        if (!error && data) {
          result = data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            actor_name: item.actor_name,
            actor_avatar: item.metadata?.actor_avatar || null,
            action: item.action,
            entity_type: item.entity_type,
            entity_id: item.entity_id,
            description: item.description || item.metadata?.description || `${item.actor_name} ${item.action} ${item.entity_type}`,
            module: this.mapEntityToModule(item.entity_type),
            metadata: item.metadata,
            created_at: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase activity logs fetch warning:", err);
      }
    }

    // Apply memory filters
    if (filter?.module && filter.module !== "All") {
      result = result.filter((a) => a.module === filter.module);
    }

    if (filter?.entityType && filter.entityType !== "All") {
      result = result.filter((a) => a.entity_type === filter.entityType);
    }

    if (filter?.user && filter.user !== "All") {
      result = result.filter((a) => a.actor_name.toLowerCase() === filter.user?.toLowerCase());
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.description?.toLowerCase().includes(q) ||
          a.actor_name.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.entity_type.toLowerCase().includes(q)
      );
    }

    if (filter?.dateRange && filter.dateRange !== "all") {
      const now = new Date();
      if (filter.dateRange === "today") {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        result = result.filter((a) => new Date(a.created_at).getTime() >= todayStart);
      } else if (filter.dateRange === "this_week") {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
        result = result.filter((a) => new Date(a.created_at).getTime() >= weekStart);
      } else if (filter.dateRange === "this_month") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        result = result.filter((a) => new Date(a.created_at).getTime() >= monthStart);
      }
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get top N recent activities
   */
  static async getRecentActivities(limit: number = 5): Promise<ActivityLog[]> {
    const all = await this.getActivities();
    return all.slice(0, limit);
  }

  /**
   * Get activities related to a specific entity
   */
  static async getActivitiesByEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
    const all = await this.getActivities();
    return all.filter((a) => a.entity_type === entityType && a.entity_id === entityId);
  }

  /**
   * Get activities performed by a specific user
   */
  static async getActivitiesByUser(actorName: string): Promise<ActivityLog[]> {
    const all = await this.getActivities();
    return all.filter((a) => a.actor_name.toLowerCase() === actorName.toLowerCase());
  }

  /**
   * Calculate activity statistics
   */
  static async getActivityStats(): Promise<ActivityStats> {
    const all = await this.getActivities();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const todayCount = all.filter((a) => new Date(a.created_at).getTime() >= todayStart).length;
    const thisWeekCount = all.filter((a) => new Date(a.created_at).getTime() >= weekStart).length;
    const thisMonthCount = all.filter((a) => new Date(a.created_at).getTime() >= monthStart).length;

    // Calculate most active member
    const actorCounts: Record<string, { count: number; avatar?: string | null }> = {};
    all.forEach((a) => {
      if (!actorCounts[a.actor_name]) {
        actorCounts[a.actor_name] = { count: 0, avatar: a.actor_avatar };
      }
      actorCounts[a.actor_name].count += 1;
    });

    let topMember: { name: string; count: number; avatar?: string | null } | null = null;
    Object.entries(actorCounts).forEach(([name, info]) => {
      if (!topMember || info.count > topMember.count) {
        topMember = { name, count: info.count, avatar: info.avatar };
      }
    });

    return {
      todayCount,
      thisWeekCount,
      thisMonthCount,
      mostActiveMember: topMember,
    };
  }

  /**
   * Helper to map an entity type string to a high-level UI module name
   */
  private static mapEntityToModule(entityType: string): ActivityModule {
    switch (entityType?.toLowerCase()) {
      case "client":
        return "Clients";
      case "project":
        return "Projects";
      case "task":
      case "sprint":
        return "Tasks";
      case "team_member":
      case "team":
        return "Team";
      case "invoice":
      case "payment":
        return "Finance";
      case "expense":
      case "expense_category":
        return "Expenses";
      case "lead":
      case "lead_activity":
      case "lead_followup":
        return "Sales CRM";
      default:
        return "System";
    }
  }
}
