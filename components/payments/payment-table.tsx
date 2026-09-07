"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  Building,
  Calendar,
  Trash2,
  MoreVertical,
  ArrowUpRight,
} from "lucide-react";
import { PaymentWithDetails } from "@/types/payment";
import { PaymentStatusBadge } from "./payment-status-badge";
import { PaymentMethodBadge } from "./payment-method-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { useAuth } from "@/hooks/use-auth";

import { DataTable } from "@/components/ui/data-table";

interface PaymentTableProps {
  payments: PaymentWithDetails[];
  loading?: boolean;
  onDelete?: (payment: PaymentWithDetails) => void;
}

export function PaymentTable({ payments, loading, onDelete }: PaymentTableProps) {
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

  if (payments.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-[#E6EAF2] bg-white space-y-3">
        <CreditCard className="w-10 h-10 text-[#8A93A3] mx-auto" />
        <h3 className="text-sm font-bold text-[#0F172A]">No payment transactions recorded</h3>
        <p className="text-xs text-[#5B6472] max-w-sm mx-auto">
          Recorded client payments and advance disbursements will appear here.
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
              <th scope="col" className="py-3 px-4">Payment Date</th>
              <th scope="col" className="py-3 px-4">Client & Project</th>
              <th scope="col" className="py-3 px-4">Channel</th>
              <th scope="col" className="py-3 px-4">Invoice Ref</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4 text-right">Realized Inflow</th>
              {canManage && <th scope="col" className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EAF2]">
            {payments.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-[#F7F9FC] transition-colors group"
              >
                {/* Payment Date */}
                <td className="py-3 px-4 font-mono text-[#0F172A] font-tabular">
                  {formatDate(p.payment_date)}
                </td>

                {/* Client & Project */}
                <td className="py-3 px-4">
                  <p className="font-semibold text-[#0F172A] truncate">
                    {p.client_company}
                  </p>
                  <p className="text-[11px] text-[#5B6472] truncate">
                    {p.project_name || "Direct Settlement"}
                  </p>
                </td>

                {/* Channel */}
                <td className="py-3 px-4">
                  <PaymentMethodBadge method={p.payment_method} size="sm" />
                </td>

                {/* Invoice Ref */}
                <td className="py-3 px-4">
                  {p.invoice_id ? (
                    <Link
                      href={`/finance/invoices/${p.invoice_id}`}
                      className="font-mono text-[#2451EB] hover:text-blue-700 font-semibold hover:underline inline-flex items-center gap-1 font-tabular"
                    >
                      <span>{p.invoice_number}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-[#8A93A3] font-mono text-[11px]">Direct Payment</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <PaymentStatusBadge status={p.payment_status} size="sm" />
                </td>

                {/* Amount */}
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 font-tabular">
                  +{formatCurrency(p.amount, "INR")}
                </td>

                {/* Actions */}
                {canManage && (
                  <td className="py-3 px-4 text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <button className="p-1 rounded-lg text-[#8A93A3] hover:text-[#0F172A] hover:bg-[#F7F9FC] transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    >
                      {onDelete && (
                        <DropdownItem onClick={() => onDelete(p)} destructive>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          <span>Delete Entry</span>
                        </DropdownItem>
                      )}
                    </Dropdown>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTable>
  );
}
