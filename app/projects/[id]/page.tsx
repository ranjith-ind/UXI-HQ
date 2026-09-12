"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  FolderKanban,
  Edit2,
  Trash2,
  Archive,
  Calendar,
  Layers,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  FileText,
  Save,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Users,
  CheckSquare,
  CreditCard,
  UserPlus,
  X,
  ChevronDown,
  Plus,
  KeyRound,
  Lock,
} from "lucide-react";
import { DetailLayout } from "@/components/ui/detail-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectPriorityBadge } from "@/components/projects/project-priority-badge";
import { ProjectProgress } from "@/components/projects/project-progress";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectDeleteModal } from "@/components/projects/project-delete-modal";
import { ProjectArchiveModal } from "@/components/projects/project-archive-modal";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskForm } from "@/components/tasks/task-form";
import { ProjectService } from "@/services/project.service";
import { ClientService } from "@/services/client.service";
import { TeamService } from "@/services/team.service";
import { TaskService } from "@/services/task.service";
import { SprintService } from "@/services/sprint.service";
import { InvoiceService } from "@/services/invoice.service";
import { PaymentService } from "@/services/payment.service";
import { ExpenseService } from "@/services/expense.service";
import { LeadService } from "@/services/lead.service";
import { CredentialService } from "@/services/credential.service";
import { CredentialCard } from "@/components/credentials/credential-card";
import { CredentialFormModal } from "@/components/credentials/credential-form-modal";
import { CredentialDeleteModal } from "@/components/credentials/credential-delete-modal";
import { CredentialActivityModal } from "@/components/credentials/credential-activity-modal";
import { ProjectCredential, CredentialFormData } from "@/types/credential";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { InvoiceWithDetails } from "@/types/invoice";
import { PaymentWithDetails } from "@/types/payment";
import { ExpenseWithDetails } from "@/types/expense";
import { LeadWithDetails } from "@/types/lead";
import {
  ProjectFormData,
  ProjectStatus,
  ProjectWithDetails,
  PROJECT_STATUS_LIST,
  PROJECT_STATUS_PROGRESS,
} from "@/types/project";
import { ClientWithDetails } from "@/types/client";
import { TeamMemberWithDetails } from "@/types/team";
import { TaskFormData, TaskWithDetails } from "@/types/task";
import { SprintWithDetails } from "@/types/sprint";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [clientsList, setClientsList] = useState<ClientWithDetails[]>([]);
  const [projectTasks, setProjectTasks] = useState<TaskWithDetails[]>([]);
  const [sprintsList, setSprintsList] = useState<SprintWithDetails[]>([]);
  const [projectInvoices, setProjectInvoices] = useState<InvoiceWithDetails[]>([]);
  const [projectPayments, setProjectPayments] = useState<PaymentWithDetails[]>([]);
  const [projectExpenses, setProjectExpenses] = useState<ExpenseWithDetails[]>([]);
  const [originLead, setOriginLead] = useState<LeadWithDetails | null>(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    progressPercent: 0,
  });
  const [loading, setLoading] = useState(true);

  // Notes state
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceWithDetails | null>(null);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMemberWithDetails[]>([]);

  // Credentials state
  const [projectCredentials, setProjectCredentials] = useState<ProjectCredential[]>([]);
  const [isCredentialFormOpen, setIsCredentialFormOpen] = useState(false);
  const [selectedCredentialForEdit, setSelectedCredentialForEdit] = useState<ProjectCredential | null>(null);
  const [credentialToDelete, setCredentialToDelete] = useState<ProjectCredential | null>(null);
  const [credentialForActivity, setCredentialForActivity] = useState<ProjectCredential | null>(null);

  const loadProjectData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        fetchedProject,
        fetchedClients,
        fetchedTasks,
        fetchedSprints,
        fetchedInvoices,
        fetchedPayments,
        fetchedExpenses,
        allLeads,
        fetchedTeam,
        fetchedCredentials,
      ] = await Promise.all([
        ProjectService.getProjectById(id),
        ClientService.getClients(),
        TaskService.getTasks({ projectId: id }),
        SprintService.getSprints(),
        InvoiceService.getInvoices({ projectId: id }),
        PaymentService.getPayments({ projectId: id }),
        ExpenseService.getExpenses({ projectId: id }),
        LeadService.getLeads(),
        TeamService.getTeamMembers(),
        CredentialService.getCredentials({ projectId: id }),
      ]);

      if (fetchedProject) {
        setProject(fetchedProject);
        setNotes(fetchedProject.project_notes || "");

        const matchingLead = allLeads.find(
          (l) =>
            l.converted_project_id === id ||
            (fetchedProject.client_id && l.converted_client_id === fetchedProject.client_id)
        );
        if (matchingLead) {
          setOriginLead(matchingLead);
        }
      }
      setClientsList(fetchedClients);
      setProjectTasks(fetchedTasks);
      setSprintsList(fetchedSprints);
      setProjectInvoices(fetchedInvoices);
      setProjectPayments(fetchedPayments);
      setProjectExpenses(fetchedExpenses);
      setAllTeamMembers(fetchedTeam);
      setProjectCredentials(fetchedCredentials);

      // Task calculation
      const total = fetchedTasks.length;
      const completed = fetchedTasks.filter((t) => t.task_status === "Completed").length;
      const inProgress = fetchedTasks.filter(
        (t) => t.task_status === "In Progress" || t.task_status === "In Review"
      ).length;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

      setTaskStats({ total, completed, inProgress, progressPercent });
    } catch (err) {
      console.error("Error loading project detail:", err);
      toastError("Failed to fetch project");
    } finally {
      setLoading(false);
    }
  }, [id, toastError]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleEditSubmit = async (formData: ProjectFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ProjectService.updateProject(id, formData, actorName);
    if (res.success) {
      success("Project Updated", "Changes saved successfully.");
      loadProjectData();
    } else {
      toastError("Failed to update project", res.error);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ProjectService.updateProjectStatus(id, newStatus, actorName);
    if (res.success) {
      success("Status Updated", `Project lifecycle set to ${newStatus}.`);
      loadProjectData();
    } else {
      toastError("Failed to update status", res.error);
    }
  };

  const handleDeleteConfirm = async (projectId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ProjectService.deleteProject(projectId, actorName);
    if (res.success) {
      success("Project deleted successfully", "Redirecting to projects directory...");
      router.push("/projects");
    } else {
      toastError("Failed to delete project", res.error);
    }
  };

  const handleArchiveConfirm = async (projectId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ProjectService.archiveProject(projectId, actorName);
    if (res.success) {
      success("Project archive state updated");
      loadProjectData();
    } else {
      toastError("Failed to archive project", res.error);
    }
  };

  const handleSaveNotes = async () => {
    if (!project) return;
    setSavingNotes(true);
    try {
      const actorName = user?.fullName || "Ranjith";
      await ProjectService.updateProject(id, { project_notes: notes }, actorName);
      setNotesSaved(true);
      success("Internal notes updated");
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      toastError("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleMember = async (memberId: string) => {
    if (!project) return;
    const actorName = user?.fullName || "Ranjith";
    const isAssigned = project.team_members.some((tm) => tm.team_member_id === memberId);

    if (isAssigned) {
      await ProjectService.removeTeamMember(id, memberId, actorName);
      success("Team member unassigned");
    } else {
      await ProjectService.assignTeamMember(id, memberId, actorName);
      success("Team member assigned");
    }
    loadProjectData();
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await TaskService.createTask({ ...formData, project_id: id }, actorName);
    if (res.success) {
      success("Task added to project");
      loadProjectData();
    } else {
      toastError("Failed to create task", res.error);
    }
  };

  if (loading || !project) {
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

  const calculatedProgress =
    taskStats.total > 0
      ? taskStats.progressPercent
      : PROJECT_STATUS_PROGRESS[project.project_status] ?? 50;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B6472] hover:text-[#0F172A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#2451EB]" />
          <span>Back to Projects Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick Status Changer Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2451EB]/30 bg-[#EFF4FE] text-[#2451EB] hover:bg-blue-100 text-xs font-semibold transition-colors scalemorphic-button">
                <span>Status: {project.project_status}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-[#8A93A3] uppercase tracking-wider">
              Change Project Status
            </div>
            {PROJECT_STATUS_LIST.map((st) => (
              <DropdownItem
                key={st}
                onClick={() => handleStatusChange(st)}
                className={project.project_status === st ? "bg-[#EFF4FE] text-[#2451EB] font-semibold" : ""}
              >
                <span>{st}</span>
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
            <span>Edit</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsArchiveOpen(true)}
            className="gap-1.5 hidden sm:inline-flex font-semibold"
          >
            <Archive className="w-3.5 h-3.5 text-purple-600" />
            <span>{project.is_archived ? "Restore" : "Archive"}</span>
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

      {/* 2. Project Hero Command Center Header */}
      <div className="relative overflow-hidden rounded-xl border border-[#E6EAF2] bg-white p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-mono font-semibold">
                {project.project_code}
              </span>
              <ProjectStatusBadge status={project.project_status} />
              <ProjectPriorityBadge priority={project.priority} />
              <span className="px-2.5 py-0.5 rounded-md bg-[#F7F9FC] border border-[#E6EAF2] text-[11px] text-[#5B6472] font-semibold">
                {project.project_type}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              {project.project_name}
            </h1>

            {/* Client relation link */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5B6472]">
              {project.client && (
                <Link
                  href={`/clients/${project.client.id}`}
                  className="font-semibold text-[#2451EB] hover:underline flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Client: {project.client_company}</span>
                </Link>
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
              <span>
                Started: <strong className="text-[#0F172A]">{project.start_date ? formatDate(project.start_date) : "—"}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Deadline: <strong className="text-[#0F172A]">{project.estimated_deadline ? formatDate(project.estimated_deadline) : "Flexible"}</strong>
              </span>
            </div>
          </div>

          {/* Quick Repo & Live Links */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF4FE] border border-[#2451EB]/30 text-[#2451EB] hover:bg-blue-100 text-xs font-semibold transition-all scalemorphic-button"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Staging</span>
              </a>
            )}

            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E6EAF2] text-[#0F172A] hover:bg-[#F7F9FC] text-xs font-semibold transition-all scalemorphic-button"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#5B6472]" />
                <span>Repository</span>
              </a>
            )}

            <Link
              href={`/projects/${project.id}/credentials`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all scalemorphic-button"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Vault ({projectCredentials.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Project Progress Stepper */}
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-5">
        <ProjectProgress
          currentStatus={project.project_status}
          onStatusClick={handleStatusChange}
        />
      </div>

      {/* 4. Financial & Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Total Budget
            </span>
            <div className="p-2 rounded-md bg-[#F7F9FC] text-[#5B6472] border border-[#E6EAF2]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-[#0F172A] mt-2 font-tabular">
            {formatCurrency(project.final_budget, "INR")}
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium font-tabular">
            Est: {formatCurrency(project.estimated_budget, "INR")}
          </p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Task Execution
            </span>
            <div className="p-2 rounded-md bg-[#F7F9FC] text-[#5B6472] border border-[#E6EAF2]">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-[#0F172A] mt-2 font-tabular">
            {calculatedProgress}%
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">
            {taskStats.total > 0
              ? `${taskStats.completed}/${taskStats.total} tasks completed`
              : "Status lifecycle calculation"}
          </p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Pending Balance
            </span>
            <div className="p-2 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-amber-700 mt-2 font-tabular">
            {formatCurrency(project.pending_amount, "INR")}
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">Due upon delivery signoff</p>
        </div>

        <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">
              Delivery Target
            </span>
            <div className="p-2 rounded-md bg-purple-50 text-purple-600 border border-purple-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-semibold text-[#0F172A] mt-2 font-tabular truncate">
            {project.estimated_deadline ? formatDate(project.estimated_deadline) : "Open"}
          </p>
          <p className="text-[11px] text-[#5B6472] mt-1 font-medium">
            {project.days_remaining !== null
              ? project.days_remaining >= 0
                ? `${project.days_remaining} days remaining`
                : `${Math.abs(project.days_remaining)} days overdue`
              : "No deadline defined"}
          </p>
        </div>
      </div>

      {/* 5. Main Layout: Left (Team & Specifications) / Right (Tasks, Requirements, Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Members & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          {/* Assigned Team Members Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Assigned Engineers</h3>
              </div>

              <button
                onClick={() => setIsAssignMemberOpen(!isAssignMemberOpen)}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Manage</span>
              </button>
            </div>

            {/* Quick Member Assignment Drawer */}
            {isAssignMemberOpen && (
              <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200 text-[11px] font-bold text-slate-700 font-display">
                  <span>Toggle Team Members</span>
                  <button onClick={() => setIsAssignMemberOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {allTeamMembers.map((tm) => {
                    const isAssigned = project.team_members.some((m) => m.team_member_id === tm.id);
                    return (
                      <button
                        key={tm.id}
                        onClick={() => handleToggleMember(tm.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                          isAssigned ? "bg-blue-50 text-blue-700 border border-blue-200" : "hover:bg-white text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={tm.full_name || (tm as any).name} size="sm" />
                          <span>{tm.full_name || (tm as any).name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{isAssigned ? "✓ Added" : "+ Add"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Team List */}
            <div className="space-y-2.5">
              {project.team_members.map((tm, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={tm.name} src={tm.avatar_url} size="sm" />
                    <div>
                      <span className="font-bold text-slate-900 block">{tm.name}</span>
                      <span className="text-[10px] text-slate-500">{tm.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {tm.role || "Member"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tasks, Requirements, Invoices & Profitability */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Container */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Project Tasks ({projectTasks.length})</h3>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsTaskFormOpen(true)}
                className="gap-1 text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </Button>
            </div>

            {projectTasks.length > 0 ? (
              <TaskTable
                tasks={projectTasks}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No tasks added to this project yet.</p>
            )}
          </div>

          {/* Scope & Description */}
          {project.description && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-slate-900 font-display">Project Scope & Deliverables</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{project.description}</p>
            </div>
          )}

          {/* Live Milestone Invoicing & Finance Section */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Project Financials & Invoices</h3>
              </div>

              {user?.role !== "Developer" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInvoiceFormOpen(true)}
                  className="gap-1 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Invoice</span>
                </Button>
              )}
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-display">Contract Value</span>
                <p className="text-sm font-extrabold text-slate-900 mt-1 font-display">
                  {formatCurrency(project.final_budget, "INR")}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Agreed budget</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-display">Total Paid</span>
                <p className="text-sm font-extrabold text-emerald-700 mt-1 font-display">
                  {formatCurrency(project.total_paid_amount, "INR")}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">{projectPayments.length} payments realized</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-display">Pending Balance</span>
                <p className="text-sm font-extrabold text-amber-700 mt-1 font-display">
                  {formatCurrency(project.pending_amount, "INR")}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Due on signoff</span>
              </div>
            </div>

            {/* Invoices List */}
            {projectInvoices.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
                  Project Invoices ({projectInvoices.length})
                </span>
                {projectInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/finance/invoices/${inv.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors font-mono"
                        >
                          {inv.invoice_number}
                        </Link>
                        <InvoiceStatusBadge status={inv.invoice_status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                        {inv.invoice_title}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block font-mono">
                          {formatCurrency(inv.total_amount, "INR")}
                        </span>
                        <span className={inv.amount_due > 0 ? "text-[10px] text-amber-700 font-bold" : "text-[10px] text-emerald-700 font-medium"}>
                          {inv.amount_due > 0 ? `Due: ${formatCurrency(inv.amount_due, "INR")}` : "Paid"}
                        </span>
                      </div>

                      {user?.role !== "Developer" && inv.amount_due > 0 && inv.invoice_status !== "Cancelled" && (
                        <button
                          onClick={() => setSelectedInvoiceForPayment(inv)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No invoices created for this project yet.</p>
            )}
          </div>

          {/* Internal Notes Editor */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">Internal Team Notes & Context</h3>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleSaveNotes}
                isLoading={savingNotes}
                className="gap-1.5 font-semibold text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{notesSaved ? "Saved!" : "Save Notes"}</span>
              </Button>
            </div>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal developer logs, deployment notes, staging credentials..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* 🔐 Project Credentials Vault Section */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#2451EB]" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Project Credentials Vault ({projectCredentials.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/projects/${project.id}/credentials`}
                  className="text-xs text-[#2451EB] hover:underline font-semibold"
                >
                  Open Full Vault →
                </Link>

                {user?.role !== "Developer" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedCredentialForEdit(null);
                      setIsCredentialFormOpen(true);
                    }}
                    className="gap-1 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Credential</span>
                  </Button>
                )}
              </div>
            </div>

            {projectCredentials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectCredentials.map((cred) => (
                  <CredentialCard
                    key={cred.id}
                    credential={cred}
                    onEdit={(c) => {
                      setSelectedCredentialForEdit(c);
                      setIsCredentialFormOpen(true);
                    }}
                    onDelete={(c) => setCredentialToDelete(c)}
                    onViewActivity={(c) => setCredentialForActivity(c)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                <Lock className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p>No credentials stored for this project yet.</p>
                {user?.role !== "Developer" && (
                  <button
                    onClick={() => {
                      setSelectedCredentialForEdit(null);
                      setIsCredentialFormOpen(true);
                    }}
                    className="mt-2 text-xs font-semibold text-[#2451EB] hover:underline"
                  >
                    + Add first project credential
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        clientsList={clientsList}
        initialData={project}
        mode="edit"
      />

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleCreateTask}
        projectsList={project ? [project] : []}
        sprintsList={sprintsList}
        defaultProjectId={project.id}
        mode="add"
      />

      <ProjectDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        project={project}
        onConfirm={handleDeleteConfirm}
      />

      <ProjectArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        project={project}
        onConfirm={handleArchiveConfirm}
      />

      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => setIsInvoiceFormOpen(false)}
        onSubmit={async (formData) => {
          const res = await InvoiceService.createInvoice(formData, user?.fullName || "Ranjith");
          if (res.success) {
            success("Invoice created", `${res.invoice?.invoice_number} generated.`);
            loadProjectData();
          } else {
            toastError("Failed to create invoice", res.error);
          }
        }}
        preselectedClientId={project.client_id}
        preselectedProjectId={project.id}
        mode="add"
      />

      <RecordPaymentModal
        isOpen={!!selectedInvoiceForPayment}
        invoice={selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        onSuccess={() => {
          setSelectedInvoiceForPayment(null);
          loadProjectData();
        }}
      />

      {/* Credentials Modals */}
      <CredentialFormModal
        isOpen={isCredentialFormOpen}
        onClose={() => setIsCredentialFormOpen(false)}
        onSubmit={async (formData) => {
          const actor = user?.fullName || "Team Member";
          if (selectedCredentialForEdit) {
            const res = await CredentialService.updateCredential(
              selectedCredentialForEdit.id,
              formData,
              actor
            );
            if (res.success) {
              success("Credential Updated", `${formData.name} updated.`);
              loadProjectData();
            } else {
              toastError("Failed to update credential", res.error);
            }
          } else {
            const res = await CredentialService.createCredential(
              { ...formData, project_id: project.id },
              actor
            );
            if (res.success) {
              success("Credential Created", `${formData.name} stored in vault.`);
              loadProjectData();
            } else {
              toastError("Failed to create credential", res.error);
            }
          }
        }}
        projectsList={project ? [project] : []}
        preselectedProjectId={project.id}
        initialData={selectedCredentialForEdit}
        mode={selectedCredentialForEdit ? "edit" : "add"}
      />

      <CredentialDeleteModal
        isOpen={!!credentialToDelete}
        onClose={() => setCredentialToDelete(null)}
        credential={credentialToDelete}
        onConfirm={async (cid) => {
          const actor = user?.fullName || "Team Member";
          const res = await CredentialService.deleteCredential(cid, actor);
          if (res.success) {
            success("Credential Deleted", "Removed from vault.");
            loadProjectData();
          } else {
            toastError("Failed to delete credential", res.error);
          }
        }}
      />

      <CredentialActivityModal
        isOpen={!!credentialForActivity}
        onClose={() => setCredentialForActivity(null)}
        credential={credentialForActivity}
      />
    </div>
  );
}
