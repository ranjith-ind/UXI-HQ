"use client";

import React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { TaskStatus, TaskWithDetails } from "@/types/task";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskPriorityBadge } from "./task-priority-badge";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TaskTableProps {
  tasks: TaskWithDetails[];
  onEdit: (task: TaskWithDetails) => void;
  onDelete: (task: TaskWithDetails) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  loading?: boolean;
}

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  loading,
}: TaskTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-100/70 border border-slate-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Task Title & Scope
              </th>
              <th scope="col" className="px-4 py-3.5">
                Project
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Priority
              </th>
              <th scope="col" className="px-4 py-3.5">
                Assignees
              </th>
              <th scope="col" className="px-4 py-3.5">
                Points
              </th>
              <th scope="col" className="px-4 py-3.5">
                Subtasks
              </th>
              <th scope="col" className="px-4 py-3.5">
                Due Date
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const isOverdue =
                task.due_date &&
                new Date(task.due_date) < new Date() &&
                task.task_status !== "Completed";

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  {/* Task Title */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="flex flex-col group"
                    >
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {task.title}
                      </span>
                      {task.sprint_name && (
                        <span className="text-[10px] text-blue-600 font-semibold mt-0.5">
                          Sprint: {task.sprint_name}
                        </span>
                      )}
                    </Link>
                  </td>

                  {/* Project */}
                  <td className="px-4 py-4">
                    {task.project_name ? (
                      <Link
                        href={`/projects/${task.project_id}`}
                        className="font-bold text-slate-700 hover:text-blue-600 transition-colors truncate block max-w-[130px]"
                      >
                        {task.project_name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4">
                    <TaskStatusBadge status={task.task_status} size="sm" />
                  </td>

                  {/* Priority Badge */}
                  <td className="px-4 py-4">
                    <TaskPriorityBadge priority={task.priority} size="sm" />
                  </td>

                  {/* Assignees Stack */}
                  <td className="px-4 py-4">
                    <div className="flex items-center -space-x-2">
                      {task.assignees.slice(0, 3).map((asg, idx) => (
                        <div key={idx} title={asg.name}>
                          <Avatar
                            name={asg.name}
                            src={asg.avatar_url}
                            size="sm"
                            className="ring-2 ring-white"
                          />
                        </div>
                      ))}
                      {task.assignees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                          +{task.assignees.length - 3}
                        </div>
                      )}
                      {task.assignees.length === 0 && (
                        <span className="text-slate-400 text-[11px]">Unassigned</span>
                      )}
                    </div>
                  </td>

                  {/* Hours */}
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {task.estimated_hours ?? 0}h
                    </span>
                  </td>

                  {/* Subtasks Progress */}
                  <td className="px-4 py-4">
                    {task.subtasks_total > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-slate-600">
                          {task.subtasks_completed}/{task.subtasks_total}
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${Math.round((task.subtasks_completed / task.subtasks_total) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-4">
                    {task.due_date ? (
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
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
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
                      <Link href={`/tasks/${task.id}`}>
                        <DropdownItem>
                          <Eye className="w-4 h-4 text-blue-600 mr-2" />
                          <span>View Task</span>
                        </DropdownItem>
                      </Link>

                      <DropdownItem onClick={() => onEdit(task)}>
                        <Edit2 className="w-4 h-4 text-slate-500 mr-2" />
                        <span>Edit Task</span>
                      </DropdownItem>

                      <DropdownSeparator />

                      <DropdownItem onClick={() => onDelete(task)} destructive>
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Delete Task</span>
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
