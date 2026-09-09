"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadStatsCards } from "@/components/leads/lead-stats";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadKanban } from "@/components/leads/lead-kanban";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadFollowUpForm } from "@/components/leads/lead-followup-form";
import { LeadConvertModal } from "@/components/leads/lead-convert-modal";
import { LeadDeleteModal } from "@/components/leads/lead-delete-modal";
import { LeadService } from "@/services/lead.service";
import { TeamService } from "@/services/team.service";
import {
  LeadFormData,
  LeadQuickFilter,
  LeadSortOption,
  LeadStats,
  LeadStatus,
  LeadWithDetails,
} from "@/types/lead";
import { LeadFollowUpFormData } from "@/types/lead-followup";
import { ClientFormData } from "@/types/client";
import { ProjectFormData } from "@/types/project";
import { TeamMember } from "@/types/team";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function LeadsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const canManage = user?.role === "Admin" || user?.role === "Manager";

  // Data state
  const [leads, setLeads] = useState<LeadWithDetails[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "All">("All");
  const [source, setSource] = useState<string>("all");
  const [service, setService] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [assignedTo, setAssignedTo] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<LeadQuickFilter>("all");
  const [sortBy, setSortBy] = useState<LeadSortOption>("recently_created");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFollowUpFormOpen, setIsFollowUpFormOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<LeadWithDetails | null>(null);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<LeadWithDetails | null>(null);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState<LeadWithDetails | null>(null);
  const [selectedLeadForDelete, setSelectedLeadForDelete] = useState<LeadWithDetails | null>(null);
  const [defaultStageForAdd, setDefaultStageForAdd] = useState<LeadStatus>("New");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedLeads, fetchedStats, fetchedTeam] = await Promise.all([
        LeadService.getLeads({
          search,
          status,
          source,
          service,
          priority,
          assignedTo: assignedTo === "all" ? undefined : assignedTo,
          quickFilter,
          sortBy,
        }),
        LeadService.getLeadStats(),
        TeamService.getTeamMembers(),
      ]);

      setLeads(fetchedLeads);
      setStats(fetchedStats);
      setTeamMembers(fetchedTeam);
    } catch (err) {
      console.error("Failed to load leads data:", err);
      toastError("Error loading leads");
    } finally {
      setLoading(false);
    }
  }, [search, status, source, service, priority, assignedTo, quickFilter, sortBy, toastError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for leads, activities, and followups
  useRealtimeTables({
    tables: ["leads", "lead_activities", "lead_followups"],
    onChange: loadData,
  });

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.updateLeadStatus(leadId, newStatus, actorName);
    if (res.success) {
      success("Lead Stage Updated", `Moved deal to ${newStatus}`);
      loadData();
    } else {
      toastError("Failed to update status", res.error);
    }
  };

  const handleTableStatusChange = async (lead: LeadWithDetails, newStatus: LeadStatus) => {
    await handleStatusChange(lead.id, newStatus);
  };

  const handleCreateOrUpdateLead = async (formData: LeadFormData) => {
    const actorName = user?.fullName || "Ranjith";
    if (selectedLeadForEdit) {
      const res = await LeadService.updateLead(selectedLeadForEdit.id, formData, actorName);
      if (res.success) {
        success("Lead Updated", `Updated ${formData.full_name}`);
        loadData();
      } else {
        toastError("Failed to update lead", res.error);
      }
    } else {
      const res = await LeadService.createLead(formData, actorName);
      if (res.success) {
        success("Sales Lead Created", `Registered ${formData.full_name}`);
        loadData();
      } else {
        toastError("Failed to create lead", res.error);
      }
    }
  };

  const handleScheduleFollowUp = async (formData: LeadFollowUpFormData) => {
    if (!selectedLeadForFollowUp) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.createFollowUp(selectedLeadForFollowUp.id, formData, actorName);
    if (res.success) {
      success("Follow-up Scheduled", `Reminder logged for ${selectedLeadForFollowUp.full_name}`);
      loadData();
    } else {
      toastError("Failed to schedule follow-up", res.error);
    }
  };

  const handleConvertLead = async (
    leadId: string,
    clientData: ClientFormData,
    projectData?: ProjectFormData
  ) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.convertLead(leadId, clientData, projectData, actorName);
    if (res.success) {
      success("Lead Converted", "Client and project records created.");
      loadData();
    }
    return res;
  };

  const handleDeleteLead = async (leadId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.deleteLead(leadId, actorName);
    if (res.success) {
      success("Lead Deleted", "Removed from CRM database.");
      loadData();
    } else {
      toastError("Failed to delete lead", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Sales CRM & Deal Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Leads & Sales Pipeline
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Convert prospective clients, track deal velocity, manage follow-up cadences, and forecast agency revenue.
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

          <Link href="/leads/follow-ups">
            <Button variant="secondary" size="sm" className="gap-2 font-semibold">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Follow-ups</span>
            </Button>
          </Link>

          <Link href="/leads/analytics">
            <Button variant="secondary" size="sm" className="gap-2 font-semibold">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>CRM Analytics</span>
            </Button>
          </Link>

          {canManage && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSelectedLeadForEdit(null);
                setDefaultStageForAdd("New");
                setIsFormOpen(true);
              }}
              className="gap-2 shadow-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics */}
      {stats && <LeadStatsCards stats={stats} loading={loading} />}

      {/* 3. Filter Bar */}
      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        source={source}
        onSourceChange={setSource}
        service={service}
        onServiceChange={setService}
        priority={priority}
        onPriorityChange={setPriority}
        assignedTo={assignedTo}
        onAssignedToChange={setAssignedTo}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        teamMembers={teamMembers}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 4. Main View: Table or Kanban */}
      {viewMode === "table" ? (
        <LeadTable
          leads={leads}
          onEdit={(lead) => {
            setSelectedLeadForEdit(lead);
            setIsFormOpen(true);
          }}
          onDelete={(lead) => setSelectedLeadForDelete(lead)}
          onAddFollowUp={(lead) => {
            setSelectedLeadForFollowUp(lead);
            setIsFollowUpFormOpen(true);
          }}
          onConvert={(lead) => {
            setSelectedLeadForConvert(lead);
            setIsConvertOpen(true);
          }}
          onStatusChange={handleTableStatusChange}
          canManage={canManage}
        />
      ) : (
        <LeadKanban
          leads={leads}
          onStatusChange={handleStatusChange}
          onConvert={(lead) => {
            setSelectedLeadForConvert(lead);
            setIsConvertOpen(true);
          }}
          onAddLead={(stage) => {
            setSelectedLeadForEdit(null);
            setDefaultStageForAdd(stage || "New");
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <LeadForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedLeadForEdit(null);
        }}
        onSubmit={handleCreateOrUpdateLead}
        initialData={selectedLeadForEdit}
        mode={selectedLeadForEdit ? "edit" : "add"}
        defaultStage={defaultStageForAdd}
      />

      <LeadFollowUpForm
        isOpen={isFollowUpFormOpen}
        onClose={() => {
          setIsFollowUpFormOpen(false);
          setSelectedLeadForFollowUp(null);
        }}
        onSubmit={handleScheduleFollowUp}
        leadName={selectedLeadForFollowUp?.full_name}
      />

      <LeadConvertModal
        isOpen={isConvertOpen}
        onClose={() => {
          setIsConvertOpen(false);
          setSelectedLeadForConvert(null);
        }}
        lead={selectedLeadForConvert}
        onConvert={handleConvertLead}
      />

      <LeadDeleteModal
        isOpen={!!selectedLeadForDelete}
        onClose={() => setSelectedLeadForDelete(null)}
        lead={selectedLeadForDelete}
        onConfirm={handleDeleteLead}
      />
    </div>
  );
}
