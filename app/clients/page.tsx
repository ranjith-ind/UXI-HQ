"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Sparkles, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientStats } from "@/components/clients/client-stats";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientTable } from "@/components/clients/client-table";
import { ClientForm } from "@/components/clients/client-form";
import { ClientDeleteModal } from "@/components/clients/client-delete-modal";
import { ClientEmptyState } from "@/components/clients/client-empty-state";
import { ClientService } from "@/services/client.service";
import {
  ClientFormData,
  ClientSortOption,
  ClientStats as IClientStats,
  ClientStatus,
  ClientWithDetails,
} from "@/types/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function ClientsPage() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [stats, setStats] = useState<IClientStats>({
    totalClients: 0,
    activeClients: 0,
    leads: 0,
    inactiveClients: 0,
    completedClients: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "All">("All");
  const [sortBy, setSortBy] = useState<ClientSortOption>("recently_added");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientWithDetails | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedClients, fetchedStats] = await Promise.all([
        ClientService.getClients({
          search,
          status: statusFilter,
          sortBy,
        }),
        ClientService.getStats(),
      ]);

      setClients(fetchedClients);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to load client records:", err);
      toastError("Failed to fetch clients", "Could not connect to database.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time synchronization for clients table
  useRealtimeTables({
    tables: ["clients"],
    onChange: () => {
      loadData();
    },
    debounceMs: 300,
  });

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedClient(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (client: ClientWithDetails) => {
    setSelectedClient(client);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (client: ClientWithDetails) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData: ClientFormData) => {
    const actorName = user?.fullName || "Ranjith";

    if (formMode === "add") {
      const res = await ClientService.createClient(formData, actorName);
      if (res.success) {
        success("Client added successfully", `${formData.full_name} has been added to UXI HQ.`);
        loadData();
      } else {
        toastError("Error adding client", res.error);
      }
    } else if (formMode === "edit" && selectedClient) {
      const res = await ClientService.updateClient(selectedClient.id, formData, actorName);
      if (res.success) {
        success("Client updated successfully", `Updated details for ${formData.full_name}.`);
        loadData();
      } else {
        toastError("Error updating client", res.error);
      }
    }
  };

  const handleDeleteConfirm = async (clientId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ClientService.deleteClient(clientId, actorName);
    if (res.success) {
      success("Client deleted", "Client record has been safely removed.");
      loadData();
    } else {
      toastError("Failed to delete client", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Accounts & Client Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Client Directory
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Manage all company relationships, primary points of contact, project contracts, and billing settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              const diag = await ClientService.checkAuthStatus();
              if (diag) {
                info(
                  "Auth Diagnostic",
                  `UID: ${diag.auth_uid || "null"} | Role: ${diag.profile_role || "none"} | Admin: ${diag.is_admin_or_manager} | Exists: ${diag.profile_exists}`
                );
              } else {
                toastError("Diagnostic Info", "check_user_auth_status RPC not yet executed or unauthenticated.");
              }
            }}
            className="gap-1.5 text-xs font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Check Auth</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleOpenAddModal}
            className="gap-2 shadow-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Client</span>
          </Button>
        </div>
      </div>

      {/* 2. Client Metrics Strip */}
      <ClientStats stats={stats} loading={loading} />

      {/* 3. Search & Segmented Status Filters */}
      <ClientFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={clients.length}
      />

      {/* 4. Table or Empty State */}
      {clients.length > 0 ? (
        <ClientTable
          clients={clients}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          loading={loading}
        />
      ) : (
        <ClientEmptyState
          isFiltered={search.length > 0 || statusFilter !== "All"}
          onAddClient={handleOpenAddModal}
          onResetFilters={() => {
            setSearch("");
            setStatusFilter("All");
          }}
        />
      )}

      {/* 5. Modals */}
      <ClientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedClient}
        mode={formMode}
      />

      <ClientDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        client={clientToDelete}
      />
    </div>
  );
}
