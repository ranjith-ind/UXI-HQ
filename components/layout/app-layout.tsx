"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { UxiLogo } from "@/components/brand/uxi-logo";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <UxiLogo size="lg" withGlow />
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>INITIALIZING UXI HQ OS...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Desktop Collapsible Sidebar */}
      <div className="hidden md:flex shrink-0 h-full border-r border-slate-200/90 bg-white">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex h-full bg-white shadow-2xl">
            <Sidebar mobile onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#F8FAFC]">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
