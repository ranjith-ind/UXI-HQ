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
      "uxi_team_members_store",
      "uxi_member_skills_store",
      "uxi_global_skills_store",
      "uxi_subtasks_store",
      "uxi_task_assignees_store",
      "uxi_project_members_store",
      "uxi_payments_store",
      "uxi_invoice_items_store",
      "uxi_expense_categories_store",
      "uxi_lead_activities_store",
      "uxi_lead_followups_store",
      "uxi_activity_logs_store",
      "uxi_activity_store",
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
