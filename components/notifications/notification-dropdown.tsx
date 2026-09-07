"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCheck,
  Bell,
  ArrowRight,
  FolderKanban,
  CheckSquare,
  Users2,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { NotificationWithDetails, NotificationType } from "@/types/notification";
import { formatRelativeTime } from "@/lib/utils";

interface NotificationDropdownProps {
  notifications: NotificationWithDetails[];
  unreadCount: number;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();

  const handleItemClick = async (notif: NotificationWithDetails) => {
    if (!notif.is_read) {
      await onMarkAsRead(notif.id);
    }
    onClose();
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  return (
    <div className="w-[360px] sm:w-[390px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">Notifications</h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </span>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => onMarkAllAsRead()}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List / Preview */}
      <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const Icon = getNotificationIcon(notif.notification_type);

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 relative ${
                  !notif.is_read ? "bg-blue-50/40" : ""
                }`}
              >
                {!notif.is_read && (
                  <span className="absolute left-1.5 top-4.5 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />
                )}

                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getNotificationIconStyles(notif.notification_type)}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate text-[11px]">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                  </div>

                  {notif.message && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Bell className="w-6 h-6 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-700">No new notifications</p>
            <p className="text-[11px] text-slate-500">You're all caught up with recent team activity.</p>
          </div>
        )}
      </div>

      {/* Footer link to full notification center */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors hover:underline"
        >
          <span>View All Notifications</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "Task Assigned":
    case "Task Updated":
    case "Task Deadline":
      return CheckSquare;
    case "Project Assigned":
    case "Project Updated":
    case "Project Deadline":
      return FolderKanban;
    case "New Lead":
    case "Lead Assigned":
    case "Lead Follow Up":
    case "Lead Converted":
      return TrendingUp;
    case "Invoice Created":
    case "Invoice Overdue":
      return Receipt;
    case "Payment Received":
      return DollarSign;
    case "Team Workload":
      return Users2;
    case "System Alert":
      return AlertTriangle;
    default:
      return Bell;
  }
}

export function getNotificationIconStyles(type: NotificationType) {
  switch (type) {
    case "Payment Received":
    case "Lead Converted":
      return "bg-emerald-50 text-emerald-600 border-emerald-200/80";
    case "Invoice Overdue":
    case "Expense Overdue":
    case "System Alert":
    case "Team Workload":
      return "bg-rose-50 text-rose-600 border-rose-200/80";
    case "Task Deadline":
    case "Project Deadline":
    case "Lead Follow Up":
      return "bg-amber-50 text-amber-600 border-amber-200/80";
    case "Task Assigned":
    case "Project Assigned":
    case "New Lead":
    default:
      return "bg-blue-50 text-blue-600 border-blue-200/80";
  }
}
