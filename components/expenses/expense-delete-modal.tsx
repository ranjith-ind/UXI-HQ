"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseWithDetails } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";

interface ExpenseDeleteModalProps {
  expense: ExpenseWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (expenseId: string) => Promise<void>;
}

export function ExpenseDeleteModal({
  expense,
  isOpen,
  onClose,
  onConfirm,
}: ExpenseDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !expense) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(expense.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Delete Expense Record?</h3>
              <p className="text-xs text-slate-500">Irreversible accounting action</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete expense record{" "}
            <span className="font-bold text-slate-900 font-mono">{expense.expense_number}</span> (
            <span className="font-bold text-slate-900">{expense.expense_title}</span> —{" "}
            <span className="font-mono font-bold text-slate-900">{formatCurrency(expense.amount, "INR")}</span>)?
            This will adjust profitability metrics accordingly.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={loading}
            className="font-bold"
          >
            Yes, Delete Expense
          </Button>
        </div>
      </div>
    </div>
  );
}
