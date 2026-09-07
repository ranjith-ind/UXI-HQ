"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
import { InvoiceService } from "@/services/invoice.service";
import {
  InvoiceDueFilter,
  InvoiceFormData,
  InvoiceSortOption,
  InvoiceStatus,
  InvoiceType,
  InvoiceWithDetails,
} from "@/types/invoice";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function InvoicesPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "All">("All");
  const [dueFilter, setDueFilter] = useState<InvoiceDueFilter>("all");
  const [sortBy, setSortBy] = useState<InvoiceSortOption>("recently_created");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceWithDetails | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await InvoiceService.getInvoices({
        search,
        status: statusFilter,
        type: typeFilter,
        dueFilter,
        sortBy,
      });
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      toastError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, dueFilter, sortBy, toastError]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleOpenAdd = () => {
    setSelectedInvoice(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (inv: InvoiceWithDetails) => {
    setSelectedInvoice(inv);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: InvoiceFormData) => {
    const actor = user?.fullName || "Ranjith";
    if (formMode === "add") {
      const res = await InvoiceService.createInvoice(formData, actor);
      if (res.success) {
        success("Invoice created", `${res.invoice?.invoice_number} successfully registered.`);
        loadInvoices();
      } else {
        toastError("Failed to create invoice", res.error);
      }
    } else if (formMode === "edit" && selectedInvoice) {
      const res = await InvoiceService.updateInvoice(selectedInvoice.id, formData, actor);
      if (res.success) {
        success("Invoice updated", `Saved changes for ${selectedInvoice.invoice_number}.`);
        loadInvoices();
      } else {
        toastError("Failed to update invoice", res.error);
      }
    }
  };

  const handleMarkSent = async (inv: InvoiceWithDetails) => {
    const res = await InvoiceService.markInvoiceSent(inv.id, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice dispatched", `${inv.invoice_number} marked as Sent.`);
      loadInvoices();
    } else {
      toastError("Failed to update invoice", res.error);
    }
  };

  const handleCancelInvoice = async (inv: InvoiceWithDetails) => {
    const res = await InvoiceService.cancelInvoice(inv.id, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice cancelled", `${inv.invoice_number} has been voided.`);
      loadInvoices();
    } else {
      toastError("Failed to cancel invoice", res.error);
    }
  };

  const handleDeleteInvoice = async (inv: InvoiceWithDetails) => {
    const res = await InvoiceService.deleteInvoice(inv.id, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice deleted", `${inv.invoice_number} removed.`);
      loadInvoices();
    } else {
      toastError("Failed to delete invoice", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <Link
            href="/finance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Back to Finance Dashboard</span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Invoices Ledger
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Track client billing milestones, payment statuses, collection aging, and generate professional invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadInvoices()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {canManage && (
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenAdd}
              className="gap-2 shadow-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <InvoiceFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        type={typeFilter}
        onTypeChange={setTypeFilter}
        dueFilter={dueFilter}
        onDueFilterChange={setDueFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={invoices.length}
      />

      {/* Invoices Table */}
      <InvoiceTable
        invoices={invoices}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteInvoice}
        onMarkSent={handleMarkSent}
        onRecordPayment={(inv) => setPaymentInvoice(inv)}
        onCancel={handleCancelInvoice}
      />

      {/* Modals */}
      <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedInvoice}
        mode={formMode}
      />

      <RecordPaymentModal
        invoice={paymentInvoice}
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onSuccess={loadInvoices}
      />
    </div>
  );
}
