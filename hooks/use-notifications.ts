"use client";

import { useEffect, useState, useCallback } from "react";
import { NotificationWithDetails } from "@/types/notification";
import { NotificationService } from "@/services/notification.service";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeTable } from "@/hooks/use-realtime";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await NotificationService.getNotifications({ recipientId: user.id });
      setNotifications(data);
      const count = await NotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtimeTable<NotificationWithDetails>({
    table: "notifications",
    onInsert: (newNotif: NotificationWithDetails) => {
      if (!user || newNotif.recipient_id === user.id) {
        setNotifications((prev) => [newNotif, ...prev]);
        if (!newNotif.is_read) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    },
    onUpdate: (updatedNotif: NotificationWithDetails) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotif.id ? { ...n, ...updatedNotif } : n))
      );
      if (updatedNotif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    onDelete: (deletedNotif) => {
      if (deletedNotif.id) {
        setNotifications((prev) => prev.filter((n) => n.id !== deletedNotif.id));
      }
    },
  });

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await NotificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
