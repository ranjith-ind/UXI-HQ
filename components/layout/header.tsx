"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Command,
} from "lucide-react";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Executive Dashboard", subtitle: "Company performance & operations" },
  "/projects": { title: "Client Projects", subtitle: "Active developments & milestones" },
  "/clients": { title: "Client Directory", subtitle: "Accounts & business relationships" },
  "/tasks": { title: "Task Management", subtitle: "Internal sprints & deliverables" },
  "/team": { title: "Team & Founders", subtitle: "Organization hierarchy & roles" },
  "/finance": { title: "Finance & Invoices", subtitle: "Client billing & incoming funds" },
  "/finance/invoices": { title: "Invoices", subtitle: "Client billing, receivables & status" },
  "/finance/payments": { title: "Payments", subtitle: "Cash collections & transaction records" },
  "/finance/profitability": { title: "Profitability Intelligence", subtitle: "Client & project margin analysis" },
  "/expenses": { title: "Operating Expenses", subtitle: "Infrastructure, payroll & software costs" },
  "/leads": { title: "Sales CRM Pipeline", subtitle: "Deal pipeline, conversions & follow-ups" },
  "/leads/follow-ups": { title: "Sales Follow-ups", subtitle: "Scheduled reminders & client touchpoints" },
  "/leads/analytics": { title: "Sales Intelligence", subtitle: "Conversion rates & pipeline velocity" },
  "/reports": { title: "Executive Reports", subtitle: "Company intelligence & telemetry" },
  "/activity": { title: "Activity Center", subtitle: "Real-time audit log across modules" },
  "/alerts": { title: "Business Alerts", subtitle: "Real-time operational risk diagnostics" },
  "/notifications": { title: "Notifications Center", subtitle: "Dispatch hub & user preferences" },
  "/settings": { title: "Workspace Settings", subtitle: "Security, configuration & members" },
};

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const [hasSupabase] = useState(() => isSupabaseConfigured());

  const currentRoute = routeTitles[pathname] || {
    title: "UXI HQ Operating System",
    subtitle: "Unified Xperience Intelligence",
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#E6EAF2] bg-white px-4 sm:px-6 transition-colors">
      {/* Left section: Mobile Hamburger + Dynamic Title */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex md:hidden p-1.5 rounded-lg text-[#5B6472] hover:text-slate-900 hover:bg-[#F7F9FC] border border-[#E6EAF2]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm sm:text-base font-semibold text-[#0F172A] tracking-tight flex items-center gap-2">
            {currentRoute.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-[#5B6472] font-normal">
            {currentRoute.subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right Section: Search + Notifications + Status + User */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Search Placeholder */}
        <div className="hidden lg:flex items-center relative w-64 xl:w-72">
          <Search className="absolute left-3 w-4 h-4 text-[#8A93A3] pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, clients, tasks..."
            readOnly
            className="w-full h-9 rounded-lg border border-[#E6EAF2] bg-[#F7F9FC] pl-9 pr-12 text-xs text-slate-800 placeholder:text-[#8A93A3] focus:outline-none focus:border-[#2451EB] cursor-pointer hover:bg-white transition-colors"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-[#E6EAF2] text-[10px] font-mono text-[#5B6472]">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div
          title={
            hasSupabase
              ? "Connected to Live Supabase Database"
              : "Running in Demo Mode with Mock Database"
          }
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#E6EAF2] bg-[#F7F9FC]"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              hasSupabase ? "bg-emerald-500" : "bg-[#2451EB]"
            }`}
          />
          <span className="text-[#5B6472] font-mono text-[10px]">
            {hasSupabase ? "Supabase Live" : "UXI Demo"}
          </span>
        </div>

        {/* Notifications Real-Time Bell */}
        <NotificationBell />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
