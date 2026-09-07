"use client";

import React from "react";
import Link from "next/link";
import {
  Repeat,
  Calendar,
  CreditCard,
  Building,
  FolderKanban,
  Play,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseWithDetails } from "@/types/expense";
import { ExpenseCategoryBadge } from "./expense-category-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface RecurringExpenseCardProps {
  expense: ExpenseWithDetails;
  onGenerateNext: (expense: ExpenseWithDetails) => void;
  onEdit: (expense: ExpenseWithDetails) => void;
  onDelete: (expense: ExpenseWithDetails) => void;
}

export function RecurringExpenseCard({
  expense,
  onGenerateNext,
  onEdit,
  onDelete,
}: RecurringExpenseCardProps) {
  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all space-y-4 font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1 font-bold">
              <Repeat className="w-3 h-3" />
              <span>{expense.recurring_frequency} Subscription</span>
            </span>
            <span className="font-mono text-xs text-slate-400 font-bold">{expense.expense_number}</span>
          </div>

          <Link
            href={`/expenses/${expense.id}`}
            className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate font-display"
          >
            {expense.expense_title}
          </Link>
        </div>

        <span className="text-base font-extrabold text-slate-900 font-mono shrink-0">
          {formatCurrency(expense.amount, "INR")}
        </span>
      </div>

      {/* Meta details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <ExpenseCategoryBadge categoryName={expense.category_name} size="sm" />
          <span className="text-slate-500 font-medium">{expense.vendor_name || "Direct Provider"}</span>
        </div>

        {/* Project or Client Tag */}
        {expense.project_name && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <FolderKanban className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <Link
              href={`/projects/${expense.project_id}`}
              className="text-blue-600 font-semibold hover:underline truncate"
            >
              {expense.project_name}
            </Link>
          </div>
        )}

        {expense.client_company && !expense.project_name && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              href={`/clients/${expense.client_id}`}
              className="text-slate-700 font-semibold hover:underline truncate"
            >
              {expense.client_company}
            </Link>
          </div>
        )}

        {/* Next renewal date */}
        <div className="flex items-center gap-1.5 text-slate-500 pt-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Next Billing Date: <strong>{formatDate(expense.next_recurring_date || expense.expense_date)}</strong></span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {canManage && (
            <>
              <button
                onClick={() => onEdit(expense)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Edit subscription"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDelete(expense)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete subscription"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {canManage && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onGenerateNext(expense)}
            className="gap-1.5 text-xs font-bold"
          >
            <Play className="w-3 h-3 text-emerald-600" />
            <span>Bill Next Cycle</span>
          </Button>
        )}
      </div>
    </div>
  );
}
