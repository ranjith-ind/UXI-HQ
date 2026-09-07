import React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  Zap,
  ArrowRight,
} from "lucide-react";
import { SprintStatus, SprintWithDetails } from "@/types/sprint";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";

interface SprintCardProps {
  sprint: SprintWithDetails;
  onEdit: (sprint: SprintWithDetails) => void;
  onDelete: (sprint: SprintWithDetails) => void;
  onStatusChange: (sprint: SprintWithDetails, status: SprintStatus) => void;
}

const statusBadgeConfig: Record<
  SprintStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Planned: {
    label: "Planned",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  Active: {
    label: "Active Sprint",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-600",
  },
  Completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  Cancelled: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

export function SprintCard({
  sprint,
  onEdit,
  onDelete,
  onStatusChange,
}: SprintCardProps) {
  const badgeCfg = statusBadgeConfig[sprint.sprint_status] || statusBadgeConfig.Planned;
  const progressPercent = sprint.progress_percent || 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between font-sans">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border",
                  badgeCfg.bg,
                  badgeCfg.text,
                  badgeCfg.border
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", badgeCfg.dot)} />
                <span>{badgeCfg.label}</span>
              </span>

              {sprint.project_code && (
                <Link
                  href={`/projects/${sprint.project_id}`}
                  className="text-[10px] font-mono font-bold text-slate-500 hover:text-blue-600 truncate max-w-[120px]"
                >
                  {sprint.project_code}
                </Link>
              )}
            </div>

            <Link href={`/tasks/sprints/${sprint.id}`}>
              <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors truncate font-display">
                {sprint.name}
              </h3>
            </Link>
          </div>

          <Dropdown
            align="right"
            trigger={
              <button
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
          >
            {sprint.sprint_status === "Planned" && (
              <DropdownItem onClick={() => onStatusChange(sprint, "Active")}>
                <Play className="w-4 h-4 text-blue-600 mr-2" />
                <span>Start Sprint</span>
              </DropdownItem>
            )}

            {sprint.sprint_status === "Active" && (
              <DropdownItem onClick={() => onStatusChange(sprint, "Completed")}>
                <Zap className="w-4 h-4 text-emerald-600 mr-2" />
                <span>Complete Sprint</span>
              </DropdownItem>
            )}

            <DropdownItem onClick={() => onEdit(sprint)}>
              <Edit2 className="w-4 h-4 text-slate-500 mr-2" />
              <span>Edit Sprint</span>
            </DropdownItem>

            <DropdownSeparator />

            <DropdownItem onClick={() => onDelete(sprint)} destructive>
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete Sprint</span>
            </DropdownItem>
          </Dropdown>
        </div>

        {/* Goal */}
        {sprint.goal && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {sprint.goal}
          </p>
        )}

        {/* Timeline & Dates */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
          </span>
        </div>

        {/* Progress Bar & Task Counts */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              {sprint.completed_tasks || 0}/{sprint.total_tasks || 0} Tasks Done
            </span>
            <span className="font-mono font-bold text-blue-600">
              {progressPercent}%
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          {sprint.project_name || "Assigned Project"}
        </span>

        <Link
          href={`/tasks/sprints/${sprint.id}`}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline font-display"
        >
          <span>Sprint Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
