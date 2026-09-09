"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Send,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Edit2,
  Trash2,
  XCircle,
  History,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceTypeBadge } from "@/components/invoices/invoice-type-badge";
import { PaymentMethodBadge } from "@/components/payments/payment-method-badge";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
import { InvoiceService } from "@/services/invoice.service";
import { PaymentService } from "@/services/payment.service";
import { DashboardService } from "@/services/dashboard.service";
import { InvoiceFormData, InvoiceWithDetails } from "@/types/invoice";
import { PaymentWithDetails } from "@/types/payment";
import { ActivityItem } from "@/types";
import { formatCurrency, formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedInvoice, allPayments, allActivities] = await Promise.all([
        InvoiceService.getInvoiceById(id),
        PaymentService.getPayments({ invoiceId: id }),
        DashboardService.getRecentActivities(),
      ]);

      if (!fetchedInvoice) {
        toastError("Invoice not found");
        router.push("/finance/invoices");
        return;
      }

      setInvoice(fetchedInvoice);
      setPayments(allPayments);

      const relatedActs = allActivities.filter(
        (a: ActivityItem) =>
          a.targetName.toLowerCase().includes(fetchedInvoice.invoice_number.toLowerCase()) ||
          a.targetName.toLowerCase().includes(fetchedInvoice.id.toLowerCase())
      );
      setActivities(relatedActs);
    } catch (err) {
      console.error("Failed to load invoice:", err);
      toastError("Error loading invoice");
    } finally {
      setLoading(false);
    }
  }, [id, router, toastError]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  // Realtime subscription for invoice, items, and payments
  useRealtimeTables({
    tables: ["invoices", "invoice_items", "payments", "activity_logs"],
    onChange: loadInvoice,
  });

  const handleEditSubmit = async (formData: InvoiceFormData) => {
    const res = await InvoiceService.updateInvoice(id, formData, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice updated", "Changes saved successfully.");
      setIsEditOpen(false);
      loadInvoice();
    } else {
      toastError("Failed to update invoice", res.error);
    }
  };

  const handleMarkSent = async () => {
    const res = await InvoiceService.markInvoiceSent(id, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice dispatched", "Status changed to Sent.");
      loadInvoice();
    } else {
      toastError("Failed to mark invoice as sent", res.error);
    }
  };

  const handleCancelInvoice = async () => {
    const res = await InvoiceService.cancelInvoice(id, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice cancelled", "Invoice has been marked as cancelled.");
      loadInvoice();
    } else {
      toastError("Failed to cancel invoice", res.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;
    const res = await InvoiceService.deleteInvoice(id, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice deleted", "Invoice removed.");
      router.push("/finance/invoices");
    } else {
      toastError("Failed to delete invoice", res.error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-1/4" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl col-span-2" />
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const percentPaid =
    invoice.total_amount > 0
      ? Math.min(100, Math.round((invoice.amount_paid / invoice.total_amount) * 100))
      : 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/finance/invoices"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#2451EB]" />
          <span>Back to Invoices Directory</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && invoice.invoice_status === "Draft" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkSent}
              className="gap-1.5 font-semibold text-[#2451EB]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mark as Sent</span>
            </Button>
          )}

          {canManage && invoice.amount_due > 0 && invoice.invoice_status !== "Cancelled" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsPaymentOpen(true)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </Button>
          )}

          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#5B6472]" />
              <span>Edit</span>
            </Button>
          )}

          {canManage && invoice.invoice_status !== "Cancelled" && invoice.invoice_status !== "Paid" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancelInvoice}
              className="gap-1.5 text-amber-600 font-semibold"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Button>
          )}

          {canManage && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Invoice Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#E6EAF2] bg-white p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-semibold font-mono text-[#0F172A] tracking-tight font-tabular">
                {invoice.invoice_number}
              </span>
              <InvoiceStatusBadge status={invoice.invoice_status} />
              <InvoiceTypeBadge type={invoice.invoice_type} />
            </div>

            <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">
              {invoice.invoice_title}
            </h1>

            <p className="text-xs text-[#5B6472]">
              Client: <span className="font-semibold text-[#0F172A]">{invoice.client_company}</span>
              {invoice.project_name && (
                <>
                  <span className="mx-2 text-slate-300">•</span>
                  Project: <span className="text-[#2451EB] font-semibold">{invoice.project_name}</span> (
                  <span className="font-mono text-[#5B6472]">{invoice.project_code}</span>)
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end text-xs text-[#5B6472] gap-1 shrink-0 font-sans">
            <div>
              Issue Date: <span className="text-[#0F172A] font-semibold font-tabular">{formatDate(invoice.issue_date)}</span>
            </div>
            <div>
              Due Date:{" "}
              {invoice.due_date ? (
                <span className={cn("font-tabular", invoice.is_overdue ? "text-rose-600 font-bold" : "text-[#0F172A] font-semibold")}>
                  {formatDate(invoice.due_date)} {invoice.is_overdue && "(Overdue)"}
                </span>
              ) : (
                "On Receipt"
              )}
            </div>
            {invoice.paid_at && (
              <div className="text-emerald-600 font-semibold font-tabular">
                Paid: {formatDate(invoice.paid_at)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Billing Details & Payment Summary */}
        <div className="space-y-6 lg:col-span-1">
          {/* Billing Info Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase font-display tracking-wider pb-3 border-b border-slate-100">
              Client & Billing Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-display uppercase font-bold block">Company Name</span>
                <p className="font-bold text-slate-900 text-sm">{invoice.client_company}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-display uppercase font-bold block">Primary Contact</span>
                <p className="text-slate-700 font-semibold">{invoice.client_name}</p>
              </div>

              {invoice.client_email && (
                <div>
                  <span className="text-[10px] text-slate-400 font-display uppercase font-bold block">Billing Email</span>
                  <a
                    href={`mailto:${invoice.client_email}`}
                    className="text-blue-600 hover:underline font-mono"
                  >
                    {invoice.client_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Payment Realization Progress Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase font-display tracking-wider pb-3 border-b border-slate-100">
              Payment Realization
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Collected:</span>
                <span className="text-slate-900 font-mono font-bold">{percentPaid}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Total Billed:</span>
                <span className="font-bold text-slate-900">{formatCurrency(invoice.total_amount, "INR")}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Amount Paid:</span>
                <span className="font-bold">+{formatCurrency(invoice.amount_paid, "INR")}</span>
              </div>
              <div className="flex justify-between text-rose-700 pt-2 border-t border-slate-200 font-bold">
                <span>Remaining Due:</span>
                <span>{formatCurrency(invoice.amount_due, "INR")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Line Items & Transactions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Line Items Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-display">Invoice Line Items & Scope</h3>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {invoice.items?.length || 0} Deliverables
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 font-display">
                  <tr>
                    <th className="py-3 px-5">Deliverable Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Rate</th>
                    <th className="py-3 px-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 font-display">{item.item_name}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-700">
                        {formatCurrency(item.unit_price, "INR")}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.total, "INR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Summary */}
            <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex flex-col items-end space-y-2 text-xs font-mono">
              <div className="flex justify-between w-64 text-slate-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, "INR")}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between w-64 text-emerald-700">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discount_amount, "INR")}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between w-64 text-slate-600">
                  <span>Tax:</span>
                  <span>+{formatCurrency(invoice.tax_amount, "INR")}</span>
                </div>
              )}
              <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Final Total:</span>
                <span className="text-blue-700">{formatCurrency(invoice.total_amount, "INR")}</span>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display">Linked Inflow Payments</h3>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {payments.length} Payments
              </span>
            </div>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No payments recorded against this invoice yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <PaymentMethodBadge method={p.payment_method} size="sm" />
                        <PaymentStatusBadge status={p.payment_status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono pt-1">
                        {formatDate(p.payment_date)} {p.transaction_reference && `• Ref: ${p.transaction_reference}`}
                      </p>
                    </div>

                    <span className="font-mono font-extrabold text-emerald-700 text-sm">
                      +{formatCurrency(p.amount, "INR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoiceForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={invoice}
        mode="edit"
      />

      <RecordPaymentModal
        invoice={invoice}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={loadInvoice}
      />
    </div>
  );
}
