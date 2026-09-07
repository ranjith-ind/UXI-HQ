"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Send,
  CreditCard,
  Edit2,
  Trash2,
  XCircle,
  MoreVertical,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { InvoiceWithDetails } from "@/types/invoice";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { InvoiceTypeBadge } from "./invoice-type-badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { useAuth } from "@/hooks/use-auth";

import { DataTable } from "@/components/ui/data-table";

interface InvoiceTableProps {
  invoices: InvoiceWithDetails[];
  loading?: boolean;
  onEdit?: (invoice: InvoiceWithDetails) => void;
  onDelete?: (invoice: InvoiceWithDetails) => void;
  onMarkSent?: (invoice: InvoiceWithDetails) => void;
  onRecordPayment?: (invoice: InvoiceWithDetails) => void;
  onCancel?: (invoice: InvoiceWithDetails) => void;
}

export function InvoiceTable({
  invoices,
  loading,
  onEdit,
  onDelete,
  onMarkSent,
  onRecordPayment,
  onCancel,
}: InvoiceTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-[#F7F9FC] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-[#E6EAF2] bg-white space-y-3">
        <FileText className="w-10 h-10 text-[#8A93A3] mx-auto" />
        <h3 className="text-base font-bold text-[#0F172A]">No Invoices Found</h3>
        <p className="text-xs text-[#5B6472] max-w-sm mx-auto">
          No invoices match your selected filters. Create an invoice or adjust your filter query.
        </p>
      </div>
    );
  }

  return (
    <DataTable className="font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs saas-table">
          <thead className="border-b border-[#E6EAF2] bg-[#F7F9FC] text-[11px] font-semibold uppercase tracking-wider text-[#5B6472]">
            <tr>
              <th scope="col" className="px-4 py-3">
                Invoice Number
              </th>
              <th scope="col" className="px-4 py-3">
                Client & Project
              </th>
              <th scope="col" className="px-4 py-3">
                Type
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Issue / Due Date
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Total Amount
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Due Amount
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EAF2]">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
              >
                {/* Invoice Number */}
                <td className="px-4 py-3 font-mono font-bold text-[#0F172A] font-tabular">
                  <Link
                    href={`/finance/invoices/${inv.id}`}
                    className="group-hover:text-[#2451EB] transition-colors flex items-center gap-1.5"
                  >
                    <span>{inv.invoice_number}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </td>

                {/* Client & Project */}
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#0F172A] truncate">
                    {inv.client_company}
                  </p>
                  <p className="text-[11px] text-[#5B6472] truncate">
                    {inv.project_name || "General Invoice"}
                  </p>
                </td>

                {/* Type Badge */}
                <td className="px-4 py-3">
                  <InvoiceTypeBadge type={inv.invoice_type} size="sm" />
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                  <InvoiceStatusBadge status={inv.invoice_status} size="sm" />
                </td>

                {/* Dates */}
                <td className="px-4 py-3 font-medium">
                  <div className="space-y-0.5">
                    <p className="text-[#0F172A] font-tabular">{formatDate(inv.issue_date)}</p>
                    <p
                      className={cn(
                        "text-[10px] font-tabular",
                        inv.is_overdue
                          ? "text-rose-700 font-semibold"
                          : "text-[#8A93A3]"
                      )}
                    >
                      Due: {formatDate(inv.due_date || "")}
                    </p>
                  </div>
                </td>

                {/* Total Amount */}
                <td className="px-4 py-3 text-right font-mono font-bold text-[#0F172A] font-tabular">
                  {formatCurrency(inv.total_amount, "INR")}
                </td>

                {/* Due Amount */}
                <td className="px-4 py-3 text-right font-mono font-tabular">
                  {inv.amount_due > 0 ? (
                    <span className="font-bold text-[#0F172A]">
                      {formatCurrency(inv.amount_due, "INR")}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">Paid in full</span>
                  )}
                </td>

                {/* Actions Dropdown */}
                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    align="right"
                    trigger={
                      <button
                        aria-label="Actions"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  >
                    <Link href={`/finance/invoices/${inv.id}`}>
                      <DropdownItem>
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <span>View Invoice</span>
                      </DropdownItem>
                    </Link>

                    {canManage && inv.invoice_status === "Draft" && onMarkSent && (
                      <DropdownItem onClick={() => onMarkSent(inv)}>
                        <Send className="w-4 h-4 text-blue-600 mr-2" />
                        <span>Mark as Sent</span>
                      </DropdownItem>
                    )}

                    {canManage && inv.amount_due > 0 && inv.invoice_status !== "Cancelled" && onRecordPayment && (
                      <DropdownItem onClick={() => onRecordPayment(inv)}>
                        <CreditCard className="w-4 h-4 text-emerald-600 mr-2" />
                        <span>Record Payment</span>
                      </DropdownItem>
                    )}

                    {canManage && onEdit && (
                      <DropdownItem onClick={() => onEdit(inv)}>
                        <Edit2 className="w-4 h-4 text-slate-500 mr-2" />
                        <span>Edit Invoice</span>
                      </DropdownItem>
                    )}

                    {canManage && inv.invoice_status !== "Cancelled" && onCancel && (
                      <DropdownItem onClick={() => onCancel(inv)}>
                        <XCircle className="w-4 h-4 text-amber-500 mr-2" />
                        <span>Cancel Invoice</span>
                      </DropdownItem>
                    )}

                    {canManage && onDelete && (
                      <>
                        <DropdownSeparator />
                        <DropdownItem onClick={() => onDelete(inv)} destructive>
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span>Delete Invoice</span>
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
