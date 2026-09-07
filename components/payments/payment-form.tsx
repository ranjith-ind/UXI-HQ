"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Building,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentFormData, PaymentMethod, PAYMENT_METHOD_LIST } from "@/types/payment";
import { ClientService } from "@/services/client.service";
import { ProjectService } from "@/services/project.service";
import { InvoiceService } from "@/services/invoice.service";
import { PaymentService } from "@/services/payment.service";
import { ClientWithDetails } from "@/types/client";
import { ProjectWithDetails } from "@/types/project";
import { InvoiceWithDetails } from "@/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentForm({ isOpen, onClose, onSuccess }: PaymentFormProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        ClientService.getClients(),
        ProjectService.getProjects({ isArchived: false }),
        InvoiceService.getInvoices(),
      ]).then(([cList, pList, invList]) => {
        setClients(cList);
        setProjects(pList);
        setInvoices(invList);
      });

      setClientId("");
      setProjectId("");
      setInvoiceId("");
      setAmount(0);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("Bank Transfer");
      setTransactionReference("");
      setNotes("");
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const clientInvoices = clientId
    ? invoices.filter((i) => i.client_id === clientId && i.amount_due > 0 && i.invoice_status !== "Cancelled")
    : [];

  const clientProjects = clientId
    ? projects.filter((p) => p.client_id === clientId)
    : [];

  const selectedInvoice = invoices.find((i) => i.id === invoiceId);

  const handleInvoiceSelect = (invId: string) => {
    setInvoiceId(invId);
    if (invId) {
      const inv = invoices.find((i) => i.id === invId);
      if (inv) {
        setAmount(inv.amount_due);
        if (inv.project_id) setProjectId(inv.project_id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredAmount = Number(amount);

    if (!clientId) {
      setErrorMsg("Please select a client.");
      return;
    }
    if (!enteredAmount || enteredAmount <= 0) {
      setErrorMsg("Please specify a valid payment amount greater than zero.");
      return;
    }
    if (selectedInvoice && enteredAmount > selectedInvoice.amount_due) {
      setErrorMsg(`Amount cannot exceed the selected invoice balance of ${formatCurrency(selectedInvoice.amount_due, "INR")}.`);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload: PaymentFormData = {
        invoice_id: invoiceId || undefined,
        client_id: clientId,
        project_id: projectId || undefined,
        amount: enteredAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_reference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
        payment_status: "Completed",
      };

      const res = await PaymentService.recordPayment(payload, user?.fullName || "Admin");

      if (res.success) {
        success("Payment entry recorded", `Credited ${formatCurrency(enteredAmount, "INR")} to ledger.`);
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
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Record Inflow Payment</h3>
              <p className="text-xs text-slate-500">
                Log a client settlement or direct project disbursement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">
              Client <span className="text-rose-500">*</span>
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setInvoiceId("");
                setProjectId("");
              }}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="">Select a Client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">
              Link to Unpaid Invoice (Optional)
            </label>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              disabled={!clientId}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm disabled:opacity-50"
            >
              <option value="">Direct Settlement (No Invoice)</option>
              {clientInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} — Due: {formatCurrency(inv.amount_due, "INR")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">
                Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
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
              <label className="text-xs font-bold text-slate-700 font-display">Transaction UTR / Ref</label>
              <input
                type="text"
                placeholder="e.g. UTR / IMPS / Stripe"
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
              placeholder="e.g. Bank transfer credited to ICICI main account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
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
              className="font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
