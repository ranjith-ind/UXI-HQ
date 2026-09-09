"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  BarChart3,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamStats } from "@/components/team/team-stats";
import { TeamFilters } from "@/components/team/team-filters";
import { TeamMemberCard } from "@/components/team/team-member-card";
import { TeamMemberForm } from "@/components/team/team-member-form";
import { TeamDeleteModal } from "@/components/team/team-delete-modal";
import { TeamService } from "@/services/team.service";
import {
  AvailabilityStatus,
  EmploymentType,
  MemberStatus,
  TeamMemberFormData,
  TeamMemberWithDetails,
  TeamSortOption,
  TeamStats as ITeamStats,
  TeamWorkloadFilter,
  AVAILABILITY_STATUS_LIST,
} from "@/types/team";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { useRealtimeTables } from "@/hooks/use-realtime";

export default function TeamPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [members, setMembers] = useState<TeamMemberWithDetails[]>([]);
  const [stats, setStats] = useState<ITeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    availableNow: 0,
    totalActiveTasks: 0,
    overloadedMembers: 0,
    completedTasksThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "All">("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityStatus | "All">("All");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | "All">("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [workloadFilter, setWorkloadFilter] = useState<TeamWorkloadFilter>("all");
  const [sortBy, setSortBy] = useState<TeamSortOption>("name_asc");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithDetails | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMemberWithDetails | null>(null);

  // Quick availability modal state
  const [quickAvailabilityMember, setQuickAvailabilityMember] = useState<TeamMemberWithDetails | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedMembers, fetchedStats] = await Promise.all([
        TeamService.getTeamMembers({
          search,
          memberStatus: statusFilter,
          availability: availabilityFilter,
          employmentType: employmentTypeFilter,
          role: roleFilter,
          workload: workloadFilter,
          sortBy,
        }),
        TeamService.getStats(),
      ]);

      setMembers(fetchedMembers);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to load team:", err);
      toastError("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    availabilityFilter,
    employmentTypeFilter,
    roleFilter,
    workloadFilter,
    sortBy,
    toastError,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription for team members and workload
  useRealtimeTables({
    tables: ["team_members", "team_member_skills", "tasks", "task_assignees"],
    onChange: loadData,
  });

  const handleOpenAddMember = () => {
    setSelectedMember(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleOpenEditMember = (member: TeamMemberWithDetails) => {
    setSelectedMember(member);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleOpenDeleteMember = (member: TeamMemberWithDetails) => {
    setMemberToDelete(member);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData: TeamMemberFormData) => {
    const actorName = user?.fullName || "Ranjith";

    if (formMode === "add") {
      const res = await TeamService.createTeamMember(formData, actorName);
      if (res.success) {
        success("Team member added", `${formData.full_name} onboarded.`);
        loadData();
      } else {
        toastError("Failed to add member", res.error);
      }
    } else if (formMode === "edit" && selectedMember) {
      const res = await TeamService.updateTeamMember(selectedMember.id, formData, actorName);
      if (res.success) {
        success("Profile updated", "Member details saved.");
        loadData();
      } else {
        toastError("Failed to update profile", res.error);
      }
    }
  };

  const handleDeleteConfirm = async (memberId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TeamService.deleteTeamMember(memberId, actorName);
    if (res.success) {
      success("Member removed", "Team directory updated.");
      loadData();
    } else {
      toastError("Failed to remove member", res.error);
    }
  };

  const handleQuickAvailabilityChange = async (memberId: string, status: AvailabilityStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TeamService.updateAvailability(memberId, status, actorName);
    if (res.success) {
      success("Availability updated", `Changed to ${status}`);
      setQuickAvailabilityMember(null);
      loadData();
    } else {
      toastError("Failed to update status", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Hero Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>Workforce Capacity & Talent Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Team & Workforce Directory
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Monitor developer capacities, live availability, project load balancing, and engineering skills matrix across UXI.
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

          <Link href="/team/analytics">
            <Button variant="secondary" size="sm" className="gap-2 font-semibold">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Workforce Analytics</span>
            </Button>
          </Link>

          <Button
            variant="default"
            size="sm"
            onClick={handleOpenAddMember}
            className="gap-2 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Member</span>
          </Button>
        </div>
      </div>

      {/* 2. Team KPI Metrics Strip */}
      <TeamStats stats={stats} loading={loading} />

      {/* 3. Filters */}
      <TeamFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        availability={availabilityFilter}
        onAvailabilityChange={setAvailabilityFilter}
        employmentType={employmentTypeFilter}
        onEmploymentTypeChange={setEmploymentTypeFilter}
        role={roleFilter}
        onRoleChange={setRoleFilter}
        workload={workloadFilter}
        onWorkloadChange={setWorkloadFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={members.length}
      />

      {/* 4. Team Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleOpenEditMember}
              onDelete={handleOpenDeleteMember}
              onQuickAvailabilityChange={(m) => setQuickAvailabilityMember(m)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">No Team Members Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Try adjusting your search query, workload filters, or onboard new engineers.
          </p>
          <Button variant="default" size="sm" onClick={handleOpenAddMember} className="mt-5 font-semibold">
            Onboard First Member
          </Button>
        </div>
      )}

      {/* Quick Availability Modal */}
      {quickAvailabilityMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setQuickAvailabilityMember(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Update Status for {quickAvailabilityMember.full_name}
            </h3>
            <div className="space-y-2">
              {AVAILABILITY_STATUS_LIST.map((st) => (
                <button
                  key={st}
                  onClick={() => handleQuickAvailabilityChange(quickAvailabilityMember.id, st)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-colors ${
                    quickAvailabilityMember.availability_status === st
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <TeamMemberForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedMember}
        mode={formMode}
      />

      <TeamDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        member={memberToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
