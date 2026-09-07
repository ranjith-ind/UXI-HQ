"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  Plus,
  CreditCard,
  FileText,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Building,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinanceStats } from "@/components/finance/finance-stats";
import { FinanceRevenueChart } from "@/components/finance/revenue-chart";
import { OutstandingInvoices } from "@/components/finance/outstanding-invoices";
import { RecentPayments } from "@/components/finance/recent-payments";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
import { PaymentForm } from "@/components/payments/payment-form";
import { FinanceService } from "@/services/finance.service";
import { InvoiceService } from "@/services/invoice.service";
import { PaymentService } from "@/services/payment.service";
import {
  ClientRevenueItem,
  FinanceStats as IFinanceStats,
  ProjectRevenueItem,
} from "@/types/finance";
import { InvoiceFormData, InvoiceWithDetails } from "@/types/invoice";
import { PaymentWithDetails } from "@/types/payment";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function FinancePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [stats, setStats] = useState<IFinanceStats>({
    totalRevenue: 0,
    outstandingAmount: 0,
    overdueAmount: 0,
    thisMonthRevenue: 0,
    thisYearRevenue: 0,
    totalInvoices: 0,
    collectionRate: 100,
  });

  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [clientRevenue, setClientRevenue] = useState<ClientRevenueItem[]>([]);
  const [projectRevenue, setProjectRevenue] = useState<ProjectRevenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceWithDetails | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedStats, fetchedInvoices, fetchedPayments, fetchedClients, fetchedProjects] =
        await Promise.all([
          FinanceService.getFinanceStats(),
          InvoiceService.getInvoices(),
          PaymentService.getPayments(),
          FinanceService.getRevenueByClient(),
          FinanceService.getRevenueByProject(),
        ]);

      setStats(fetchedStats);
      setInvoices(fetchedInvoices);
      setPayments(fetchedPayments);
      setClientRevenue(fetchedClients);
      setProjectRevenue(fetchedProjects);
    } catch (err) {
      console.error("Failed to load finance data:", err);
      toastError("Failed to fetch financial data");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateInvoice = async (formData: InvoiceFormData) => {
    const res = await InvoiceService.createInvoice(formData, user?.fullName || "Ranjith");
    if (res.success) {
      success("Invoice created successfully", `${res.invoice?.invoice_number} has been generated.`);
      loadData();
    } else {
      toastError("Failed to create invoice", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>UXI Treasury & Inflow Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Finance & Invoice Management
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Realized cash inflows, client invoice schedules, payment reconciliation, and revenue analytics for UXI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/finance/profitability">
            <Button variant="secondary" size="sm" className="gap-2 font-semibold">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Profitability Matrix</span>
            </Button>
          </Link>

          {canManage && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPaymentFormOpen(true)}
                className="gap-2 font-semibold"
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Record Inflow</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsInvoiceFormOpen(true)}
                className="gap-2 shadow-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. KPI Metrics Strip */}
      <FinanceStats stats={stats} loading={loading} />

      {/* 3. Main Revenue Chart */}
      <FinanceRevenueChart />

      {/* 4. Two-Column Live Widgets: Outstanding Receivables & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OutstandingInvoices
          invoices={invoices}
          onRecordPayment={(inv) => setSelectedInvoiceForPayment(inv)}
        />
        <RecentPayments payments={payments} />
      </div>

      {/* 5. Revenue Breakdown by Client & Project */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Client */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">Revenue by Client</h3>
            </div>
            <Link
              href="/clients"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
            >
              <span>View Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {clientRevenue.slice(0, 5).map((cr) => (
              <div
                key={cr.clientId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate font-display">{cr.clientName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{cr.totalInvoices} invoices generated</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {formatCurrency(cr.totalPaid, "INR")}
                  </span>
                  {cr.pendingAmount > 0 && (
                    <span className="text-[10px] text-rose-700 font-bold font-mono">
                      {formatCurrency(cr.pendingAmount, "INR")} due
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Project */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">Revenue by Project</h3>
            </div>
            <Link
              href="/projects"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
            >
              <span>View Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {projectRevenue.slice(0, 5).map((pr) => (
              <div
                key={pr.projectId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate font-display">{pr.projectName}</p>
                  <p className="text-[10px] text-slate-500 font-mono font-medium">{pr.projectCode} • {pr.clientName}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {formatCurrency(pr.totalPaid, "INR")}
                  </span>
                  {pr.pendingAmount > 0 && (
                    <span className="text-[10px] text-rose-700 font-bold font-mono">
                      {formatCurrency(pr.pendingAmount, "INR")} due
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => setIsInvoiceFormOpen(false)}
        onSubmit={handleCreateInvoice}
      />

      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        onSuccess={loadData}
      />

      <RecordPaymentModal
        invoice={selectedInvoiceForPayment}
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        onSuccess={loadData}
      />
    </div>
  );
}
