"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFollowUpCard } from "@/components/leads/lead-followup-card";
import { LeadFollowUpForm } from "@/components/leads/lead-followup-form";
import { LeadService } from "@/services/lead.service";
import { LeadFollowUpFormData, LeadFollowUpWithDetails } from "@/types/lead-followup";
import { LeadWithDetails } from "@/types/lead";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function FollowUpsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [followUps, setFollowUps] = useState<LeadFollowUpWithDetails[]>([]);
  const [leads, setLeads] = useState<LeadWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "overdue" | "due_today" | "upcoming" | "completed">("all");
  const [loading, setLoading] = useState(true);

  // New follow-up modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allFups, allLeads] = await Promise.all([
        LeadService.getLeadFollowUps(),
        LeadService.getLeads(),
      ]);
      setFollowUps(allFups);
      setLeads(allLeads);
      if (allLeads.length > 0 && !selectedLeadId) {
        setSelectedLeadId(allLeads[0].id);
      }
    } catch (err) {
      console.error("Failed to load follow-ups:", err);
      toastError("Error loading follow-ups");
    } finally {
      setLoading(false);
    }
  }, [toastError, selectedLeadId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleComplete = async (fupId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.completeFollowUp(fupId, actorName);
    if (res.success) {
      success("Follow-up Completed", "Marked as done.");
      loadData();
    } else {
      toastError("Failed to complete", res.error);
    }
  };

  const handleReschedule = async (fupId: string, newDate: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.rescheduleFollowUp(fupId, newDate, actorName);
    if (res.success) {
      success("Follow-up Rescheduled", "Date updated.");
      loadData();
    } else {
      toastError("Failed to reschedule", res.error);
    }
  };

  const handleCreateFollowUp = async (formData: LeadFollowUpFormData) => {
    if (!selectedLeadId) return;
    const actorName = user?.fullName || "Ranjith";
    const res = await LeadService.createFollowUp(selectedLeadId, formData, actorName);
    if (res.success) {
      success("Follow-up Scheduled", "Added to schedule.");
      loadData();
    } else {
      toastError("Failed to schedule", res.error);
    }
  };

  // Metrics
  const overdueList = followUps.filter((f) => f.is_overdue);
  const dueTodayList = followUps.filter((f) => f.is_due_today);
  const upcomingList = followUps.filter((f) => f.status === "Pending" && !f.is_overdue && !f.is_due_today);
  const completedList = followUps.filter((f) => f.status === "Completed");

  const displayedList =
    activeTab === "overdue"
      ? overdueList
      : activeTab === "due_today"
      ? dueTodayList
      : activeTab === "upcoming"
      ? upcomingList
      : activeTab === "completed"
      ? completedList
      : followUps;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="space-y-1">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leads Pipeline</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Sales Follow-ups & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Never lose momentum on a warm deal. Manage discovery calls, proposal reviews, and client check-ins.
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

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="gap-2 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-Up</span>
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Overdue Reminders"
          value={overdueList.length.toString()}
          subtitle={overdueList.length > 0 ? "Requires urgent attention" : "All clean"}
          icon={Clock}
          variant={overdueList.length > 0 ? "violet" : "emerald"}
        />

        <StatsCard
          title="Due Today"
          value={dueTodayList.length.toString()}
          subtitle="Scheduled client outreach"
          icon={Calendar}
          variant="amber"
        />

        <StatsCard
          title="Upcoming Pipeline"
          value={upcomingList.length.toString()}
          subtitle="Calls in next 7-14 days"
          icon={Calendar}
          variant="blue"
        />

        <StatsCard
          title="Completed Calls"
          value={completedList.length.toString()}
          subtitle="Logged & finished"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
        {[
          { id: "all", label: "All Reminders", count: followUps.length },
          { id: "overdue", label: "Overdue", count: overdueList.length },
          { id: "due_today", label: "Due Today", count: dueTodayList.length },
          { id: "upcoming", label: "Upcoming", count: upcomingList.length },
          { id: "completed", label: "Completed", count: completedList.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Follow-up Cards Grid */}
      {displayedList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900 font-display">No follow-ups found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No scheduled follow-up actions match this view.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedList.map((fup) => (
            <LeadFollowUpCard
              key={fup.id}
              followUp={fup}
              onComplete={handleComplete}
              onReschedule={handleReschedule}
            />
          ))}
        </div>
      )}

      {/* Modal with Lead Picker */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in font-sans">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display">Schedule Follow-up</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Select Prospect / Deal</label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.full_name} ({l.company_name || l.service_interest})
                  </option>
                ))}
              </select>
            </div>

            <LeadFollowUpForm
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleCreateFollowUp}
            />
          </div>
        </div>
      )}
    </div>
  );
}
