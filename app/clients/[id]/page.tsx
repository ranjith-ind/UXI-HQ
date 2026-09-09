"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  FolderKanban,
  Edit2,
  Trash2,
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  Save,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { DetailLayout } from "@/components/ui/detail-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClientForm } from "@/components/clients/client-form";
import { ClientDeleteModal } from "@/components/clients/client-delete-modal";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { ClientService } from "@/services/client.service";
import { InvoiceService } from "@/services/invoice.service";
import { PaymentService } from "@/services/payment.service";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { LeadService } from "@/services/lead.service";
import { ClientFormData, ClientStatus, ClientWithDetails } from "@/types/client";
import { ProjectSummary } from "@/types";
import { InvoiceWithDetails } from "@/types/invoice";
import { PaymentWithDetails } from "@/types/payment";
import { ExpenseWithDetails } from "@/types/expense";
import { LeadWithDetails } from "@/types/lead";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [clientExpenses, setClientExpenses] = useState<ExpenseWithDetails[]>([]);
  const [originLead, setOriginLead] = useState<LeadWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  const loadClientData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedClient, fetchedProjects, fetchedInvoices, fetchedPayments, fetchedExpenses, allLeads] =
        await Promise.all([
          ClientService.getClientById(id),
          ClientService.getClientProjects(id),
          InvoiceService.getInvoices({ clientId: id }),
          PaymentService.getPayments({ clientId: id }),
          ExpenseService.getExpenses({ clientId: id }),
          LeadService.getLeads(),
        ]);

      if (fetchedClient) {
        setClient(fetchedClient);
        setNotes(fetchedClient.notes || "");

        const matchingLead = allLeads.find(
          (l) =>
            l.converted_client_id === id ||
            (l.company_name &&
              fetchedClient.company_name &&
              l.company_name.toLowerCase() === fetchedClient.company_name.toLowerCase()) ||
            (l.email &&
              fetchedClient.email &&
              l.email.toLowerCase() === fetchedClient.email.toLowerCase())
        );
        if (matchingLead) {
          setOriginLead(matchingLead);
        }
      }
      setProjects(fetchedProjects);
      setInvoices(fetchedInvoices);
      setPayments(fetchedPayments);
      setClientExpenses(fetchedExpenses);
    } catch (err) {
      console.error("Error loading client profile:", err);
      toastError("Failed to fetch client profile");
    } finally {
      setLoading(false);
    }
  }, [id, toastError]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // Realtime subscription for client, projects, invoices, payments, expenses, leads
  useRealtimeTables({
    tables: ["clients", "projects", "invoices", "payments", "expenses", "leads"],
    onChange: loadClientData,
  });

  const handleEditSubmit = async (formData: ClientFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ClientService.updateClient(id, formData, actorName);
    if (res.success) {
      success("Profile Updated", "Client profile details saved successfully.");
      loadClientData();
    } else {
      toastError("Failed to update profile", res.error);
    }
  };

  const handleDeleteConfirm = async (clientId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ClientService.deleteClient(clientId, actorName);
    if (res.success) {
      success("Client Deleted", "Client record has been removed.");
      router.push("/clients");
    } else {
      toastError("Failed to delete client", res.error);
    }
  };

  const handleSaveNotes = async () => {
    if (!client) return;
    setSavingNotes(true);
    try {
      const actorName = user?.fullName || "Ranjith";
      await ClientService.updateClient(id, { notes }, actorName);
      setNotesSaved(true);
      success("Notes updated successfully");
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      toastError("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading || !client) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const whatsappClean = client.whatsapp_number
    ? client.whatsapp_number.replace(/[^0-9]/g, "")
    : client.phone
    ? client.phone.replace(/[^0-9]/g, "")
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#2451EB]" />
          <span>Back to Clients Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5 font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Edit Profile</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="gap-1.5 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* 2. Client Profile Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#E6EAF2] bg-white p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar
              name={client.full_name}
              src={client.avatar_url}
              size="xl"
              className="ring-1 ring-[#2451EB]/20"
            />

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
                  {client.full_name}
                </h1>
                <StatusBadge status={client.client_status} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6472]">
                {client.company_name && (
                  <span className="font-semibold text-[#2451EB] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    {client.company_name}
                  </span>
                )}
                {originLead && (
                  <>
                    <span className="text-slate-300">•</span>
                    <Link
                      href={`/leads/${originLead.id}`}
                      className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Converted from {originLead.lead_code}</span>
                    </Link>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span className="text-[#5B6472]">
                  Acquired: <strong className="text-[#0F172A]">{client.source}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[#5B6472]">
                  Added: {formatDate(client.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {whatsappClean && (
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all scalemorphic-button"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Chat</span>
              </a>
            )}

            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E6EAF2] text-[#0F172A] hover:bg-[#F7F9FC] hover:text-[#2451EB] text-xs font-semibold transition-all scalemorphic-button"
              >
                <Mail className="w-3.5 h-3.5 text-[#2451EB]" />
                <span>Send Email</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Client Business Financial & Project KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Total Projects
            </span>
            <div className="p-2 rounded-md bg-[#F7F9FC] text-[#5B6472] border border-[#E6EAF2]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-[#0F172A] mt-2 font-tabular">
            {client.projects_count}
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">
            {client.active_projects_count} active development
          </p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Contract Value
            </span>
            <div className="p-2 rounded-md bg-[#F7F9FC] text-[#5B6472] border border-[#E6EAF2]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-[#0F172A] mt-2 font-tabular">
            {client.total_project_value > 0
              ? formatCurrency(client.total_project_value, "INR")
              : "₹0"}
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">Total recognized contract sum</p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Total Paid
            </span>
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-emerald-700 mt-2 font-tabular">
            {client.total_paid > 0
              ? formatCurrency(client.total_paid, "INR")
              : "₹0"}
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">Cleared milestone receipts</p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Pending Amount
            </span>
            <div className="p-2 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-amber-700 mt-2 font-tabular">
            {client.pending_amount > 0
              ? formatCurrency(client.pending_amount, "INR")
              : "₹0"}
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">Outstanding balance</p>
        </div>
      </div>

      {/* 4. Two-Column Layout: Left (Contact & Details) / Right (Projects & Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              <Building className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">Contact Information</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">Email Address</span>
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="text-slate-900 font-semibold hover:text-blue-600 truncate block">
                      {client.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <Phone className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">Phone Number</span>
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="text-slate-900 font-semibold hover:text-cyan-600 font-mono block">
                      {client.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">WhatsApp Direct</span>
                  {client.whatsapp_number ? (
                    <span className="text-slate-900 font-semibold font-mono block">{client.whatsapp_number}</span>
                  ) : (
                    <span className="text-slate-400 font-medium">Not provided</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">Location</span>
                  <span className="text-slate-900 font-semibold block">{client.location || "Not specified"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <Globe className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">Website</span>
                  {client.website ? (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projects, Invoices & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Client Projects ({projects.length})</h3>
              </div>

              <Link href="/projects">
                <Button variant="secondary" size="sm" className="font-semibold text-xs">
                  All Projects
                </Button>
              </Link>
            </div>

            {projects.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {projects.map((proj) => (
                  <div key={proj.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${proj.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 text-xs block truncate"
                      >
                        {proj.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">{proj.code}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={proj.status} size="sm" />
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {formatCurrency(proj.budget, "INR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No projects assigned yet.</p>
            )}
          </div>

          {/* Internal Notes */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Strategic Client Notes</h3>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleSaveNotes}
                isLoading={savingNotes}
                className="font-semibold text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>{notesSaved ? "Saved!" : "Save Notes"}</span>
              </Button>
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about client preferences, special billing arrangements, technical requirements..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      <ClientForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={client}
        mode="edit"
      />

      {/* Delete Client Modal */}
      <ClientDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        client={client}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
