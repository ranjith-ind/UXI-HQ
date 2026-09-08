"use client";

import React from "react";
import Link from "next/link";
import { InvoiceWithDetails } from "@/types/invoice";
import {
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowUpRight,
  FileText,
  CreditCard,
  Edit,
  Trash2,
  Send,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InvoiceTableProps {
  invoices: InvoiceWithDetails[];
  loading?: boolean;
  onRecordPayment?: (invoice: InvoiceWithDetails) => void;
  onEdit?: (invoice: InvoiceWithDetails) => void;
  onDelete?: (invoice: InvoiceWithDetails) => void | Promise<void>;
  onMarkSent?: (invoice: InvoiceWithDetails) => void | Promise<void>;
  onCancel?: (invoice: InvoiceWithDetails) => void | Promise<void>;
  onStatusChange?: (invoice: InvoiceWithDetails, status: string) => void;
  onDownloadPdf?: (invoice: InvoiceWithDetails) => void;
}

export function InvoiceTable({
  invoices,
  loading = false,
  onRecordPayment,
  onEdit,
  onDelete,
  onMarkSent,
  onCancel,
}: InvoiceTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-slate-50 border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 font-display">
          No invoice records found
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Create an invoice to start tracking client billing, milestone payments, and tax receipts.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
      <DataTable>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => {
            const clientName = inv.client_company || inv.client_name || "Client";
            const projectName = inv.project_name || "—";
            const amount = inv.total_amount ?? 0;
            const dueDate = inv.due_date || inv.issue_date;

            return (
              <TableRow key={inv.id}>
                <TableCell className="font-bold text-slate-900 font-mono">
                  {inv.invoice_number || inv.id.slice(0, 8)}
                </TableCell>
                <TableCell className="font-semibold text-slate-800">
                  {clientName}
                </TableCell>
                <TableCell className="text-slate-600">
                  {projectName}
                </TableCell>
                <TableCell className="font-extrabold text-slate-900 font-tabular">
                  {formatCurrency(amount, "INR")}
                </TableCell>
                <TableCell>
                  <StatusBadge status={inv.invoice_status} size="sm" />
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-[11px]">
                  {dueDate ? formatDate(dueDate) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onMarkSent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkSent(inv)}
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold"
                        title="Mark as Sent"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>Send</span>
                      </Button>
                    )}
                    {onRecordPayment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRecordPayment(inv)}
                        className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                        title="Record Payment"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" />
                        <span>Pay</span>
                      </Button>
                    )}
                    {onCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(inv)}
                        className="h-8 w-8 p-0 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                        title="Cancel Invoice"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(inv)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                        title="Edit Invoice"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(inv)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Link
                      href={`/finance/invoices/${inv.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </DataTable>
    </div>
  );
}