"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Receipt,
  FolderKanban,
  Building,
  Calendar,
  Repeat,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  EXPENSE_PAYMENT_STATUS_LIST,
  ExpenseCategory,
  ExpenseFormData,
  ExpensePaymentStatus,
  ExpenseWithDetails,
  RECURRING_FREQUENCY_LIST,
  RecurringFrequency,
} from "@/types/expense";
import { PAYMENT_METHOD_LIST, PaymentMethod } from "@/types/payment";
import { ClientWithDetails } from "@/types/client";
import { ProjectWithDetails } from "@/types/project";
import { formatCurrency } from "@/lib/utils";
import { ClientService } from "@/services/client.service";
import { ProjectService } from "@/services/project.service";
import { ExpenseService } from "@/services/expense.service";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ExpenseFormData) => Promise<void>;
  initialData?: ExpenseWithDetails | null;
  mode?: "add" | "edit";
  preselectedProjectId?: string;
  preselectedClientId?: string;
}

export function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  preselectedProjectId,
  preselectedClientId,
}: ExpenseFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [clients, setClients] = useState<ClientWithDetails[]>([]);

  // Form State
  const [expenseTitle, setExpenseTitle] = useState("");
  const [categoryName, setCategoryName] = useState(DEFAULT_EXPENSE_CATEGORIES[0]);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");

  const [clientId, setClientId] = useState<string | undefined>(preselectedClientId);
  const [projectId, setProjectId] = useState<string | undefined>(preselectedProjectId);

  const [amount, setAmount] = useState<number | "">("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<ExpensePaymentStatus>("Paid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Credit Card");
  const [transactionReference, setTransactionReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("Monthly");
  const [nextRecurringDate, setNextRecurringDate] = useState("");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        ExpenseService.getCategories(),
        ProjectService.getProjects({ isArchived: false }),
        ClientService.getClients(),
      ]).then(([cats, projs, cls]) => {
        setCategories(cats);
        setProjects(projs);
        setClients(cls);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setExpenseTitle(initialData.expense_title);
      setCategoryName(initialData.category_name);
      setCategoryId(initialData.expense_category_id || undefined);
      setDescription(initialData.description || "");
      setVendorName(initialData.vendor_name || "");
      setVendorContact(initialData.vendor_contact || "");
      setClientId(initialData.client_id || undefined);
      setProjectId(initialData.project_id || undefined);
      setAmount(initialData.amount);
      setExpenseDate(initialData.expense_date);
      setDueDate(initialData.due_date || "");
      setPaymentStatus(initialData.payment_status);
      setPaymentMethod(initialData.payment_method);
      setTransactionReference(initialData.transaction_reference || "");
      setReceiptUrl(initialData.receipt_url || "");
      setIsRecurring(initialData.is_recurring);
      setRecurringFrequency(initialData.recurring_frequency || "Monthly");
      setNextRecurringDate(initialData.next_recurring_date || "");
      setNotes(initialData.notes || "");
    } else {
      setExpenseTitle("");
      setCategoryName(DEFAULT_EXPENSE_CATEGORIES[0]);
      setCategoryId(undefined);
      setDescription("");
      setVendorName("");
      setVendorContact("");
      setClientId(preselectedClientId);
      setProjectId(preselectedProjectId);
      setAmount("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setDueDate("");
      setPaymentStatus("Paid");
      setPaymentMethod("Credit Card");
      setTransactionReference("");
      setReceiptUrl("");
      setIsRecurring(false);
      setRecurringFrequency("Monthly");
      setNextRecurringDate("");
      setNotes("");
    }
    setCurrentStep(1);
    setErrorMsg("");
  }, [initialData, mode, isOpen, preselectedProjectId, preselectedClientId]);

  // Automatically sync client when project is selected
  const handleProjectSelect = (projId: string) => {
    setProjectId(projId ? projId : undefined);
    if (projId) {
      const proj = projects.find((p) => p.id === projId);
      if (proj && proj.client_id) {
        setClientId(proj.client_id);
      }
    }
  };

  const handleCategorySelect = (catName: string) => {
    setCategoryName(catName);
    const cat = categories.find((c) => c.name === catName);
    setCategoryId(cat ? cat.id : undefined);
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg("");
    if (step === 1) {
      if (!expenseTitle.trim()) {
        setErrorMsg("Expense title is required.");
        return false;
      }
      if (!categoryName) {
        setErrorMsg("Please select an expense category.");
        return false;
      }
    } else if (step === 3) {
      if (typeof amount !== "number" || amount <= 0) {
        setErrorMsg("Please enter a valid expense amount greater than 0.");
        return false;
      }
      if (!expenseDate) {
        setErrorMsg("Expense date is required.");
        return false;
      }
      if (dueDate && dueDate < expenseDate) {
        setErrorMsg("Due date cannot be before the expense date.");
        return false;
      }
    } else if (step === 4) {
      if (isRecurring && !nextRecurringDate) {
        setErrorMsg("Next recurring date is required for recurring subscriptions.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(3) || !validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const formData: ExpenseFormData = {
        expense_title: expenseTitle.trim(),
        description: description.trim() || undefined,
        expense_category_id: categoryId,
        category_name: categoryName,
        project_id: projectId,
        client_id: clientId,
        vendor_name: vendorName.trim() || undefined,
        vendor_contact: vendorContact.trim() || undefined,
        amount: Number(amount),
        expense_date: expenseDate,
        due_date: dueDate || undefined,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        transaction_reference: transactionReference.trim() || undefined,
        receipt_url: receiptUrl.trim() || undefined,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? recurringFrequency : undefined,
        next_recurring_date: isRecurring && nextRecurringDate ? nextRecurringDate : undefined,
        notes: notes.trim() || undefined,
      };

      await onSubmit(formData);
      onClose();
    } catch {
      setErrorMsg("Failed to save expense record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{mode === "add" ? "Log New Expense" : "Edit Expense Record"}</span>
            </h2>
            <p className="text-xs text-slate-500">Step {currentStep} of 5 — Granular cost tracking</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100 shrink-0">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Allocation" },
            { num: 3, label: "Amount & Pay" },
            { num: 4, label: "Subscription" },
            { num: 5, label: "Review" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < currentStep || validateStep(currentStep)) setCurrentStep(s.num);
              }}
              className={`flex items-center gap-2 text-xs font-semibold ${
                currentStep === s.num
                  ? "text-blue-600 font-bold"
                  : currentStep > s.num
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  currentStep === s.num
                    ? "bg-blue-600 text-white shadow-sm"
                    : currentStep > s.num
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body Steps */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">
                  Expense Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS Production Infrastructure Billing"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                  >
                    {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Vendor / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services, GitHub, Vercel"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Description / Scope Notes</label>
                <textarea
                  rows={3}
                  placeholder="Optional context or purpose of this expense..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Allocation */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-600">
                Link this expense to a specific client or project to automatically attribute direct costs and calculate net margins.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Associated Project (Optional)</label>
                <select
                  value={projectId || ""}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="">General Overhead (No Project)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.project_name} ({p.project_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Associated Client (Optional)</label>
                <select
                  value={clientId || ""}
                  onChange={(e) => setClientId(e.target.value || undefined)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="">General Company (No Client)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Amount & Payment */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Expense Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Expense Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as ExpensePaymentStatus)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    {EXPENSE_PAYMENT_STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Payment Method</label>
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
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Transaction UTR / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. ICICI IMPS Ref / Invoice #10293"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Subscription & Recurring */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <input
                  type="checkbox"
                  id="isRecurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isRecurringCheck" className="text-xs font-bold text-slate-900 cursor-pointer">
                  Is this a Recurring Subscription or License?
                </label>
              </div>

              {isRecurring && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 font-display">Billing Frequency</label>
                      <select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value as RecurringFrequency)}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                      >
                        {RECURRING_FREQUENCY_LIST.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 font-display">
                        Next Billing Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={nextRecurringDate}
                        onChange={(e) => setNextRecurringDate(e.target.value)}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Internal Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional accounting notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-sans">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-display">{expenseTitle}</h3>
                    <p className="text-slate-500">{categoryName} • {vendorName || "Direct"}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatCurrency(Number(amount) || 0, "INR")}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{paymentStatus}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block font-semibold">Expense Date:</span>
                    <span>{expenseDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Payment Channel:</span>
                    <span>{paymentMethod}</span>
                  </div>
                  {isRecurring && (
                    <div className="col-span-2 text-purple-700 font-semibold">
                      Recurring: {recurringFrequency} (Next: {nextRecurringDate})
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          {currentStep > 1 ? (
            <Button variant="secondary" size="sm" onClick={handlePrev} className="gap-1 font-semibold">
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <Button variant="default" size="sm" onClick={handleNext} className="gap-1 font-semibold shadow-sm">
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="font-bold shadow-sm bg-blue-600 hover:bg-blue-700"
              >
                {mode === "add" ? "Save Expense Record" : "Update Expense"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
