"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  Trash2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { NotificationWithDetails } from "@/types/notification";
import { formatRelativeTime } from "@/lib/utils";
import { getNotificationIcon, getNotificationIconStyles } from "./notification-dropdown";

interface NotificationItemProps {
  notification: NotificationWithDetails;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.notification_type);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs ${
        !notification.is_read
          ? "border-blue-200 bg-blue-50/30 shadow-xs"
          : "border-slate-200/90 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 shadow-2xs ${getNotificationIconStyles(notification.notification_type)}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-xs font-display">
              {notification.title}
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
              {notification.notification_type}
            </span>
            {notification.priority === "Urgent" && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                Urgent
              </span>
            )}
            {notification.priority === "High" && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                High Priority
              </span>
            )}
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(notification.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {notification.action_url && (
          <Link
            href={notification.action_url}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {!notification.is_read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors"
          title="Delete notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
