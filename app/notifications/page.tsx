"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationPreferencesCard } from "@/components/notifications/notification-preferences";
import { NotificationService } from "@/services/notification.service";
import {
  NotificationFilterOption,
  NotificationPriority,
  NotificationSortOption,
  NotificationStats,
  NotificationType,
  NotificationWithDetails,
} from "@/types/notification";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<NotificationFilterOption>("all");
  const [priority, setPriority] = useState<NotificationPriority | "All">("All");
  const [notificationType, setNotificationType] = useState<NotificationType | "All">("All");
  const [sortBy, setSortBy] = useState<NotificationSortOption>("newest");
  const [showPreferences, setShowPreferences] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedNotifs, fetchedStats] = await Promise.all([
        NotificationService.getNotifications({
          recipientId: user?.id,
          filter: activeFilter,
          priority,
          type: notificationType,
          search,
          sortBy,
        }),
        NotificationService.getNotificationStats(user?.id),
      ]);
      setNotifications(fetchedNotifs);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toastError("Error loading notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeFilter, priority, notificationType, search, sortBy, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAsRead = async (id: string) => {
    const res = await NotificationService.markAsRead(id);
    if (res.success) {
      loadData();
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await NotificationService.markAllAsRead(user?.id);
    if (res.success) {
      success("All Notifications Read", "Marked all active notifications as read.");
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await NotificationService.deleteNotification(id);
    if (res.success) {
      loadData();
    }
  };

  const handleClearRead = async () => {
    const res = await NotificationService.clearReadNotifications(user?.id);
    if (res.success) {
      success("Cleared Read Notifications", "Removed archived notifications from view.");
      loadData();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Communication & Alerts Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Real-time triggers, task delegations, client payments, and deadline warnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPreferences((prev) => !prev)}
            className="gap-2 font-semibold text-xs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>{showPreferences ? "View Feed" : "Rules & Channels"}</span>
          </Button>

          {!showPreferences && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={!stats || stats.unread === 0}
                className="gap-1.5 font-semibold text-xs text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearRead}
                className="gap-1.5 font-semibold text-xs text-slate-500 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Read</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Preferences View or Feed View */}
      {showPreferences ? (
        <NotificationPreferencesCard />
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          <NotificationFilters
            search={search}
            onSearchChange={setSearch}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            priority={priority}
            onPriorityChange={setPriority}
            notificationType={notificationType}
            onTypeChange={setNotificationType}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            unreadCount={stats?.unread || 0}
          />

          {/* List */}
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onResetFilters={() => {
              setSearch("");
              setActiveFilter("all");
              setPriority("All");
              setNotificationType("All");
            }}
          />
        </div>
      )}
    </div>
  );
}
