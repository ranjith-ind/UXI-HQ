"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationPreferencesCard } from "@/components/notifications/notification-preferences";
import {
  Settings,
  Shield,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [hasSupabase] = useState(() => isSupabaseConfigured());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Settings className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Workspace Controls</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Workspace Settings
            </h1>
            <Badge variant="default" className="text-[10px] font-semibold bg-[#EFF4FE] text-[#2451EB] border border-[#2451EB]/20">
              Admin Control
            </Badge>
          </div>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Company profile, security, team roles, and communication rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Profile & Company Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">User Profile</h3>
                <p className="text-xs text-slate-500 font-medium">Your account credentials and role in the workspace</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <Avatar
                name={user?.fullName || "User"}
                size="lg"
                className="w-14 h-14"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 font-display">
                    {user?.fullName || "Not Logged In"}
                  </span>
                  <Badge variant="default" className="text-[10px] font-bold">
                    {user?.role || "Member"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                <p className="text-[11px] text-slate-400 font-mono">ID: {user?.id || "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Display Name</label>
                <input
                  type="text"
                  defaultValue={user?.fullName || ""}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-xs text-slate-500 shadow-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Company Profile Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Organization Details</h3>
                <p className="text-xs text-slate-500 font-medium">Business entity details used across client invoices and proposals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Company Name</label>
                <input
                  type="text"
                  defaultValue="UXI Technologies Private Limited"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Brand Tagline</label>
                <input
                  type="text"
                  defaultValue="Operating System for Elite Creative Agility"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Base Operating Currency</label>
                <select
                  defaultValue="INR"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Tax / GST Number</label>
                <input
                  type="text"
                  defaultValue="36AAACU9876Q1Z8"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {saved ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Preferences saved successfully</span>
                </span>
              ) : (
                <div />
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="gap-2 shadow-sm font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Organization Changes</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right 1 col: Database & System Status */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Infrastructure</h3>
                <p className="text-[11px] text-slate-500">Live backend telemetry</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-700 font-display">Supabase DB</span>
                </div>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {hasSupabase ? "Connected" : "Local Mock"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-700 font-display">App Architecture</span>
                </div>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Next.js App Router
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-slate-700 font-display">Auth Protocol</span>
                </div>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  RLS Enforced
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
