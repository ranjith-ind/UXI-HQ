"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InvoiceFormData,
  InvoiceType,
  InvoiceWithDetails,
  INVOICE_TYPE_LIST,
} from "@/types/invoice";
import { ClientService } from "@/services/client.service";
import { ProjectService } from "@/services/project.service";
import { ClientWithDetails } from "@/types/client";
import { ProjectWithDetails } from "@/types/project";
import { formatCurrency } from "@/lib/utils";

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  initialData?: InvoiceWithDetails | null;
  mode?: "add" | "edit";
  preselectedClientId?: string;
  preselectedProjectId?: string;
}

export function InvoiceForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  preselectedClientId,
  preselectedProjectId,
}: InvoiceFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("Milestone");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);

  const [items, setItems] = useState<
    Array<{ item_name: string; description: string; quantity: number; unit_price: number }>
  >([
    {
      item_name: "Web Development Deliverables",
      description: "Frontend Next.js implementation & API integration",
      quantity: 1,
      unit_price: 100000,
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        ClientService.getClients(),
        ProjectService.getProjects({ isArchived: false }),
      ]).then(([cList, pList]) => {
        setClients(cList);
        setProjects(pList);
      });

      if (initialData && mode === "edit") {
        setClientId(initialData.client_id || "");
        setProjectId(initialData.project_id || "");
        setInvoiceTitle(initialData.invoice_title || "");
        setDescription(initialData.description || "");
        setInvoiceType(initialData.invoice_type || "Milestone");
        setIssueDate(initialData.issue_date || "");
        setDueDate(initialData.due_date || "");
        setNotes(initialData.notes || "");
        setDiscountAmount(Number(initialData.discount_amount) || 0);
        setTaxAmount(Number(initialData.tax_amount) || 0);

        if (initialData.items && initialData.items.length > 0) {
          setItems(
            initialData.items.map((it) => ({
              item_name: it.item_name,
              description: it.description || "",
              quantity: it.quantity,
              unit_price: it.unit_price,
            }))
          );
        }
      } else {
        setClientId(preselectedClientId || "");
        setProjectId(preselectedProjectId || "");
        setInvoiceTitle("");
        setDescription("");
        setInvoiceType("Milestone");
        const today = new Date().toISOString().split("T")[0];
        const next10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        setIssueDate(today);
        setDueDate(next10Days);
        setNotes("");
        setDiscountAmount(0);
        setTaxAmount(0);
        setItems([
          {
            item_name: "Phase Engineering Milestone",
            description: "Custom digital solutions & web development deliverables",
            quantity: 1,
            unit_price: 150000,
          },
        ]);
      }
      setStep(1);
      setErrors({});
    }
  }, [isOpen, initialData, mode, preselectedClientId, preselectedProjectId]);

  if (!isOpen) return null;

  const clientProjects = clientId
    ? projects.filter((p) => p.client_id === clientId)
    : projects;

  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);
  const totalAmount = Math.max(0, subtotal - (Number(discountAmount) || 0) + (Number(taxAmount) || 0));

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_name: "",
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!clientId) errs.clientId = "Please select a client";
    }

    if (s === 2) {
      if (!invoiceTitle.trim()) errs.invoiceTitle = "Invoice title is required";
      if (!issueDate) errs.issueDate = "Issue date is required";
    }

    if (s === 3) {
      const emptyItems = items.some((it) => !it.item_name.trim() || it.quantity <= 0);
      if (emptyItems) errs.items = "All line items must have a title and quantity > 0";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setLoading(true);
    try {
      await onSubmit({
        client_id: clientId,
        project_id: projectId || undefined,
        invoice_title: invoiceTitle,
        description,
        invoice_type: invoiceType,
        invoice_status: saveAsDraft ? "Draft" : "Sent",
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        issue_date: issueDate,
        due_date: dueDate || undefined,
        notes,
        items,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{mode === "add" ? "Create New Invoice" : "Edit Invoice"}</span>
            </h2>
            <p className="text-xs text-slate-500">Step {step} of 5 — Step-by-step invoice generation</p>
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
            { num: 1, label: "Client & Project" },
            { num: 2, label: "Invoice Meta" },
            { num: 3, label: "Line Items" },
            { num: 4, label: "Taxes & Notes" },
            { num: 5, label: "Review & Send" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < step || validateStep(step)) setStep(s.num);
              }}
              className={`flex items-center gap-2 text-xs font-semibold ${
                step === s.num
                  ? "text-blue-600 font-bold"
                  : step > s.num
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  step === s.num
                    ? "bg-blue-600 text-white shadow-sm"
                    : step > s.num
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body Steps */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">
                  Select Client <span className="text-rose-500">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setProjectId("");
                  }}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="">Select a Client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.full_name || c.email})
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.clientId}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">
                  Associated Project (Optional)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                >
                  <option value="">No Project (General Invoicing)</option>
                  {clientProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.project_name} ({p.project_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">
                  Invoice Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phase 1 — MVP Architecture & Design System"
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                {errors.invoiceTitle && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.invoiceTitle}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Invoice Type</label>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                  >
                    {INVOICE_TYPE_LIST.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">
                    Issue Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                  {errors.issueDate && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.issueDate}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Description / Scope Summary</label>
                <textarea
                  rows={3}
                  placeholder="Optional brief description of services rendered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Line Items */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-display">Invoice Deliverables & Line Items</span>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddItem} className="gap-1 font-semibold">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </Button>
              </div>

              {errors.items && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.items}</p>
              )}

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase font-display">
                          Item Description / Deliverable #{idx + 1}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js SaaS Web App Frontend"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(idx, "item_name", e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="w-24 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase font-display">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="w-32 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase font-display">Unit Price (INR)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, "unit_price", Number(e.target.value))}
                          className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="mt-6 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal Preview */}
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Subtotal</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {formatCurrency(subtotal, "INR")}
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Taxes & Notes */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Discount Amount (INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Tax Amount (e.g. GST)</label>
                  <input
                    type="number"
                    min="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Payment Notes & Bank Instructions</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Direct wire transfer to ICICI Account 9876543210 (IFSC: ICIC0001234)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal, "INR")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatCurrency(discountAmount, "INR")}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Tax:</span>
                    <span>+{formatCurrency(taxAmount, "INR")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totalAmount, "INR")}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Send */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-display">{invoiceTitle}</h3>
                    <p className="text-slate-500">{selectedClient?.company_name}</p>
                    {selectedProject && <p className="text-blue-600 font-semibold">{selectedProject.project_name}</p>}
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {invoiceType}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Due: {dueDate || "On Receipt"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-700 font-display">Line Items Summary ({items.length})</span>
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>
                        {it.item_name} (x{it.quantity})
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(it.quantity * it.unit_price, "INR")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 font-display">Total Final Billed</span>
                  <span className="text-lg font-extrabold text-blue-700 font-mono">
                    {formatCurrency(totalAmount, "INR")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          {step > 1 ? (
            <Button variant="secondary" size="sm" onClick={handleBack} className="gap-1 font-semibold">
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <Button variant="default" size="sm" onClick={handleNext} className="gap-1 font-semibold shadow-sm">
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="font-semibold"
                >
                  Save as Draft
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSubmit(false)}
                  isLoading={loading}
                  className="font-bold shadow-sm bg-blue-600 hover:bg-blue-700"
                >
                  Create & Send Invoice
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
