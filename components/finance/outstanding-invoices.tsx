"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { InvoiceWithDetails } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { useAuth } from "@/hooks/use-auth";

interface OutstandingInvoicesProps {
  invoices: InvoiceWithDetails[];
  onRecordPayment?: (invoice: InvoiceWithDetails) => void;
}

export function OutstandingInvoices({ invoices, onRecordPayment }: OutstandingInvoicesProps) {
  const { user } = useAuth();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const unpaid = invoices.filter((i) => i.amount_due > 0 && i.invoice_status !== "Cancelled");

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Outstanding Receivables ({unpaid.length})</h3>
            <p className="text-xs text-slate-500">Pending client balances requiring collection</p>
          </div>
        </div>

        <Link
          href="/finance/invoices?due=overdue"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {unpaid.length === 0 ? (
        <p className="text-xs text-slate-400 italic p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
          All client invoices are fully settled. No outstanding balances.
        </p>
      ) : (
        <div className="space-y-2.5">
          {unpaid.slice(0, 5).map((inv) => (
            <div
              key={inv.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-all group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/finance/invoices/${inv.id}`}
                    className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1 font-mono"
                  >
                    <span>{inv.invoice_number}</span>
                  </Link>
                  <InvoiceStatusBadge status={inv.invoice_status} size="sm" />
                </div>

                <p className="text-xs text-slate-700 font-semibold truncate">
                  {inv.client_company}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Due: <strong>{formatDate(inv.due_date || "")}</strong></span>
                  {inv.is_overdue && (
                    <span className="text-rose-700 font-bold">
                      (Overdue)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900 font-mono">
                    {formatCurrency(inv.amount_due, "INR")}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    of {formatCurrency(inv.total_amount, "INR")}
                  </p>
                </div>

                {canManage && onRecordPayment && (
                  <button
                    onClick={() => onRecordPayment(inv)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    Collect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
