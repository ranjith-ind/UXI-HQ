"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  FolderKanban,
  CheckSquare,
  Flame,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { DetailLayout } from "@/components/ui/detail-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { TeamAvailabilityBadge } from "@/components/team/team-availability-badge";
import { TeamStatusBadge } from "@/components/team/team-status-badge";
import { TeamWorkloadBadge } from "@/components/team/team-workload-badge";
import { TeamWorkloadBar } from "@/components/team/team-workload-bar";
import { TeamSkillsMatrix } from "@/components/team/team-skills-matrix";
import { TeamMemberForm } from "@/components/team/team-member-form";
import { TeamDeleteModal } from "@/components/team/team-delete-modal";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectPriorityBadge } from "@/components/projects/project-priority-badge";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { TeamService } from "@/services/team.service";
import { ProjectService } from "@/services/project.service";
import { TaskService } from "@/services/task.service";
import { DashboardService } from "@/services/dashboard.service";
import {
  AvailabilityStatus,
  MemberStatus,
  TeamMemberFormData,
  TeamMemberWithDetails,
  AVAILABILITY_STATUS_LIST,
} from "@/types/team";
import { ProjectWithDetails } from "@/types/project";
import { TaskStatus, TaskWithDetails } from "@/types/task";
import { ActivityItem } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

export default function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [member, setMember] = useState<TeamMemberWithDetails | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<ProjectWithDetails[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<TaskWithDetails[]>([]);
  const [memberActivities, setMemberActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadMemberData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedMember, allProjects, allTasks, allActivities] = await Promise.all([
        TeamService.getTeamMemberById(id),
        ProjectService.getProjects({ isArchived: false }),
        TaskService.getTasks(),
        DashboardService.getRecentActivities(),
      ]);

      if (!fetchedMember) {
        toastError("Member not found", "The requested team member does not exist.");
        router.push("/team");
        return;
      }

      setMember(fetchedMember);

      // Filter projects assigned to this member
      const memberProjects = allProjects.filter((p: ProjectWithDetails) =>
        p.team_members.some(
          (tm: any) => tm.team_member_id === fetchedMember.id || tm.name === fetchedMember.full_name
        )
      );
      setAssignedProjects(memberProjects);

      // Filter tasks assigned to this member
      const memberTasks = allTasks.filter((t: TaskWithDetails) =>
        t.assignees.some(
          (a: any) => a.id === fetchedMember.id || a.name === fetchedMember.full_name
        )
      );
      setAssignedTasks(memberTasks);

      // Filter activities for this member
      const filteredActs = allActivities.filter(
        (a: ActivityItem) => a.actorName?.toLowerCase().includes(fetchedMember.full_name.toLowerCase())
      );
      setMemberActivities(filteredActs);
    } catch (err) {
      console.error("Failed to load member profile:", err);
      toastError("Error loading member profile");
    } finally {
      setLoading(false);
    }
  }, [id, router, toastError]);

  useEffect(() => {
    loadMemberData();
  }, [loadMemberData]);

  const handleEditSubmit = async (formData: TeamMemberFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TeamService.updateTeamMember(id, formData, actorName);
    if (res.success) {
      success("Profile updated successfully", `Saved changes for ${formData.full_name}.`);
      loadMemberData();
    } else {
      toastError("Failed to update profile", res.error);
    }
  };

  const handleAvailabilityChange = async (status: AvailabilityStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TeamService.updateAvailability(id, status, actorName);
    if (res.success) {
      success("Availability updated", `Status changed to ${status}.`);
      loadMemberData();
    } else {
      toastError("Failed to update availability", res.error);
    }
  };

  const handleDeleteConfirm = async (memberId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TeamService.deleteTeamMember(memberId, actorName);
    if (res.success) {
      success("Team member removed", "Redirecting to team directory...");
      router.push("/team");
    } else {
      toastError("Failed to delete member", res.error);
    }
  };

  if (loading || !member) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const remainingCapacityHours = Math.max(0, member.weekly_capacity_hours - member.estimated_workload_hours);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#2451EB]" />
          <span>Back to Team Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick Availability Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2451EB]/30 bg-[#EFF4FE] text-[#2451EB] hover:bg-blue-100 text-xs font-semibold transition-colors scalemorphic-button">
                <span>Availability: {member.availability_status}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-[#8A93A3] uppercase tracking-wider">
              Change Availability
            </div>
            {AVAILABILITY_STATUS_LIST.map((a) => (
              <DropdownItem
                key={a}
                onClick={() => handleAvailabilityChange(a)}
                className={member.availability_status === a ? "bg-[#EFF4FE] text-[#2451EB] font-semibold" : ""}
              >
                <span>{a}</span>
              </DropdownItem>
            ))}
          </Dropdown>

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
            <span>Remove</span>
          </Button>
        </div>
      </div>

      {/* 2. Profile Hero Header */}
      <div className="relative overflow-hidden rounded-xl border border-[#E6EAF2] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar
              name={member.full_name}
              src={member.avatar_url}
              size="xl"
              className="ring-1 ring-[#2451EB]/20 shrink-0"
            />

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight truncate">
                  {member.full_name}
                </h1>
                {member.is_founder && (
                  <span className="px-2 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-mono font-semibold">
                    Founder
                  </span>
                )}
                <TeamAvailabilityBadge status={member.availability_status} />
                <TeamStatusBadge status={member.member_status} />
              </div>

              <p className="text-sm font-semibold text-[#2451EB]">
                {member.designation}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6472] pt-1">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#8A93A3]" />
                  <span>{member.department}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8A93A3]" />
                  <span>{member.email}</span>
                </span>
                {member.phone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#8A93A3]" />
                      <span>{member.phone}</span>
                    </span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[#5B6472]">
                  Joined: {formatDate(member.joined_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-xs font-mono text-[#5B6472]">
              Employee Code: <strong className="text-[#0F172A]">{member.employee_code}</strong>
            </span>
            <span className="text-xs font-mono text-[#5B6472]">
              Role: <strong className="text-[#2451EB]">{member.role}</strong>
            </span>
            <span className="text-xs font-mono text-[#5B6472]">
              Employment: <strong className="text-[#0F172A]">{member.employment_type}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Member Performance Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="rounded-xl border border-[#E6EAF2] bg-white p-4 scalemorphic-card">
          <span className="text-xs font-medium text-[#5B6472]">
            Active Projects
          </span>
          <p className="text-2xl font-semibold text-[#0F172A] mt-1.5 font-tabular">
            {member.active_projects_count}
          </p>
          <p className="text-[10px] text-[#5B6472] mt-0.5 font-medium">Assigned codebases</p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-4 scalemorphic-card">
          <span className="text-xs font-medium text-[#5B6472]">
            Active Tasks
          </span>
          <p className="text-2xl font-semibold text-[#2451EB] mt-1.5 font-tabular">
            {member.active_tasks_count}
          </p>
          <p className="text-[10px] text-[#5B6472] mt-0.5 font-medium">In progress & queued</p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-4 scalemorphic-card">
          <span className="text-xs font-medium text-[#5B6472]">
            Completed Tasks
          </span>
          <p className="text-2xl font-semibold text-emerald-700 mt-1.5 font-tabular">
            {member.completed_tasks_count}
          </p>
          <p className="text-[10px] text-[#5B6472] mt-0.5 font-medium">QA verified deliverables</p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-4 scalemorphic-card">
          <span className="text-xs font-medium text-[#5B6472]">
            Overdue Tasks
          </span>
          <p
            className={cn(
              "text-2xl font-semibold mt-1.5 font-tabular",
              member.overdue_tasks_count > 0 ? "text-rose-700" : "text-[#0F172A]"
            )}
          >
            {member.overdue_tasks_count}
          </p>
          <p className="text-[10px] text-[#5B6472] mt-0.5 font-medium">
            {member.overdue_tasks_count > 0 ? "Requires escalation" : "All deadlines met"}
          </p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-4 scalemorphic-card">
          <span className="text-xs font-medium text-[#5B6472]">
            Completion Rate
          </span>
          <p className="text-2xl font-semibold text-purple-700 mt-1.5 font-tabular">
            {member.completion_rate}%
          </p>
          <p className="text-[10px] text-[#5B6472] mt-0.5 font-medium">Task velocity score</p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-4 scalemorphic-card">
          <span className="text-xs font-medium text-[#5B6472]">
            Current Workload
          </span>
          <p
            className={cn(
              "text-2xl font-semibold mt-1.5 font-tabular",
              member.capacity_percentage >= 100
                ? "text-rose-700"
                : member.capacity_percentage >= 90
                ? "text-amber-700"
                : "text-emerald-700"
            )}
          >
            {member.capacity_percentage}%
          </p>
          <p className="text-[10px] text-[#5B6472] mt-0.5 font-medium">{member.workload_status}</p>
        </div>
      </div>

      {/* 4. Main Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workload Analytics & Skills */}
        <div className="lg:col-span-1 space-y-6">
          {/* Workload Capacity Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Workload & Capacity</h3>
              </div>
              <TeamWorkloadBadge status={member.workload_status} size="sm" />
            </div>

            <div className="space-y-3">
              <TeamWorkloadBar
                assignedHours={member.estimated_workload_hours}
                capacityHours={member.weekly_capacity_hours}
                percentage={member.capacity_percentage}
                status={member.workload_status}
                size="md"
              />

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Weekly Capacity</span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {member.weekly_capacity_hours} Hours
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Remaining Bandwidth</span>
                  <span className="text-sm font-bold text-emerald-700 mt-1 block">
                    {remainingCapacityHours} Hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Focus Card */}
          {member.bio && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase font-display tracking-wider mb-2">
                Professional Bio & Focus
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line font-sans">
                {member.bio}
              </p>
            </div>
          )}

          {/* Skills Matrix */}
          <TeamSkillsMatrix
            memberId={member.id}
            skills={member.skills}
            onSkillsChange={loadMemberData}
          />
        </div>

        {/* Right Column: Assigned Projects & Assigned Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Projects */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Assigned Projects ({assignedProjects.length})</h3>
              </div>
              <Link
                href="/projects"
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
              >
                <span>View All Projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {assignedProjects.length > 0 ? (
              <div className="space-y-3">
                {assignedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                      >
                        {p.project_name}
                      </Link>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                        {p.project_code} • {p.client?.company_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ProjectStatusBadge status={p.project_status} size="sm" />
                      <ProjectPriorityBadge priority={p.priority} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No active project assignments.</p>
            )}
          </div>

          {/* Assigned Tasks */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Assigned Deliverables ({assignedTasks.length})</h3>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
              >
                <span>View All Tasks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {assignedTasks.length > 0 ? (
              <div className="space-y-2.5">
                {assignedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/tasks/${t.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 truncate block"
                      >
                        {t.title}
                      </Link>
                      <span className="text-[10px] text-slate-400">
                        {t.project_name || t.project_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <TaskStatusBadge status={t.task_status} size="sm" />
                      <TaskPriorityBadge priority={t.priority} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No tasks currently assigned.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TeamMemberForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={member}
        mode="edit"
      />

      <TeamDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        member={member}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
