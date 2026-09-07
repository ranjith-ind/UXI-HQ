"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderPlus, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectStats } from "@/components/projects/project-stats";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectTable } from "@/components/projects/project-table";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectDeleteModal } from "@/components/projects/project-delete-modal";
import { ProjectArchiveModal } from "@/components/projects/project-archive-modal";
import { ProjectEmptyState } from "@/components/projects/project-empty-state";
import { ProjectService } from "@/services/project.service";
import { ClientService } from "@/services/client.service";
import {
  DeadlineFilterOption,
  ProjectFormData,
  ProjectPriority,
  ProjectSortOption,
  ProjectStats as IProjectStats,
  ProjectStatus,
  ProjectType,
  ProjectWithDetails,
} from "@/types/project";
import { ClientWithDetails } from "@/types/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [clientsList, setClientsList] = useState<ClientWithDetails[]>([]);
  const [stats, setStats] = useState<IProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
    totalContractValue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | "All">("All");
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectType | "All">("All");
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilterOption>("all");
  const [clientIdFilter, setClientIdFilter] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [sortBy, setSortBy] = useState<ProjectSortOption>("recently_created");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithDetails | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<ProjectWithDetails | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedProjects, fetchedClients, fetchedStats] = await Promise.all([
        ProjectService.getProjects({
          search,
          status: statusFilter,
          priority: priorityFilter,
          projectType: projectTypeFilter,
          deadlineFilter,
          clientId: clientIdFilter,
          teamMemberId: teamMemberFilter,
          isArchived,
          sortBy,
        }),
        ClientService.getClients(),
        ProjectService.getStats(),
      ]);

      setProjects(fetchedProjects);
      setClientsList(fetchedClients);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to load projects data:", err);
      toastError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    priorityFilter,
    projectTypeFilter,
    deadlineFilter,
    clientIdFilter,
    teamMemberFilter,
    isArchived,
    sortBy,
    toastError,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedProject(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (project: ProjectWithDetails) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const handleOpenArchiveModal = (project: ProjectWithDetails) => {
    setProjectToArchive(project);
    setIsArchiveOpen(true);
  };

  const handleFormSubmit = async (formData: ProjectFormData) => {
    const actorName = user?.fullName || "Ranjith";

    if (formMode === "add") {
      const res = await ProjectService.createProject(formData, actorName);
      if (res.success) {
        success("Project created", `${formData.project_name} has been added.`);
        loadData();
      } else {
        toastError("Error creating project", res.error);
      }
    } else if (formMode === "edit" && selectedProject) {
      const res = await ProjectService.updateProject(selectedProject.id, formData, actorName);
      if (res.success) {
        success("Project updated", `Changes saved for ${formData.project_name}.`);
        loadData();
      } else {
        toastError("Error updating project", res.error);
      }
    }
  };

  const handleDeleteConfirm = async (projectId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ProjectService.deleteProject(projectId, actorName);
    if (res.success) {
      success("Project deleted", "Project and associated tasks removed.");
      loadData();
    } else {
      toastError("Failed to delete project", res.error);
    }
  };

  const handleArchiveConfirm = async (projectId: string) => {
    const actorName = user?.fullName || "Ranjith";
    const res = await ProjectService.archiveProject(projectId, actorName);
    if (res.success) {
      success("Project Status Updated", "Project archival state modified.");
      loadData();
    } else {
      toastError("Failed to archive project", res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-[#E6EAF2] bg-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF4FE] text-[#2451EB] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
            <span>UXI Engineering Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Projects Management
          </h1>
          <p className="text-xs text-[#5B6472] max-w-xl">
            Track web development deliverables, milestone progress, budgets, deadlines, and engineer assignments.
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
            onClick={handleOpenAddModal}
            className="gap-2 shadow-sm font-semibold"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </Button>
        </div>
      </div>

      {/* 2. Project Metrics Strip */}
      <ProjectStats stats={stats} loading={loading} />

      {/* 3. Search & Comprehensive Filter System */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        projectType={projectTypeFilter}
        onProjectTypeChange={setProjectTypeFilter}
        deadlineFilter={deadlineFilter}
        onDeadlineFilterChange={setDeadlineFilter}
        clientId={clientIdFilter}
        onClientIdChange={setClientIdFilter}
        teamMemberId={teamMemberFilter}
        onTeamMemberIdChange={setTeamMemberFilter}
        isArchived={isArchived}
        onIsArchivedChange={setIsArchived}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        clientsList={clientsList}
        totalCount={projects.length}
      />

      {/* 4. Project Table or Empty State */}
      {projects.length > 0 ? (
        <ProjectTable
          projects={projects}
          onEdit={handleOpenEditModal}
          onArchive={handleOpenArchiveModal}
          onDelete={handleOpenDeleteModal}
          loading={loading}
        />
      ) : (
        <ProjectEmptyState
          isFiltered={
            search.length > 0 ||
            statusFilter !== "All" ||
            priorityFilter !== "All" ||
            isArchived
          }
          onAddProject={handleOpenAddModal}
          onResetFilters={() => {
            setSearch("");
            setStatusFilter("All");
            setPriorityFilter("All");
            setIsArchived(false);
          }}
        />
      )}

      {/* 5. Modals */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        clientsList={clientsList}
        initialData={selectedProject}
        mode={formMode}
      />

      <ProjectDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        project={projectToDelete}
      />

      <ProjectArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={handleArchiveConfirm}
        project={projectToArchive}
      />
    </div>
  );
}
