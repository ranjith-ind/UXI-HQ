"use client";

import React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Archive,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ProjectStatus, ProjectWithDetails } from "@/types/project";
import { ProjectStatusBadge } from "./project-status-badge";
import { ProjectPriorityBadge } from "./project-priority-badge";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProjectTableProps {
  projects: ProjectWithDetails[];
  onEdit: (project: ProjectWithDetails) => void;
  onArchive: (project: ProjectWithDetails) => void;
  onDelete: (project: ProjectWithDetails) => void;
  onStatusChange?: (project: ProjectWithDetails, status: ProjectStatus) => void;
  loading?: boolean;
}

export function ProjectTable({
  projects,
  onEdit,
  onArchive,
  onDelete,
  loading,
}: ProjectTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E6EAF2] bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs saas-table">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Project Name & Type
              </th>
              <th scope="col" className="px-4 py-3.5">
                Client Account
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Priority
              </th>
              <th scope="col" className="px-4 py-3.5">
                Team
              </th>
              <th scope="col" className="px-4 py-3.5">
                Budget
              </th>
              <th scope="col" className="px-4 py-3.5">
                Deadline
              </th>
              <th scope="col" className="px-4 py-3.5">
                Progress
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => {
              const isOverdue =
                project.estimated_deadline &&
                new Date(project.estimated_deadline) < new Date() &&
                project.project_status !== "Completed";

              return (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  {/* Project Name & Code */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex flex-col group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {project.project_name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                          {project.project_code}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {project.project_type}
                      </span>
                    </Link>
                  </td>

                  {/* Client Account */}
                  <td className="px-4 py-4">
                    {project.client ? (
                      <Link
                        href={`/clients/${project.client.id}`}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        <Avatar name={project.client_company} size="sm" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 truncate">
                            {project.client_company}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {project.client_name}
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        {project.client_company}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4">
                    <ProjectStatusBadge status={project.project_status} size="sm" />
                  </td>

                  {/* Priority Badge */}
                  <td className="px-4 py-4">
                    <ProjectPriorityBadge priority={project.priority} size="sm" />
                  </td>

                  {/* Team Members Stack */}
                  <td className="px-4 py-4">
                    <div className="flex items-center -space-x-2">
                      {project.team_members.slice(0, 3).map((tm, idx) => (
                        <div key={idx} title={`${tm.name} (${tm.role})`}>
                          <Avatar
                            name={tm.name}
                            src={tm.avatar_url}
                            size="sm"
                            className="ring-2 ring-white"
                          />
                        </div>
                      ))}
                      {project.team_members.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                          +{project.team_members.length - 3}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="px-4 py-4 font-mono font-bold text-slate-900">
                    {formatCurrency(project.final_budget, "INR")}
                  </td>

                  {/* Deadline */}
                  <td className="px-4 py-4">
                    {project.estimated_deadline ? (
                      <div className="flex items-center gap-1.5">
                        {isOverdue && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            isOverdue ? "text-rose-700 font-bold" : "text-slate-600"
                          )}
                        >
                          {formatDate(project.estimated_deadline)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Progress Bar */}
                  <td className="px-4 py-4 min-w-[110px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            project.project_status === "Completed"
                              ? "bg-emerald-500"
                              : "bg-blue-600"
                          )}
                          style={{ width: `${project.progress_percent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">
                        {project.progress_percent}%
                      </span>
                    </div>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          aria-label="Actions"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    >
                      <Link href={`/projects/${project.id}`}>
                        <DropdownItem>
                          <Eye className="w-4 h-4 text-blue-600 mr-2" />
                          <span>View Project</span>
                        </DropdownItem>
                      </Link>

                      <DropdownItem onClick={() => onEdit(project)}>
                        <Edit2 className="w-4 h-4 text-slate-500 mr-2" />
                        <span>Edit Project</span>
                      </DropdownItem>

                      <DropdownItem onClick={() => onArchive(project)}>
                        <Archive className="w-4 h-4 text-purple-600 mr-2" />
                        <span>{project.is_archived ? "Unarchive" : "Archive"}</span>
                      </DropdownItem>

                      <DropdownSeparator />

                      <DropdownItem onClick={() => onDelete(project)} destructive>
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Delete Project</span>
                      </DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
