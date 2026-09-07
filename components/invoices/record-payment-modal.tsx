"use client";

import React, { useState } from "react";
import { X, DollarSign, Calendar, CreditCard, FileText, AlertTriangle } from "lucide-react";
import { InvoiceWithDetails } from "@/types/invoice";
import { PaymentFormData, PaymentMethod, PAYMENT_METHOD_LIST } from "@/types/payment";
import { PaymentService } from "@/services/payment.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceWithDetails | null;
  onSuccess: () => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: RecordPaymentModalProps) {
  const { user } = useAuth();
  const { success } = useToast();

  const [amount, setAmount] = useState<number>(invoice?.amount_due || 0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync state when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.amount_due);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("Bank Transfer");
      setTransactionReference("");
      setNotes("");
      setErrorMsg("");
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const remainingBalanceAfter = Math.max(0, invoice.amount_due - (amount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg("Please specify a valid payment amount greater than zero.");
      return;
    }
    if (amount > invoice.amount_due) {
      setErrorMsg(`Amount cannot exceed the current outstanding balance of ${formatCurrency(invoice.amount_due, "INR")}.`);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload: PaymentFormData = {
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        project_id: invoice.project_id || undefined,
        amount: Number(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_reference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
        payment_status: "Completed",
      };

      const res = await PaymentService.recordPayment(payload, user?.fullName || "Admin");

      if (res.success) {
        success("Payment recorded", `Credited ${formatCurrency(amount, "INR")} to ${invoice.invoice_number}.`);
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to record payment.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while processing payment.");
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

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Record Client Payment</h3>
              <p className="text-xs text-slate-500 font-medium">Invoice: {invoice.invoice_number}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Summary Card */}
        <div className="mx-6 mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-display">Client</span>
            <p className="font-bold text-slate-900 truncate mt-0.5">{invoice.client_company}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-display">Total Billed</span>
            <p className="font-mono font-bold text-slate-900 mt-0.5">
              {formatCurrency(invoice.total_amount, "INR")}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-display">Outstanding Due</span>
            <p className="font-mono font-extrabold text-blue-700 mt-0.5">
              {formatCurrency(invoice.amount_due, "INR")}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">
                Payment Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.amount_due}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Payment Channel</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {PAYMENT_METHOD_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Transaction Ref / UTR</label>
              <input
                type="text"
                placeholder="e.g. UTR / IMPS / Stripe ID"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">Payment Notes</label>
            <input
              type="text"
              placeholder="e.g. First tranche credited via ICICI Current Account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* Balance projection */}
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Projected Remaining Due:</span>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(remainingBalanceAfter, "INR")}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={loading}
              className="font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              Confirm & Settle Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
