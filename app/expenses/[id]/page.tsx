"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  Edit2,
  Trash2,
  CheckCircle2,
  Repeat,
  Calendar,
  Building,
  FolderKanban,
  FileText,
  Clock,
  CreditCard,
  User,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { ExpenseCategoryBadge } from "@/components/expenses/expense-category-badge";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseDeleteModal } from "@/components/expenses/expense-delete-modal";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseWithDetails } from "@/types/expense";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [expense, setExpense] = useState<ExpenseWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadExpense = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await ExpenseService.getExpenseById(id);
      if (!fetched) {
        toastError("Expense not found", "The requested expense record does not exist.");
        router.push("/expenses");
        return;
      }
      setExpense(fetched);
    } catch (err) {
      console.error("Failed to load expense:", err);
      toastError("Error loading expense");
    } finally {
      setLoading(false);
    }
  }, [id, router, toastError]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const handleMarkPaid = async () => {
    if (!expense) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.markExpensePaid(expense.id, actorName);
    if (res.success) {
      success("Expense marked as Paid", `${expense.expense_number} status updated.`);
      loadExpense();
    } else {
      toastError("Failed to mark as paid", res.error);
    }
  };

  const handleGenerateNext = async () => {
    if (!expense) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.generateRecurringExpense(expense.id, actorName);
    if (res.success) {
      success("Next cycle expense created", `${res.newExpense?.expense_number} logged.`);
      router.push(`/expenses/${res.newExpense?.id}`);
    } else {
      toastError("Failed to generate cycle", res.error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.deleteExpense(expenseId, actorName);
    if (res.success) {
      success("Expense deleted", "Record removed.");
      router.push("/expenses");
    } else {
      toastError("Failed to delete expense", res.error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-1/4" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl col-span-2" />
        </div>
      </div>
    );
  }

  if (!expense) return null;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/expenses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#2451EB]" />
          <span>Back to Expenses Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && expense.payment_status !== "Paid" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkPaid}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Paid</span>
            </Button>
          )}

          {canManage && expense.is_recurring && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateNext}
              className="gap-1.5 text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 border-purple-200"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Bill Next Cycle</span>
            </Button>
          )}

          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#5B6472]" />
              <span>Edit</span>
            </Button>
          )}

          {canManage && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#E6EAF2] bg-white p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-semibold font-mono text-[#0F172A] tracking-tight font-tabular">
                {expense.expense_number}
              </span>
              <ExpenseStatusBadge status={expense.payment_status} />
              <ExpenseCategoryBadge categoryName={expense.category_name} />
              {expense.is_recurring && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1 font-tabular">
                  <Repeat className="w-3 h-3" />
                  <span>{expense.recurring_frequency} Subscription</span>
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-xl font-bold text-[#0F172A]">
              {expense.expense_title}
            </h1>

            <p className="text-xs text-[#5B6472]">
              Vendor: <span className="font-semibold text-[#0F172A]">{expense.vendor_name || "Direct Expense"}</span>
              {expense.project_name && (
                <>
                  <span className="mx-2 text-slate-300">•</span>
                  Project: <span className="text-[#2451EB] font-semibold">{expense.project_name}</span>
                </>
              )}
              {expense.client_company && !expense.project_name && (
                <>
                  <span className="mx-2 text-slate-300">•</span>
                  Client: <span className="text-[#0F172A] font-semibold">{expense.client_company}</span>
                </>
              )}
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="text-[10px] text-[#8A93A3] uppercase font-bold block">Disbursement Amount</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-mono font-tabular">
              {formatCurrency(expense.amount, "INR")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary Cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Payment & Vendor Profile */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase font-display tracking-wider pb-3 border-b border-slate-100">
              Payment & Settlement Profile
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Expense Date</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{formatDate(expense.expense_date)}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Channel</span>
                <p className="font-semibold text-slate-700 mt-0.5">{expense.payment_method}</p>
              </div>

              {expense.transaction_reference && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Transaction UTR / Ref</span>
                  <p className="font-mono text-slate-900 font-bold mt-0.5">{expense.transaction_reference}</p>
                </div>
              )}

              {expense.due_date && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Due Date</span>
                  <p className={expense.is_overdue ? "text-rose-600 font-bold mt-0.5" : "text-slate-700 mt-0.5"}>
                    {formatDate(expense.due_date)} {expense.is_overdue && "(Overdue)"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Allocation Details */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase font-display tracking-wider pb-3 border-b border-slate-100">
              Cost Allocation
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Project Allocation</span>
                {expense.project_name ? (
                  <Link
                    href={`/projects/${expense.project_id}`}
                    className="font-bold text-blue-600 hover:underline block mt-0.5"
                  >
                    {expense.project_name} {expense.project_code && `(${expense.project_code})`}
                  </Link>
                ) : (
                  <p className="text-slate-400 mt-0.5">General Overhead (Unallocated)</p>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Client Account</span>
                {expense.client_company ? (
                  <Link
                    href={`/clients/${expense.client_id}`}
                    className="font-bold text-slate-700 hover:underline block mt-0.5"
                  >
                    {expense.client_company}
                  </Link>
                ) : (
                  <p className="text-slate-400 mt-0.5">General Company Account</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Notes & Scope */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
              Description & Accounting Notes
            </h3>

            {expense.description ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700">
                {expense.description}
              </div>
            ) : (
              <p className="text-slate-400 italic">No description provided for this expense.</p>
            )}

            {expense.notes && (
              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-slate-700 font-display">Internal Processing Notes:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {expense.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExpenseForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={async (formData) => {
          const actorName = user?.fullName || "Ranjith";
          const res = await ExpenseService.updateExpense(id, formData, actorName);
          if (res.success) {
            success("Expense updated", "Changes saved.");
            setIsEditOpen(false);
            loadExpense();
          } else {
            toastError("Failed to update expense", res.error);
          }
        }}
        initialData={expense}
        mode="edit"
      />

      <ExpenseDeleteModal
        expense={isDeleteOpen ? expense : null}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
