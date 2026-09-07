"use client";

import React from "react";
import Link from "next/link";
import { ProjectSummary } from "@/types";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, FolderKanban } from "lucide-react";

interface ProjectsTableProps {
  projects: ProjectSummary[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="rounded-xl border border-[#E6EAF2] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E6EAF2]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#F7F9FC] text-[#5B6472] border border-[#E6EAF2]">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">
              Recent Projects
            </h3>
            <p className="text-xs text-[#5B6472]">
              Active engineering pipelines & deliverables
            </p>
          </div>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#2451EB] hover:underline transition-colors"
        >
          <span>View all projects</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs saas-table">
          <thead>
            <tr>
              <th scope="col">Project Name</th>
              <th scope="col">Client</th>
              <th scope="col">Status</th>
              <th scope="col">Progress</th>
              <th scope="col">Budget</th>
              <th scope="col">Lead</th>
              <th scope="col" className="text-right">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              return (
                <tr
                  key={project.id}
                  className="hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
                >
                  {/* Project name & code */}
                  <td>
                    <Link href={`/projects/${project.id}`} className="flex flex-col">
                      <span className="font-semibold text-[#0F172A] group-hover:text-[#2451EB] transition-colors">
                        {project.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A93A3]">
                        {project.code}
                      </span>
                    </Link>
                  </td>

                  {/* Client */}
                  <td className="text-[#5B6472] font-medium">
                    {project.clientName}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <ProjectStatusBadge status={project.status} size="sm" />
                  </td>

                  {/* Progress bar */}
                  <td className="min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <Progress value={project.progressPercent} size="sm" className="flex-1" />
                      <span className="font-tabular text-[10px] text-[#5B6472] font-semibold">
                        {project.progressPercent}%
                      </span>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="font-tabular font-semibold text-[#0F172A]">
                    {formatCurrency(project.budget, "INR")}
                  </td>

                  {/* Lead */}
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={project.leadName} size="sm" />
                      <span className="text-xs font-medium text-slate-700">
                        {project.leadName}
                      </span>
                    </div>
                  </td>

                  {/* Deadline */}
                  <td className="text-right font-tabular text-[#5B6472] font-medium">
                    {formatDate(project.deadline)}
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
