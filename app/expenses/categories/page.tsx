"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  ArrowLeft,
  Edit2,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseCategoryBadge } from "@/components/expenses/expense-category-badge";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseCategoryStats, DEFAULT_EXPENSE_CATEGORIES } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function ExpenseCategoriesPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [categories, setCategories] = useState<ExpenseCategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryStats | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await ExpenseService.getCategoryStats();
      setCategories(stats);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toastError("Error loading categories");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: ExpenseCategoryStats) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toastError("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const res = await ExpenseService.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
        });
        if (res.success) {
          success("Category updated", "Changes saved.");
          setIsModalOpen(false);
          loadCategories();
        } else {
          toastError("Failed to update category", res.error);
        }
      } else {
        const res = await ExpenseService.createCategory(
          categoryName.trim(),
          categoryDescription.trim() || undefined
        );
        if (res.success) {
          success("Category created", "New expense category added.");
          setIsModalOpen(false);
          loadCategories();
        } else {
          toastError("Failed to create category", res.error);
        }
      }
    } finally {
      setSaving(false);
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

          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Expense Categories & Classification
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF4FE] text-[#2451EB] border border-[#2451EB]/20 font-tabular">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Organize operational and project expenditures into reporting categories and tax classifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canManage && (
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenAdd}
              className="gap-2 shadow-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <ExpenseCategoryBadge categoryName={cat.name} />
                {DEFAULT_EXPENSE_CATEGORIES.includes(cat.name) ? (
                  <span className="p-1 text-slate-400" title="System Standard Category">
                    <Lock className="w-3 h-3" />
                  </span>
                ) : (
                  canManage && (
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{cat.expenseCount} Records</span>
              <span className="font-bold text-slate-900 font-sans">
                {formatCurrency(cat.totalSpending, "INR")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingCategory ? "Edit Expense Category" : "Create Expense Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Legal & Compliance"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Scope or type of expenses mapped here..."
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  isLoading={saving}
                  className="font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
