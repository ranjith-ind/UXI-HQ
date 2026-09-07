"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseDeleteModal } from "@/components/expenses/expense-delete-modal";
import { ExpenseService } from "@/services/expense.service";
import { ClientService } from "@/services/client.service";
import { ProjectService } from "@/services/project.service";
import {
  ExpenseCategory,
  ExpenseDateFilter,
  ExpensePaymentStatus,
  ExpenseSortOption,
  ExpenseWithDetails,
} from "@/types/expense";
import { ClientWithDetails } from "@/types/client";
import { ProjectWithDetails } from "@/types/project";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function ExpensesDirectoryPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ExpensePaymentStatus | "All">("All");
  const [category, setCategory] = useState<string | "All">("All");
  const [dateFilter, setDateFilter] = useState<ExpenseDateFilter>("all");
  const [isRecurring, setIsRecurring] = useState<boolean | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<ExpenseSortOption>("recently_created");

  // Data States
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [categoriesList, setCategoriesList] = useState<ExpenseCategory[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectWithDetails[]>([]);
  const [clientsList, setClientsList] = useState<ClientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<ExpenseWithDetails | null>(null);
  const [selectedExpenseForDelete, setSelectedExpenseForDelete] = useState<ExpenseWithDetails | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedExpenses, cats, projs, cls] = await Promise.all([
        ExpenseService.getExpenses({
          search,
          status,
          category,
          dateFilter,
          isRecurring,
          projectId: selectedProjectId,
          clientId: selectedClientId,
          sortBy,
        }),
        ExpenseService.getCategories(),
        ProjectService.getProjects({ isArchived: false }),
        ClientService.getClients(),
      ]);

      setExpenses(fetchedExpenses);
      setCategoriesList(cats);
      setProjectsList(projs);
      setClientsList(cls);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      toastError("Error loading expenses");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    status,
    category,
    dateFilter,
    isRecurring,
    selectedProjectId,
    selectedClientId,
    sortBy,
    toastError,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("All");
    setCategory("All");
    setDateFilter("all");
    setIsRecurring(undefined);
    setSelectedProjectId(undefined);
    setSelectedClientId(undefined);
    setSortBy("recently_created");
  };

  const handleMarkPaid = async (exp: ExpenseWithDetails) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.markExpensePaid(exp.id, actorName);
    if (res.success) {
      success("Expense marked as Paid", `${exp.expense_number} status updated.`);
      loadData();
    } else {
      toastError("Failed to update status", res.error);
    }
  };

  const handleGenerateNext = async (exp: ExpenseWithDetails) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.generateRecurringExpense(exp.id, actorName);
    if (res.success) {
      success("Next cycle created", `${res.newExpense?.expense_number} logged.`);
      loadData();
    } else {
      toastError("Failed to generate subscription", res.error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ExpenseService.deleteExpense(expenseId, actorName);
    if (res.success) {
      success("Expense deleted", "Record removed from ledger.");
      loadData();
    } else {
      toastError("Failed to delete expense", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <Link
            href="/expenses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Back to Expenses Dashboard</span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Company Expenses Directory
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Complete searchable ledger of company operating costs, project burn, subscriptions, and receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

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

      {/* Advanced Filter Component */}
      <ExpenseFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        categoriesList={categoriesList}
        projectsList={projectsList}
        clientsList={clientsList}
        onReset={handleResetFilters}
      />

      {/* Full Expense Table */}
      <ExpenseTable
        expenses={expenses}
        onEdit={(exp) => {
          setSelectedExpenseForEdit(exp);
          setIsFormOpen(true);
        }}
        onDelete={(exp) => setSelectedExpenseForDelete(exp)}
        onMarkPaid={handleMarkPaid}
        onGenerateNext={handleGenerateNext}
      />

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
              success("Expense updated", "Changes saved.");
              loadData();
            } else {
              toastError("Failed to update", res.error);
            }
          } else {
            const res = await ExpenseService.createExpense(formData, actorName);
            if (res.success) {
              success("Expense created", `${res.expense?.expense_number} registered.`);
              loadData();
            } else {
              toastError("Failed to create", res.error);
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
