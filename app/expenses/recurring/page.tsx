"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Repeat,
  Plus,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecurringExpenseCard } from "@/components/expenses/recurring-expense-card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseDeleteModal } from "@/components/expenses/expense-delete-modal";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseWithDetails } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function RecurringExpensesPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [recurringExpenses, setRecurringExpenses] = useState<ExpenseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<ExpenseWithDetails | null>(null);
  const [selectedExpenseForDelete, setSelectedExpenseForDelete] = useState<ExpenseWithDetails | null>(null);

  const loadRecurring = useCallback(async () => {
    setLoading(true);
    try {
      const all = await ExpenseService.getExpenses({ isRecurring: true });
      setRecurringExpenses(all);
    } catch (err) {
      console.error("Failed to load recurring subscriptions:", err);
      toastError("Error loading recurring expenses");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadRecurring();
  }, [loadRecurring]);

  const totalMonthlyRecurring = recurringExpenses.reduce((sum, e) => {
    let monthlyEquiv = Number(e.amount);
    if (e.recurring_frequency === "Weekly") monthlyEquiv = Number(e.amount) * 4;
    else if (e.recurring_frequency === "Quarterly") monthlyEquiv = Number(e.amount) / 3;
    else if (e.recurring_frequency === "Yearly") monthlyEquiv = Number(e.amount) / 12;
    return sum + monthlyEquiv;
  }, 0);

  const handleGenerateNext = async (exp: ExpenseWithDetails) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.generateRecurringExpense(exp.id, actorName);
    if (res.success) {
      success("Recurring Expense Generated", `New record ${res.newExpense?.expense_number} created.`);
      loadRecurring();
    } else {
      toastError("Failed to generate recurring expense", res.error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.deleteExpense(expenseId, actorName);
    if (res.success) {
      success("Subscription deleted", "Removed from active recurring billing.");
      loadRecurring();
    } else {
      toastError("Failed to delete subscription", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <Link
            href="/expenses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Back to Expenses Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Recurring Subscriptions & Licenses
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 font-tabular">
              {recurringExpenses.length} Active
            </span>
          </div>
          <p className="text-xs text-[#5B6472] max-w-xl">
            SaaS tools, cloud infrastructure, domains, and retainer expenditures renewing automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canManage && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSelectedExpenseForEdit(null);
                setIsFormOpen(true);
              }}
              className="gap-2 shadow-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subscription</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Monthly Recurring Burn"
          value={formatCurrency(totalMonthlyRecurring, "INR")}
          subtitle="Estimated run-rate outflow / mo"
          icon={Repeat}
          variant="violet"
        />

        <StatsCard
          title="Active Licenses"
          value={recurringExpenses.length.toString()}
          subtitle="Company subscriptions tracked"
          icon={Calendar}
          variant="blue"
        />

        <StatsCard
          title="Annual Run-Rate"
          value={formatCurrency(totalMonthlyRecurring * 12, "INR")}
          subtitle="Projected 12-month commitments"
          icon={Calendar}
          variant="emerald"
        />
      </div>

      {/* 3. Cards Grid */}
      {recurringExpenses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <Repeat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900 font-display">No active subscriptions</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Log recurring SaaS tools or cloud subscriptions to predict your burn rate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringExpenses.map((exp) => (
            <RecurringExpenseCard
              key={exp.id}
              expense={exp}
              onGenerateNext={handleGenerateNext}
              onEdit={(e) => {
                setSelectedExpenseForEdit(e);
                setIsFormOpen(true);
              }}
              onDelete={(e) => setSelectedExpenseForDelete(e)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedExpenseForEdit(null);
        }}
        onSubmit={async (formData) => {
          const actorName = user?.fullName || "Ranjith";
          if (selectedExpenseForEdit) {
            const res = await ExpenseService.updateExpense(selectedExpenseForEdit.id, formData, actorName);
            if (res.success) {
              success("Subscription updated", "Saved changes.");
              loadRecurring();
            } else {
              toastError("Failed to update subscription", res.error);
            }
          } else {
            const res = await ExpenseService.createExpense({ ...formData, is_recurring: true }, actorName);
            if (res.success) {
              success("Subscription created", `${res.expense?.expense_number} logged.`);
              loadRecurring();
            } else {
              toastError("Failed to create subscription", res.error);
            }
          }
        }}
        initialData={selectedExpenseForEdit}
        mode={selectedExpenseForEdit ? "edit" : "add"}
      />

      <ExpenseDeleteModal
        expense={selectedExpenseForDelete}
        isOpen={!!selectedExpenseForDelete}
        onClose={() => setSelectedExpenseForDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
