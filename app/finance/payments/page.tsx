"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentFilters } from "@/components/payments/payment-filters";
import { PaymentTable } from "@/components/payments/payment-table";
import { PaymentForm } from "@/components/payments/payment-form";
import { PaymentService } from "@/services/payment.service";
import {
  PaymentMethod,
  PaymentSortOption,
  PaymentStats as IPaymentStats,
  PaymentStatus,
  PaymentWithDetails,
} from "@/types/payment";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function PaymentsLedgerPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [stats, setStats] = useState<IPaymentStats>({
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    totalCollected: 0,
    thisMonthCollections: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "All">("All");
  const [sortBy, setSortBy] = useState<PaymentSortOption>("recently_paid");

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        PaymentService.getPayments({
          search,
          status: statusFilter,
          method: methodFilter,
          sortBy,
        }),
        PaymentService.getStats(),
      ]);

      setPayments(data);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load payments:", err);
      toastError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, methodFilter, sortBy, toastError]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Real-time synchronization for payments and invoices
  useRealtimeTables({
    tables: ["payments", "invoices"],
    onChange: () => {
      loadPayments();
    },
    debounceMs: 300,
  });

  const handleDelete = async (payment: PaymentWithDetails) => {
    const res = await PaymentService.deletePayment(payment.id, user?.fullName || "Ranjith");
    if (res.success) {
      success("Payment record deleted", "Balances have been recalculated.");
      loadPayments();
    } else {
      toastError("Failed to delete payment", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header */}
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
            Payments & Collections Ledger
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Realized cash inflows, bank settlements, wire transactions, and verified receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadPayments()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {canManage && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="gap-2 shadow-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Realized Inflows"
          value={formatCurrency(stats.totalCollected, "INR")}
          subtitle="Lifetime client collections"
          icon={TrendingUp}
          variant="emerald"
        />

        <StatsCard
          title="Current Month Collections"
          value={formatCurrency(stats.thisMonthCollections, "INR")}
          subtitle="Realized this cycle"
          icon={CreditCard}
          variant="blue"
        />

        <StatsCard
          title="Cleared Transactions"
          value={stats.completedPayments.toString()}
          subtitle="Verified payment records"
          icon={CreditCard}
          variant="violet"
        />

        <StatsCard
          title="Pending / Processing"
          value={stats.pendingPayments.toString()}
          subtitle="Unconfirmed transactions"
          icon={CreditCard}
          variant={stats.pendingPayments > 0 ? "amber" : "emerald"}
        />
      </div>

      {/* 3. Filters */}
      <PaymentFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        method={methodFilter}
        onMethodChange={setMethodFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={payments.length}
      />

      {/* 4. Table */}
      <PaymentTable
        payments={payments}
        loading={loading}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <PaymentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadPayments}
      />
    </div>
  );
}
