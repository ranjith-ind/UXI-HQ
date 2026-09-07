"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppLayout } from "./app-layout";
import { AuthProvider } from "@/hooks/use-auth";
import { ToastProvider } from "@/components/ui/toast";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth");

  return (
    <AuthProvider>
      <ToastProvider>
        {isAuthPage ? (
          <main className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
            {children}
          </main>
        ) : (
          <AppLayout>{children}</AppLayout>
        )}
      </ToastProvider>
    </AuthProvider>
  );
}
