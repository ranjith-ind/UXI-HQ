"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PaymentWithDetails } from "@/types/payment";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentMethodBadge } from "@/components/payments/payment-method-badge";

interface RecentPaymentsProps {
  payments: PaymentWithDetails[];
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  const completed = payments.filter((p) => p.payment_status === "Completed");

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Recent Payments Realized</h3>
            <p className="text-xs text-slate-500">Verified inflows credited to UXI bank accounts</p>
          </div>
        </div>

        <Link
          href="/finance/payments"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          <span>View Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {completed.length === 0 ? (
        <p className="text-xs text-slate-400 italic p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
          No payments recorded yet.
        </p>
      ) : (
        <div className="space-y-2.5">
          {completed.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs text-slate-900 truncate">
                    {p.client_company}
                  </p>
                  <PaymentMethodBadge method={p.payment_method} size="sm" />
                </div>

                <p className="text-[11px] text-slate-500 truncate">
                  {p.invoice_number ? `Invoice ${p.invoice_number}` : "Direct Payment"}
                  {p.project_name && ` • ${p.project_name}`}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-emerald-700 font-mono">
                  +{formatCurrency(p.amount, "INR")}
                </p>
                <p className="text-[10px] text-slate-500">
                  {formatDate(p.payment_date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
