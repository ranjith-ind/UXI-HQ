"use client";

import React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Repeat,
  FileText,
  Building,
  FolderKanban,
  ArrowUpRight,
} from "lucide-react";
import { ExpenseWithDetails } from "@/types/expense";
import { ExpenseStatusBadge } from "./expense-status-badge";
import { ExpenseCategoryBadge } from "./expense-category-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { useAuth } from "@/hooks/use-auth";

import { DataTable } from "@/components/ui/data-table";

interface ExpenseTableProps {
  expenses: ExpenseWithDetails[];
  onEdit?: (expense: ExpenseWithDetails) => void;
  onDelete?: (expense: ExpenseWithDetails) => void;
  onMarkPaid?: (expense: ExpenseWithDetails) => void;
  onGenerateNext?: (expense: ExpenseWithDetails) => void;
}

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  onMarkPaid,
  onGenerateNext,
}: ExpenseTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-12 text-center">
        <FileText className="w-10 h-10 text-[#8A93A3] mx-auto mb-3" />
        <h4 className="text-sm font-bold text-[#0F172A]">No expenses found</h4>
        <p className="text-xs text-[#5B6472] max-w-sm mx-auto mt-1">
          No expenditure records match your active search filters or date range.
        </p>
      </div>
    );
  }

  return (
    <DataTable className="font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs saas-table">
          <thead>
            <tr className="border-b border-[#E6EAF2] bg-[#F7F9FC] text-[11px] font-semibold uppercase tracking-wider text-[#5B6472]">
              <th scope="col" className="py-3 px-4">Expense Title & Ref</th>
              <th scope="col" className="py-3 px-4">Category</th>
              <th scope="col" className="py-3 px-4">Vendor</th>
              <th scope="col" className="py-3 px-4">Project / Client</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4">Expense Date</th>
              <th scope="col" className="py-3 px-4 text-right">Amount</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EAF2]">
            {expenses.map((exp) => (
              <tr
                key={exp.id}
                className="hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
              >
                {/* Title & Ref */}
                <td className="py-3 px-4">
                  <div className="space-y-0.5">
                    <Link
                      href={`/expenses/${exp.id}`}
                      className="font-semibold text-[#0F172A] group-hover:text-[#2451EB] transition-colors flex items-center gap-1.5"
                    >
                      <span className="truncate max-w-[200px]">{exp.expense_title}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8A93A3] font-tabular">
                      <span>{exp.expense_number}</span>
                      {exp.is_recurring && (
                        <span className="inline-flex items-center gap-0.5 text-purple-700 bg-purple-50 px-1 rounded border border-purple-200 font-semibold">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>{exp.recurring_frequency}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4">
                  <ExpenseCategoryBadge categoryName={exp.category_name} size="sm" />
                </td>

                {/* Vendor */}
                <td className="py-3 px-4 font-medium text-[#0F172A] truncate max-w-[120px]">
                  {exp.vendor_name || "—"}
                </td>

                {/* Project / Client */}
                <td className="py-3 px-4">
                  {exp.project_name ? (
                    <Link
                      href={`/projects/${exp.project_id}`}
                      className="text-xs font-semibold text-[#0F172A] hover:text-[#2451EB] truncate block max-w-[140px]"
                    >
                      {exp.project_name}
                    </Link>
                  ) : exp.client_company ? (
                    <Link
                      href={`/clients/${exp.client_id}`}
                      className="text-xs font-semibold text-[#5B6472] hover:text-[#2451EB] truncate block max-w-[140px]"
                    >
                      {exp.client_company}
                    </Link>
                  ) : (
                    <span className="text-[#8A93A3] text-[11px]">General Company</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <ExpenseStatusBadge status={exp.payment_status} size="sm" />
                </td>

                {/* Date */}
                <td className="py-3 px-4 font-medium text-[#0F172A] font-tabular">
                  {formatDate(exp.expense_date)}
                </td>

                {/* Amount */}
                <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A] font-tabular">
                  {formatCurrency(exp.amount, "INR")}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    align="right"
                    trigger={
                      <button className="p-1 rounded-lg text-[#8A93A3] hover:text-[#0F172A] hover:bg-[#F7F9FC] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  >
                    <Link href={`/expenses/${exp.id}`}>
                      <DropdownItem>
                        <Eye className="w-3.5 h-3.5 text-[#2451EB] mr-2" />
                        <span>View Details</span>
                      </DropdownItem>
                    </Link>

                    {canManage && exp.payment_status !== "Paid" && onMarkPaid && (
                      <DropdownItem onClick={() => onMarkPaid(exp)}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                        <span>Mark as Paid</span>
                      </DropdownItem>
                    )}

                    {canManage && exp.is_recurring && onGenerateNext && (
                      <DropdownItem onClick={() => onGenerateNext(exp)}>
                        <Repeat className="w-3.5 h-3.5 text-purple-600 mr-2" />
                        <span>Generate Next Cycle</span>
                      </DropdownItem>
                    )}

                    {canManage && onEdit && (
                      <DropdownItem onClick={() => onEdit(exp)}>
                        <Edit2 className="w-3.5 h-3.5 text-[#5B6472] mr-2" />
                        <span>Edit Expense</span>
                      </DropdownItem>
                    )}

                    {canManage && onDelete && (
                      <>
                        <DropdownSeparator />
                        <DropdownItem onClick={() => onDelete(exp)} destructive>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          <span>Delete Expense</span>
                        </DropdownItem>
                      </>
                    )}
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTable>
  );
}
