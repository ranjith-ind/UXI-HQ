"use client";

import React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { TaskPriorityBadge } from "./task-priority-badge";
import { Avatar } from "@/components/ui/avatar";
import { TaskWithDetails } from "@/types/task";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TaskKanbanCardProps {
  task: TaskWithDetails;
  onEdit: (task: TaskWithDetails) => void;
  onDelete: (task: TaskWithDetails) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export function TaskKanbanCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
}: TaskKanbanCardProps) {
  const isDone = task.task_status === "Completed";
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    !isDone;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing font-sans"
    >
      {/* Top Meta: Project Code + Priority + Menu */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link
            href={`/projects/${task.project_id}`}
            onClick={(e) => e.stopPropagation()}
            className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 truncate"
          >
            {task.project_code}
          </Link>
          <TaskPriorityBadge priority={task.priority} size="sm" />
        </div>

        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          }
        >
          <Link href={`/tasks/${task.id}`}>
            <DropdownItem>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-2" />
              <span>View Task Details</span>
            </DropdownItem>
          </Link>
          <DropdownItem onClick={() => onEdit(task)}>
            <Edit2 className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <span>Edit Task</span>
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={() => onDelete(task)} destructive>
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            <span>Delete Task</span>
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Task Title */}
      <Link href={`/tasks/${task.id}`} className="block group-hover:text-blue-600 transition-colors">
        <h4
          className={cn(
            "text-xs font-bold text-slate-900 group-hover:text-blue-600 leading-snug line-clamp-2",
            isDone && "line-through text-slate-400"
          )}
        >
          {task.title}
        </h4>
      </Link>

      {/* Subtasks Count indicator if present */}
      {task.subtasks_total > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-2 font-medium">
          <CheckSquare className="w-3 h-3 text-blue-600" />
          <span>
            {task.subtasks_completed}/{task.subtasks_total} subtasks
          </span>
        </div>
      )}

      {/* Footer Info: Estimated Hours, Due Date & Assignees */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {task.estimated_hours ?? 0}h
          </span>

          {task.due_date && (
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                isOverdue ? "text-rose-700 font-bold" : "text-slate-500"
              )}
            >
              {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-500" />}
              <span>{formatDate(task.due_date)}</span>
            </span>
          )}
        </div>

        {/* Assignees avatars */}
        <div className="flex items-center -space-x-1.5">
          {task.assignees?.slice(0, 2).map((a, i) => (
            <Avatar
              key={i}
              name={a.name}
              src={a.avatar_url}
              size="sm"
              className="ring-2 ring-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
