"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckSquare,
  FolderKanban,
  Sparkles,
  Receipt,
  Users2,
  AlertTriangle,
} from "lucide-react";
import { NotificationService } from "@/services/notification.service";
import { NotificationPreferences } from "@/types/notification";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export function NotificationPreferencesCard() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const data = await NotificationService.getNotificationPreferences(user?.id || "default");
        setPrefs(data);
      } catch (err) {
        console.error("Failed to load preferences:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPrefs();
  }, [user?.id]);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    const updatedVal = !prefs[key];
    const newPrefs = { ...prefs, [key]: updatedVal };
    setPrefs(newPrefs);

    const res = await NotificationService.updateNotificationPreferences(
      user?.id || "default",
      { [key]: updatedVal }
    );

    if (res.success) {
      success("Preferences updated", "Notification rules saved successfully.");
    } else {
      toastError("Failed to update preferences");
    }
  };

  if (loading || !prefs) {
    return (
      <div className="p-8 text-center text-slate-400 font-sans text-xs animate-pulse">
        Loading communication preferences...
      </div>
    );
  }

  const preferenceItems = [
    {
      key: "task_assignments" as keyof NotificationPreferences,
      label: "Task Assignments & Status",
      desc: "Notify when you are assigned a task, mentioned, or task status changes",
      icon: CheckSquare,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      key: "task_deadlines" as keyof NotificationPreferences,
      label: "Task Deadlines & Due Dates",
      desc: "Alerts when tasks approach or exceed their scheduled due dates",
      icon: CheckSquare,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-100",
    },
    {
      key: "project_updates" as keyof NotificationPreferences,
      label: "Project Milestones & Deliverables",
      desc: "Notifications for project phase completions and project health status changes",
      icon: FolderKanban,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
    },
    {
      key: "lead_alerts" as keyof NotificationPreferences,
      label: "Sales Leads & CRM Follow-ups",
      desc: "Instant notifications for inbound leads and scheduled prospect follow-ups",
      icon: Sparkles,
      color: "text-cyan-600",
      bg: "bg-cyan-50 border-cyan-100",
    },
    {
      key: "invoice_alerts" as keyof NotificationPreferences,
      label: "Invoices, Payments & Receivables",
      desc: "Alerts for overdue invoices, realized payments, and client billing events",
      icon: Receipt,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      key: "team_workload_alerts" as keyof NotificationPreferences,
      label: "Team Workload & Capacity Alerts",
      desc: "Warnings when developers exceed 100% capacity or face burnout risk",
      icon: Users2,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100",
    },
    {
      key: "system_alerts" as keyof NotificationPreferences,
      label: "Operational Business Alerts",
      desc: "Critical business triggers from the executive smart monitoring engine",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6 font-sans">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            Notification Rules & Channels
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Customize which business triggers send in-app and audio notifications
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {preferenceItems.map((item) => {
          const Icon = item.icon;
          const isChecked = Boolean(prefs[item.key]);

          return (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${item.bg} ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs font-display">{item.label}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                onClick={() => handleToggle(item.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isChecked ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isChecked ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
