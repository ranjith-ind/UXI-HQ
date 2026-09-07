"use client";

import React from "react";
import { NotificationWithDetails } from "@/types/notification";
import { NotificationItem } from "./notification-item";
import { NotificationEmptyState } from "./notification-empty-state";

interface NotificationListProps {
  notifications: NotificationWithDetails[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onResetFilters?: () => void;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  onResetFilters,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return <NotificationEmptyState onResetFilters={onResetFilters} />;
  }

  // Time grouping
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 3600 * 1000;
  const weekStart = todayStart - 6 * 24 * 3600 * 1000;

  const todayList: NotificationWithDetails[] = [];
  const yesterdayList: NotificationWithDetails[] = [];
  const thisWeekList: NotificationWithDetails[] = [];
  const earlierList: NotificationWithDetails[] = [];

  notifications.forEach((notif) => {
    const time = new Date(notif.created_at).getTime();
    if (time >= todayStart) {
      todayList.push(notif);
    } else if (time >= yesterdayStart) {
      yesterdayList.push(notif);
    } else if (time >= weekStart) {
      thisWeekList.push(notif);
    } else {
      earlierList.push(notif);
    }
  });

  const renderSection = (title: string, list: NotificationWithDetails[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-3 font-sans">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-400 font-display uppercase tracking-wider">
            {title} ({list.length})
          </span>
        </div>
        <div className="space-y-2.5">
          {list.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSection("Today", todayList)}
      {renderSection("Yesterday", yesterdayList)}
      {renderSection("Earlier This Week", thisWeekList)}
      {renderSection("Older Notifications", earlierList)}
    </div>
  );
}
