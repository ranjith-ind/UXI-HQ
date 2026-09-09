"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Repeat,
  Layers,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseStats as ExpenseStatsComponent } from "@/components/expenses/expense-stats";
import { ExpenseTrendChart } from "@/components/expenses/expense-trend-chart";
import { ExpenseCategoryChart } from "@/components/expenses/expense-category-chart";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseDeleteModal } from "@/components/expenses/expense-delete-modal";
import { ExpenseService } from "@/services/expense.service";
import {
  ExpenseCategoryStats,
  ExpenseStats as ExpenseStatsType,
  ExpenseWithDetails,
} from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function ExpensesPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [stats, setStats] = useState<ExpenseStatsType | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseWithDetails[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<ExpenseWithDetails[]>([]);
  const [categoryStats, setCategoryStats] = useState<ExpenseCategoryStats[]>([]);
  const [trendData, setTrendData] = useState<{ month: string; amount: number }[]>([]);
  const [timeframe, setTimeframe] = useState<"6M" | "12M" | "YEAR">("6M");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<ExpenseWithDetails | null>(null);
  const [selectedExpenseForDelete, setSelectedExpenseForDelete] = useState<ExpenseWithDetails | null>(null);

  const loadExpenseData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedStats, allExpenses, catStats] = await Promise.all([
        ExpenseService.getExpenseStats(),
        ExpenseService.getExpenses({ sortBy: "recently_created" }),
        ExpenseService.getCategoryStats(),
      ]);

      setStats(fetchedStats);
      setRecentExpenses(allExpenses.slice(0, 6));
      setPendingExpenses(allExpenses.filter((e) => e.payment_status === "Pending" || e.is_overdue));
      setCategoryStats(catStats);

      // Construct monthly trend
      const now = new Date();
      const monthsCount = timeframe === "6M" ? 6 : timeframe === "12M" ? 12 : now.getMonth() + 1;
      const tData: { month: string; amount: number }[] = [];

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.toISOString().substring(0, 7);
        const monthLabel = d.toLocaleString("default", { month: "short" });

        const monthSpend = allExpenses
          .filter((e) => e.payment_status === "Paid" && e.expense_date.startsWith(monthStr))
          .reduce((sum, e) => sum + Number(e.amount), 0);

        tData.push({ month: monthLabel, amount: monthSpend });
      }

      setTrendData(tData);
    } catch (err) {
      console.error("Failed to load expense dashboard:", err);
      toastError("Error loading expense data");
    } finally {
      setLoading(false);
    }
  }, [timeframe, toastError]);

  useEffect(() => {
    loadExpenseData();
  }, [loadExpenseData]);

  // Realtime subscription for expenses and categories
  useRealtimeTables({
    tables: ["expenses", "expense_categories"],
    onChange: loadExpenseData,
  });

  const handleMarkPaid = async (exp: ExpenseWithDetails) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.markExpensePaid(exp.id, actorName);
    if (res.success) {
      success("Expense marked as Paid", `${exp.expense_number} marked settled.`);
      loadExpenseData();
    } else {
      toastError("Failed to update expense", res.error);
    }
  };

  const handleGenerateNext = async (exp: ExpenseWithDetails) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.generateRecurringExpense(exp.id, actorName);
    if (res.success) {
      success("Next subscription cycle logged", `${res.newExpense?.expense_number} created.`);
      loadExpenseData();
    } else {
      toastError("Failed to generate cycle", res.error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.deleteExpense(expenseId, actorName);
    if (res.success) {
      success("Expense deleted successfully", "Accounting ledger updated.");
      loadExpenseData();
    } else {
      toastError("Failed to delete expense", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Company Outflows & Profit Guard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Expense & Cost Management
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Track company expenditure, vendor bills, software subscriptions, project-allocated costs, and direct burn rate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadExpenseData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/expenses/all">
            <Button variant="secondary" size="sm" className="gap-1.5 font-semibold">
              <Receipt className="w-4 h-4 text-slate-600" />
              <span>All Expenses</span>
            </Button>
          </Link>

          <Link href="/expenses/recurring">
            <Button variant="secondary" size="sm" className="gap-1.5 font-semibold">
              <Repeat className="w-4 h-4 text-purple-600" />
              <span>Subscriptions</span>
            </Button>
          </Link>

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
              <span>Log Expense</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics Cards */}
      {stats && <ExpenseStatsComponent stats={stats} />}

      {/* 3. Mid Grid: Trend Chart & Categorical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseTrendChart
            data={trendData}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        <div className="lg:col-span-1">
          <ExpenseCategoryChart categories={categoryStats} limit={5} />
        </div>
      </div>

      {/* 4. Live Pending Payables & Recent Logged Outflows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 font-display">Recent Expenditure Transactions</h3>
            <p className="text-xs text-slate-500">Latest company disbursements and approved payments</p>
          </div>

          <Link
            href="/expenses/all"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ExpenseTable
          expenses={recentExpenses}
          onEdit={(exp) => {
            setSelectedExpenseForEdit(exp);
            setIsFormOpen(true);
          }}
          onDelete={(exp) => setSelectedExpenseForDelete(exp)}
          onMarkPaid={handleMarkPaid}
          onGenerateNext={handleGenerateNext}
        />
      </div>

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
              success("Expense updated", "Changes saved successfully.");
              loadExpenseData();
            } else {
              toastError("Failed to update expense", res.error);
            }
          } else {
            const res = await ExpenseService.createExpense(formData, actorName);
            if (res.success) {
              success("Expense recorded", `${res.expense?.expense_number} logged.`);
              loadExpenseData();
            } else {
              toastError("Failed to record expense", res.error);
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
