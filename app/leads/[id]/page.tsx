"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Trophy,
  Plus,
} from "lucide-react";
import {
  PIPELINE_STAGES,
  LeadStatus,
  LeadWithDetails,
  LeadFormData,
} from "@/types/lead";
import { LeadActivity, LeadActivityFormData } from "@/types/lead-activity";
import { LeadFollowUpWithDetails, LeadFollowUpFormData } from "@/types/lead-followup";
import { ClientFormData } from "@/types/client";
import { ProjectFormData } from "@/types/project";
import { LeadService } from "@/services/lead.service";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { LeadPriorityBadge } from "@/components/leads/lead-priority-badge";
import { LeadActivityTimeline } from "@/components/leads/lead-activity-timeline";
import { LeadActivityForm } from "@/components/leads/lead-activity-form";
import { LeadFollowUpCard } from "@/components/leads/lead-followup-card";
import { LeadFollowUpForm } from "@/components/leads/lead-followup-form";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadConvertModal } from "@/components/leads/lead-convert-modal";
import { LeadDeleteModal } from "@/components/leads/lead-delete-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const id = params?.id as string;

  const [lead, setLead] = useState<LeadWithDetails | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUpWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isFollowUpFormOpen, setIsFollowUpFormOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const loadLeadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [fetchedLead, fetchedActs, fetchedFups] = await Promise.all([
        LeadService.getLeadById(id),
        LeadService.getLeadActivities(id),
        LeadService.getLeadFollowUps({ leadId: id }),
      ]);

      if (!fetchedLead) {
        toastError("Lead Not Found", "The requested sales prospect does not exist.");
        router.push("/leads");
        return;
      }

      setLead(fetchedLead);
      setActivities(fetchedActs);
      setFollowUps(fetchedFups);
    } catch (err) {
      console.error("Error loading lead details:", err);
      toastError("Failed to fetch lead profile");
    } finally {
      setLoading(false);
    }
  }, [id, router, toastError]);

  useEffect(() => {
    loadLeadData();
  }, [loadLeadData]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.updateLeadStatus(lead.id, newStatus, actorName);
    if (res.success) {
      success("Stage Updated", `Moved deal to ${newStatus}`);
      loadLeadData();
    } else {
      toastError("Failed to update pipeline stage", res.error);
    }
  };

  const handleUpdateLead = async (formData: LeadFormData) => {
    if (!lead) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.updateLead(lead.id, formData, actorName);
    if (res.success) {
      success("Lead Updated", "Prospect details updated.");
      loadLeadData();
    } else {
      toastError("Failed to update lead", res.error);
    }
  };

  const handleAddActivity = async (formData: LeadActivityFormData) => {
    if (!lead) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.createLeadActivity(lead.id, formData, actorName);
    if (res.success) {
      success("Activity Logged", "Saved to communications timeline.");
      loadLeadData();
    } else {
      toastError("Failed to log activity", res.error);
    }
  };

  const handleAddFollowUp = async (formData: LeadFollowUpFormData) => {
    if (!lead) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.createFollowUp(lead.id, formData, actorName);
    if (res.success) {
      success("Follow-up Scheduled", "Reminder created.");
      loadLeadData();
    } else {
      toastError("Failed to schedule follow-up", res.error);
    }
  };

  const handleCompleteFollowUp = async (fupId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.completeFollowUp(fupId, actorName);
    if (res.success) {
      success("Follow-up Completed", "Marked action as done.");
      loadLeadData();
    }
  };

  const handleRescheduleFollowUp = async (fupId: string, newDate: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.rescheduleFollowUp(fupId, newDate, actorName);
    if (res.success) {
      success("Follow-up Rescheduled", `Moved date to ${newDate}`);
      loadLeadData();
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
      success("Lead Converted", "Client & Project created.");
      loadLeadData();
    }
    return res;
  };

  const handleDelete = async (leadId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.deleteLead(leadId, actorName);
    if (res.success) {
      success("Lead Deleted", "Removed.");
      router.push("/leads");
    } else {
      toastError("Failed to delete lead", res.error);
    }
  };

  if (loading || !lead) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse font-sans">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200" />
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* 1. Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#2451EB]" />
          <span>Back to Sales Pipeline</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && lead.lead_status !== "Won" && lead.lead_status !== "Lost" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsConvertOpen(true)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Convert to Client & Project</span>
            </Button>
          )}

          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#5B6472]" />
              <span>Edit Lead</span>
            </Button>
          )}

          {canManage && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#E6EAF2] bg-white p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={lead.full_name} size="lg" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
                  {lead.full_name}
                </h1>
                <span className="font-mono text-xs font-semibold text-[#2451EB]">
                  {lead.lead_code}
                </span>
                <LeadStatusBadge status={lead.lead_status} />
                <LeadPriorityBadge priority={lead.priority} />
              </div>

              <p className="text-xs text-[#5B6472] font-medium">
                {lead.company_name || "Individual Prospect"} • {lead.service_interest} (Source: {lead.lead_source})
              </p>
            </div>
          </div>

          <div className="text-left md:text-right shrink-0 font-sans">
            <span className="text-xs text-[#8A93A3] font-semibold uppercase block">Estimated Deal Value</span>
            <span className="text-2xl sm:text-3xl font-semibold text-[#0F172A] font-mono font-tabular">
              {lead.estimated_value ? formatCurrency(lead.estimated_value, "INR") : "Undetermined"}
            </span>
            {lead.probability !== undefined && (
              <span className="text-xs font-semibold text-[#2451EB] block mt-0.5 font-mono font-tabular">
                {lead.probability}% Win Probability
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Pipeline Stage Selector Bar */}
      <div className="p-4 rounded-xl border border-[#E6EAF2] bg-white space-y-2">
        <span className="text-xs font-semibold text-[#0F172A] block">
          Update Pipeline Stage
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {PIPELINE_STAGES.map((st) => {
            const isSelected = lead.lead_status === st;
            return (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all scalemorphic-button ${
                  isSelected
                    ? "bg-[#2451EB] text-white font-semibold"
                    : "bg-[#F7F9FC] text-[#5B6472] hover:bg-slate-100 hover:text-[#0F172A] border border-[#E6EAF2]"
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact info & Follow-ups */}
        <div className="space-y-6">
          {/* Contact Details Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
              Prospect Contact Profile
            </h3>

            <div className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <a href={`mailto:${lead.email}`} className="hover:underline truncate font-mono font-medium">
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center gap-2.5 text-slate-700 font-mono font-medium">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lead.phone}</span>
                </div>
              )}

              {lead.website && (
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                  <a href={lead.website} target="_blank" rel="noreferrer" className="hover:underline truncate font-medium">
                    {lead.website}
                  </a>
                </div>
              )}

              {lead.location && (
                <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{lead.location}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Account Owner:</span>
                <span className="font-bold text-slate-900 font-display">
                  {lead.assigned_member_name || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Scheduled Follow-ups */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase font-display tracking-wider">
                Follow-ups & Outreach ({followUps.length})
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFollowUpFormOpen(true)}
                className="gap-1 text-[11px] font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </Button>
            </div>

            <div className="space-y-3">
              {followUps.map((fup) => (
                <LeadFollowUpCard
                  key={fup.id}
                  followUp={fup}
                  onComplete={handleCompleteFollowUp}
                  onReschedule={handleRescheduleFollowUp}
                />
              ))}

              {followUps.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No pending follow-ups scheduled.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Requirements & Activity Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Scope / Requirements Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 font-display pb-2 border-b border-slate-100">
              Project Requirements & Scope Notes
            </h3>

            {lead.requirements ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700">
                {lead.requirements}
              </div>
            ) : (
              <p className="text-slate-400 italic">No scope summary captured yet.</p>
            )}

            {lead.notes && (
              <div className="space-y-1 pt-2">
                <span className="font-bold text-slate-700 font-display">Internal Sales Notes:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Communication History & Logs
              </h3>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsActivityFormOpen(true)}
                className="gap-1.5 shadow-sm text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Activity</span>
              </Button>
            </div>

            <LeadActivityTimeline activities={activities} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <LeadForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateLead}
        initialData={lead}
        mode="edit"
      />

      <LeadActivityForm
        isOpen={isActivityFormOpen}
        onClose={() => setIsActivityFormOpen(false)}
        onSubmit={handleAddActivity}
        leadName={lead.full_name}
      />

      <LeadFollowUpForm
        isOpen={isFollowUpFormOpen}
        onClose={() => setIsFollowUpFormOpen(false)}
        onSubmit={handleAddFollowUp}
        leadName={lead.full_name}
      />

      <LeadConvertModal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        lead={lead}
        onConvert={handleConvertLead}
      />

      <LeadDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        lead={lead}
        onConfirm={handleDelete}
      />
    </div>
  );
}
