import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Notification,
  NotificationFormData,
  NotificationPreferences,
  NotificationPriority,
  NotificationStats,
  NotificationType,
  NotificationWithDetails,
} from "@/types/notification";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  id: "pref-default",
  profile_id: "default",
  task_assigned: true,
  task_status_changes: true,
  task_deadlines: true,
  project_assignments: true,
  project_deadlines: true,
  lead_assignments: true,
  lead_followups: true,
  lead_updates: true,
  invoice_updates: true,
  invoice_overdue: true,
  payment_received: true,
  expense_alerts: true,
  team_workload_alerts: true,
  system_alerts: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Initial Mock Notifications
let mockNotifications: NotificationWithDetails[] = [
  {
    id: "notif-1",
    recipient_id: "usr-ranjith",
    actor_id: "usr-hafi",
    actor_name: "Hafi",
    actor_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    title: "New High-Priority Lead Assigned",
    message: "Apex Capital Ventures (₹8.5L) was assigned to you for consultation.",
    notification_type: "Lead Assigned",
    entity_type: "lead",
    entity_id: "lead-2",
    action_url: "/leads/lead-2",
    is_read: false,
    priority: "High",
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
  },
  {
    id: "notif-2",
    recipient_id: "usr-ranjith",
    actor_id: "usr-vedesh",
    actor_name: "Vedesh",
    actor_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    title: "Payment Received: ₹2,50,000",
    message: "Clienter Tech Labs settled invoice INV-2026-003 via HDFC Bank Wire.",
    notification_type: "Payment Received",
    entity_type: "payment",
    entity_id: "pay-1",
    action_url: "/finance/payments",
    is_read: false,
    priority: "Normal",
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
  },
  {
    id: "notif-3",
    recipient_id: "usr-ranjith",
    actor_id: null,
    actor_name: "System Bot",
    title: "Project Deadline Approaching",
    message: "Clienter Platform (Sprint 3) delivery is due in 3 days.",
    notification_type: "Project Deadline",
    entity_type: "project",
    entity_id: "proj-1",
    action_url: "/projects/proj-1",
    is_read: false,
    priority: "High",
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: "notif-4",
    recipient_id: "usr-ranjith",
    actor_id: "usr-praneeth",
    actor_name: "Praneeth",
    actor_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    title: "Task Assigned: Auth Middleware Refactor",
    message: "Assigned you to review the Supabase SSR session token verification.",
    notification_type: "Task Assigned",
    entity_type: "task",
    entity_id: "task-1",
    action_url: "/tasks",
    is_read: true,
    read_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    priority: "Normal",
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: "notif-5",
    recipient_id: "usr-ranjith",
    actor_id: null,
    actor_name: "System Bot",
    title: "Invoice Overdue Alert",
    message: "Invoice INV-2026-004 for ZenMart Global is overdue by 5 days.",
    notification_type: "Invoice Overdue",
    entity_type: "invoice",
    entity_id: "inv-4",
    action_url: "/finance/invoices",
    is_read: true,
    read_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    priority: "Urgent",
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // Yesterday
  },
  {
    id: "notif-6",
    recipient_id: "usr-ranjith",
    actor_id: null,
    actor_name: "System Bot",
    title: "Team Workload Alert: High Capacity",
    message: "Praneeth is currently operating at 105% allocation capacity.",
    notification_type: "Team Workload",
    entity_type: "team_member",
    entity_id: "team-4",
    action_url: "/team",
    is_read: true,
    read_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    priority: "High",
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
  },
];

let mockPreferencesStore: Record<string, NotificationPreferences> = {};

export class NotificationService {
  /**
   * Fetch notifications with flexible filtering and sorting
   */
  static async getNotifications(params?: {
    recipientId?: string;
    isRead?: boolean;
    priority?: NotificationPriority | "All";
    type?: NotificationType | "All";
    search?: string;
    filter?: "all" | "unread" | "read" | "urgent" | "today";
    sortBy?: "newest" | "oldest" | "priority";
    limit?: number;
  }): Promise<NotificationWithDetails[]> {
    let result = [...mockNotifications];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("notifications").select("*, actor:profiles!actor_id(full_name, avatar_url)");

        if (params?.recipientId) {
          query = query.eq("recipient_id", params.recipientId);
        }
        if (params?.isRead !== undefined) {
          query = query.eq("is_read", params.isRead);
        }
        if (params?.priority && params.priority !== "All") {
          query = query.eq("priority", params.priority);
        }
        if (params?.type && params.type !== "All") {
          query = query.eq("notification_type", params.type);
        }

        query = query.order("created_at", { ascending: false });

        if (params?.limit) {
          query = query.limit(params.limit);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          result = data.map((item: any) => ({
            id: item.id,
            recipient_id: item.recipient_id,
            actor_id: item.actor_id,
            actor_name: item.actor?.full_name || null,
            actor_avatar: item.actor?.avatar_url || null,
            title: item.title,
            message: item.message,
            notification_type: item.notification_type,
            entity_type: item.entity_type,
            entity_id: item.entity_id,
            action_url: item.action_url,
            is_read: item.is_read,
            read_at: item.read_at,
            priority: item.priority,
            metadata: item.metadata,
            created_at: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase notification query failed, using fallback:", err);
      }
    }

    // Apply client filters if using mock or memory
    if (params?.recipientId) {
      result = result.filter(
        (n) => n.recipient_id === params.recipientId || n.recipient_id === "usr-ranjith" || !n.recipient_id
      );
    }

    if (params?.isRead !== undefined) {
      result = result.filter((n) => n.is_read === params.isRead);
    }

    if (params?.filter) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      if (params.filter === "unread") {
        result = result.filter((n) => !n.is_read);
      } else if (params.filter === "read") {
        result = result.filter((n) => n.is_read);
      } else if (params.filter === "urgent") {
        result = result.filter((n) => n.priority === "Urgent" || n.priority === "High");
      } else if (params.filter === "today") {
        result = result.filter((n) => new Date(n.created_at) >= todayStart);
      }
    }

    if (params?.priority && params.priority !== "All") {
      result = result.filter((n) => n.priority === params.priority);
    }

    if (params?.type && params.type !== "All") {
      result = result.filter((n) => n.notification_type === params.type);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.message && n.message.toLowerCase().includes(q)) ||
          n.notification_type.toLowerCase().includes(q) ||
          (n.actor_name && n.actor_name.toLowerCase().includes(q))
      );
    }

    // Sorting
    const priorityWeights: Record<NotificationPriority, number> = {
      Urgent: 4,
      High: 3,
      Normal: 2,
      Low: 1,
    };

    if (params?.sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (params?.sortBy === "priority") {
      result.sort(
        (a, b) =>
          priorityWeights[b.priority] - priorityWeights[a.priority] ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      // Default: newest first
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(recipientId?: string): Promise<number> {
    const notifs = await this.getNotifications({ recipientId, isRead: false });
    return notifs.length;
  }

  /**
   * Get KPI statistics for notifications
   */
  static async getNotificationStats(recipientId?: string): Promise<NotificationStats> {
    const all = await this.getNotifications({ recipientId });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const unread = all.filter((n) => !n.is_read).length;
    const highPriority = all.filter((n) => !n.is_read && (n.priority === "High" || n.priority === "Urgent")).length;
    const todayCount = all.filter((n) => new Date(n.created_at) >= todayStart).length;

    return {
      total: all.length,
      unread,
      highPriority,
      todayCount,
    };
  }

  /**
   * Get single notification by ID
   */
  static async getNotificationById(id: string): Promise<NotificationWithDetails | null> {
    const all = await this.getNotifications();
    return all.find((n) => n.id === id) || null;
  }

  /**
   * Create a new notification (checks recipient preferences first)
   */
  static async createNotification(
    data: NotificationFormData
  ): Promise<{ success: boolean; notification?: Notification; error?: string }> {
    try {
      // Check preferences
      const prefs = await this.getNotificationPreferences(data.recipient_id);
      const isAllowed = this.checkPreferenceAllowed(data.notification_type, prefs);

      if (!isAllowed) {
        return { success: true, error: "Skipped due to user notification preferences." };
      }

      const newId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newNotif: NotificationWithDetails = {
        id: newId,
        recipient_id: data.recipient_id,
        actor_id: data.actor_id || null,
        actor_name: data.actor_id ? "Team Member" : "System",
        title: data.title,
        message: data.message || null,
        notification_type: data.notification_type,
        entity_type: data.entity_type || null,
        entity_id: data.entity_id || null,
        action_url: data.action_url || null,
        is_read: false,
        priority: data.priority || "Normal",
        metadata: data.metadata || {},
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data: inserted, error } = await (supabase
            .from("notifications") as any)
            .insert({
              recipient_id: data.recipient_id,
              actor_id: data.actor_id || null,
              title: data.title,
              message: data.message || null,
              notification_type: data.notification_type,
              entity_type: data.entity_type || null,
              entity_id: data.entity_id || null,
              action_url: data.action_url || null,
              priority: data.priority || "Normal",
              metadata: data.metadata || {},
            })
            .select()
            .single();

          if (!error && inserted) {
            newNotif.id = inserted.id;
          }
        } catch (dbErr) {
          console.warn("Supabase insert notification error:", dbErr);
        }
      }

      mockNotifications = [newNotif, ...mockNotifications];
      return { success: true, notification: newNotif };
    } catch (err: any) {
      console.error("Failed to create notification:", err);
      return { success: false, error: err.message || "Failed to create notification" };
    }
  }

  /**
   * Helper to dispatch notifications to multiple recipients
   */
  static async createNotificationForMultipleUsers(
    recipientIds: string[],
    data: Omit<NotificationFormData, "recipient_id">
  ): Promise<{ success: boolean; count: number }> {
    let sentCount = 0;
    for (const recipientId of recipientIds) {
      const res = await this.createNotification({ ...data, recipient_id: recipientId });
      if (res.success) sentCount++;
    }
    return { success: true, count: sentCount };
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      mockNotifications = mockNotifications.map((n) =>
        n.id === id ? { ...n, is_read: true, read_at: now } : n
      );

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await (supabase.from("notifications") as any).update({ is_read: true, read_at: now }).eq("id", id);
        } catch (dbErr) {
          console.warn("Supabase update notification read error:", dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to mark as read" };
    }
  }

  /**
   * Mark all notifications as read for a recipient
   */
  static async markAllAsRead(recipientId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      mockNotifications = mockNotifications.map((n) =>
        !recipientId || n.recipient_id === recipientId || n.recipient_id === "usr-ranjith"
          ? { ...n, is_read: true, read_at: now }
          : n
      );

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          let query = (supabase.from("notifications") as any).update({ is_read: true, read_at: now }).eq("is_read", false);
          if (recipientId) {
            query = query.eq("recipient_id", recipientId);
          }
          await query;
        } catch (dbErr) {
          console.warn("Supabase markAllAsRead error:", dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to mark all as read" };
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      mockNotifications = mockNotifications.filter((n) => n.id !== id);

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await supabase.from("notifications").delete().eq("id", id);
        } catch (dbErr) {
          console.warn("Supabase delete notification error:", dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete notification" };
    }
  }

  /**
   * Clear all read notifications
   */
  static async clearReadNotifications(recipientId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      mockNotifications = mockNotifications.filter(
        (n) => !(n.is_read && (!recipientId || n.recipient_id === recipientId || n.recipient_id === "usr-ranjith"))
      );

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          let query = supabase.from("notifications").delete().eq("is_read", true);
          if (recipientId) {
            query = query.eq("recipient_id", recipientId);
          }
          await query;
        } catch (dbErr) {
          console.warn("Supabase clear read notifications error:", dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to clear read notifications" };
    }
  }

  /**
   * Get notification preferences for a user
   */
  static async getNotificationPreferences(profileId: string = "default"): Promise<NotificationPreferences> {
    if (mockPreferencesStore[profileId]) {
      return mockPreferencesStore[profileId];
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("profile_id", profileId)
          .maybeSingle();

        if (!error && data) {
          mockPreferencesStore[profileId] = data;
          return data;
        }
      } catch (dbErr) {
        console.warn("Supabase preferences fetch error:", dbErr);
      }
    }

    const initial = { ...DEFAULT_PREFERENCES, profile_id: profileId };
    mockPreferencesStore[profileId] = initial;
    return initial;
  }

  /**
   * Update notification preferences for a user
   */
  static async updateNotificationPreferences(
    profileId: string = "default",
    updates: Partial<NotificationPreferences>
  ): Promise<{ success: boolean; preferences?: NotificationPreferences; error?: string }> {
    try {
      const current = await this.getNotificationPreferences(profileId);
      const merged: NotificationPreferences = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      mockPreferencesStore[profileId] = merged;

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await (supabase.from("notification_preferences") as any).upsert({
            profile_id: profileId,
            ...updates,
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn("Supabase preferences upsert error:", dbErr);
        }
      }

      return { success: true, preferences: merged };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update preferences" };
    }
  }

  /**
   * Helper to check if a notification type is allowed by preferences
   */
  private static checkPreferenceAllowed(type: NotificationType, prefs: NotificationPreferences): boolean {
    switch (type) {
      case "Task Assigned":
        return prefs.task_assigned;
      case "Task Updated":
        return prefs.task_status_changes;
      case "Task Deadline":
        return prefs.task_deadlines;
      case "Project Assigned":
        return prefs.project_assignments;
      case "Project Updated":
      case "Project Deadline":
        return prefs.project_deadlines;
      case "New Lead":
      case "Lead Assigned":
        return prefs.lead_assignments;
      case "Lead Follow Up":
        return prefs.lead_followups;
      case "Lead Converted":
        return prefs.lead_updates;
      case "Invoice Created":
      case "Invoice Overdue":
        return prefs.invoice_overdue;
      case "Payment Received":
        return prefs.payment_received;
      case "Expense Due":
      case "Expense Overdue":
        return prefs.expense_alerts;
      case "Team Workload":
        return prefs.team_workload_alerts;
      case "System Alert":
      case "General":
      default:
        return prefs.system_alerts;
    }
  }
}
