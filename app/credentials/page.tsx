"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Shield,
  FolderKanban,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CredentialCard } from "@/components/credentials/credential-card";
import { CredentialFormModal } from "@/components/credentials/credential-form-modal";
import { CredentialDeleteModal } from "@/components/credentials/credential-delete-modal";
import { CredentialActivityModal } from "@/components/credentials/credential-activity-modal";
import { CredentialService } from "@/services/credential.service";
import { ProjectService } from "@/services/project.service";
import {
  ProjectCredential,
  CredentialFormData,
  CredentialType,
  CREDENTIAL_TYPES_LIST,
} from "@/types/credential";
import { ProjectWithDetails } from "@/types/project";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function CredentialsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [credentials, setCredentials] = useState<ProjectCredential[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CredentialType | "All">("All");
  const [projectFilter, setProjectFilter] = useState<string>("All");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedCredential, setSelectedCredential] = useState<ProjectCredential | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<ProjectCredential | null>(null);

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [credentialForActivity, setCredentialForActivity] = useState<ProjectCredential | null>(null);

  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedCredentials, fetchedProjects] = await Promise.all([
        CredentialService.getCredentials({
          search,
          credentialType: typeFilter,
          projectId: projectFilter !== "All" ? projectFilter : undefined,
        }),
        ProjectService.getProjects(),
      ]);

      setCredentials(fetchedCredentials);
      setProjectsList(fetchedProjects);
    } catch (err) {
      console.error("Failed to load credentials:", err);
      toastError("Failed to fetch credentials");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, projectFilter, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedCredential(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (credential: ProjectCredential) => {
    setSelectedCredential(credential);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (credential: ProjectCredential) => {
    setCredentialToDelete(credential);
    setIsDeleteOpen(true);
  };

  const handleOpenActivityModal = (credential: ProjectCredential) => {
    setCredentialForActivity(credential);
    setIsActivityOpen(true);
  };

  const handleFormSubmit = async (formData: CredentialFormData) => {
    const actorName = user?.fullName || "Team Member";

    if (formMode === "add") {
      const res = await CredentialService.createCredential(formData, actorName);
      if (res.success) {
        success("Credential Created", `${formData.name} stored in vault.`);
        loadData();
      } else {
        toastError("Failed to save credential", res.error);
      }
    } else if (selectedCredential) {
      const res = await CredentialService.updateCredential(
        selectedCredential.id,
        formData,
        actorName
      );
      if (res.success) {
        success("Credential Updated", `${formData.name} updated.`);
        loadData();
      } else {
        toastError("Failed to update credential", res.error);
      }
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    const actorName = user?.fullName || "Team Member";
    const res = await CredentialService.deleteCredential(id, actorName);
    if (res.success) {
      success("Credential Deleted", "Secret removed from vault.");
      loadData();
    } else {
      toastError("Failed to delete credential", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Encrypted Credentials Vault</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Project Credentials
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Securely store and retrieve staging passwords, database connections, API keys, hosting panels, and deployment tokens.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {canManage && (
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenAddModal}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Credential</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-[#E6EAF2] bg-white text-xs">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by credential name, project, url, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="h-9"
          />
        </div>

        {/* Type & Project Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#E6EAF2] bg-white px-3 text-xs text-slate-700 focus:outline-none focus:border-[#2451EB] focus:ring-2 focus:ring-[#2451EB]/20 font-medium"
          >
            <option value="All">All Projects</option>
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_name} ({p.project_code})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="h-9 rounded-xl border border-[#E6EAF2] bg-white px-3 text-xs text-slate-700 focus:outline-none focus:border-[#2451EB] focus:ring-2 focus:ring-[#2451EB]/20 font-medium"
          >
            <option value="All">All Types</option>
            {CREDENTIAL_TYPES_LIST.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Credentials Grid */}
      {loading ? (
        <div className="rounded-xl border border-[#E6EAF2] bg-white p-12 text-center text-xs text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2451EB]" />
          <span>Accessing encrypted vault...</span>
        </div>
      ) : credentials.length === 0 ? (
        <div className="rounded-xl border border-[#E6EAF2] bg-white p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2451EB] flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 font-display">
            No Credentials Found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || typeFilter !== "All" || projectFilter !== "All"
              ? "No credentials match your active search filters."
              : "No secrets have been added to the vault yet."}
          </p>
          {canManage && !search && typeFilter === "All" && projectFilter === "All" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenAddModal}
              className="mt-4 gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Credential</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {credentials.map((cred) => (
            <CredentialCard
              key={cred.id}
              credential={cred}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onViewActivity={handleOpenActivityModal}
            />
          ))}
        </div>
      )}

      {/* 4. Modals */}
      <CredentialFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        projectsList={projectsList}
        initialData={selectedCredential}
        mode={formMode}
      />

      <CredentialDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        credential={credentialToDelete}
        onConfirm={handleDeleteConfirm}
      />

      <CredentialActivityModal
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        credential={credentialForActivity}
      />
    </div>
  );
}
