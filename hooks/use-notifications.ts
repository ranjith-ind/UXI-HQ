import { useState, useEffect, useCallback } from "react";
import { NotificationService } from "@/services/notification.service";
import { NotificationWithDetails } from "@/types/notification";
import { useRealtimeTable } from "./use-realtime";
import { useAuth } from "./use-auth";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await NotificationService.getNotifications({
        recipientId: user?.id,
        limit: 20,
      });
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription for incoming notifications
  useRealtimeTable({
    table: "notifications",
    onInsert: (newNotif) => {
      if (!user || newNotif.recipient_id === user.id) {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((c) => c + 1);
      }
    },
    onUpdate: (updatedNotif) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotif.id ? { ...n, ...updatedNotif } : n))
      );
      setUnreadCount((prev) => {
        const remaining = notifications.map((n) =>
          n.id === updatedNotif.id ? { ...n, ...updatedNotif } : n
        );
        return remaining.filter((n) => !n.is_read).length;
      });
    },
    onDelete: (deletedNotif) => {
      setNotifications((prev) => prev.filter((n) => n.id !== deletedNotif.id));
    },
  });

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await NotificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await NotificationService.markAllAsRead(user?.id);
  };

  const deleteNotification = async (id: string) => {
    // Optimistic UI update
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.is_read) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    await NotificationService.deleteNotification(id);
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
