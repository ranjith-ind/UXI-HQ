"use client";

import { useEffect } from "react";

/**
 * Automatically purges obsolete demo localStorage caches from previous development runs
 * while preserving legitimate UI state (theme, sidebar).
 */
export function ClientCacheCleaner() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const obsoleteKeys = [
      "uxi_projects_store",
      "uxi_tasks_store",
      "uxi_clients_store",
      "uxi_invoices_store",
      "uxi_expenses_store",
      "uxi_leads_store",
      "uxi_sprints_store",
      "uxi_demo_initialized",
    ];
    obsoleteKeys.forEach((key) => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      } catch {
        // Ignore localStorage access errors
      }
    });
  }, []);

  return null;
}
