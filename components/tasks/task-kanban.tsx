"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { TaskStatus, TaskWithDetails, TASK_STATUS_LIST } from "@/types/task";
import { TaskKanbanCard } from "./task-kanban-card";
import { cn } from "@/lib/utils";

interface TaskKanbanProps {
  tasks: TaskWithDetails[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onEdit: (task: TaskWithDetails) => void;
  onDelete: (task: TaskWithDetails) => void;
  onAddTaskToStatus: (status: TaskStatus) => void;
}

const columnStyles: Record<
  TaskStatus,
  { label: string; dot: string; headerBg: string; border: string }
> = {
  Backlog: {
    label: "Backlog",
    dot: "bg-slate-400",
    headerBg: "bg-slate-50",
    border: "border-slate-200",
  },
  "To Do": {
    label: "To Do",
    dot: "bg-blue-500",
    headerBg: "bg-blue-50",
    border: "border-blue-200",
  },
  "In Progress": {
    label: "In Progress",
    dot: "bg-cyan-500",
    headerBg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  "In Review": {
    label: "In Review",
    dot: "bg-amber-500",
    headerBg: "bg-amber-50",
    border: "border-amber-200",
  },
  Blocked: {
    label: "Blocked",
    dot: "bg-rose-500",
    headerBg: "bg-rose-50",
    border: "border-rose-200",
  },
  Completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    headerBg: "bg-emerald-50",
    border: "border-emerald-200",
  },
};

const kanbanColumns: TaskStatus[] = [
  "Backlog",
  "To Do",
  "In Progress",
  "In Review",
  "Blocked",
  "Completed",
];

export function TaskKanban({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onAddTaskToStatus,
}: TaskKanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      await onStatusChange(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4 font-sans">
      {kanbanColumns.map((colStatus) => {
        const colCfg = columnStyles[colStatus] || columnStyles.Backlog;
        const colTasks = tasks.filter((t) => t.task_status === colStatus);
        const isOver = dragOverColumn === colStatus;

        return (
          <div
            key={colStatus}
            onDragOver={(e) => handleDragOver(e, colStatus)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, colStatus)}
            className={cn(
              "flex flex-col rounded-2xl border bg-slate-50/70 p-3 min-w-[260px] min-h-[500px] transition-all",
              isOver
                ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-100"
                : "border-slate-200"
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-2 mb-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", colCfg.dot)} />
                <h4 className="text-xs font-bold text-slate-900 font-display">
                  {colCfg.label}
                </h4>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {colTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAddTaskToStatus(colStatus)}
                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title={`Add task to ${colStatus}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
              {colTasks.map((task) => (
                <TaskKanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDragStart={handleDragStart}
                />
              ))}

              {colTasks.length === 0 && (
                <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-4 text-center">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Drop tasks here
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
