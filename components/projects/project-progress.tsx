"use client";

import React from "react";
import { ProjectStatus, PROJECT_STATUS_PROGRESS } from "@/types/project";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProjectProgressProps {
  currentStatus: ProjectStatus;
  onStatusClick?: (status: ProjectStatus) => void;
  className?: string;
}

const mainLifecycleSteps: ProjectStatus[] = [
  "Lead",
  "Discussion",
  "Confirmed",
  "Designing",
  "Development",
  "Testing",
  "Client Review",
  "Completed",
];

export function ProjectProgress({
  currentStatus,
  onStatusClick,
  className,
}: ProjectProgressProps) {
  const currentProgress = PROJECT_STATUS_PROGRESS[currentStatus] ?? 50;
  const isSpecialState = currentStatus === "On Hold" || currentStatus === "Cancelled";
  const currentIndex = mainLifecycleSteps.indexOf(currentStatus);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Project Lifecycle Progress
          </span>
          {isSpecialState && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              State: {currentStatus}
            </span>
          )}
        </div>
        <span className="font-mono text-xs font-bold text-blue-600">
          {currentProgress}% Completed
        </span>
      </div>

      {/* Main Animated Progress Bar */}
      <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            currentStatus === "Completed"
              ? "bg-emerald-500"
              : currentStatus === "Cancelled"
              ? "bg-slate-400"
              : currentStatus === "On Hold"
              ? "bg-amber-500"
              : "bg-blue-600"
          )}
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Stepper Timeline Dots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
        {mainLifecycleSteps.map((step, idx) => {
          const isPassed = currentIndex > idx || currentStatus === "Completed";
          const isCurrent = currentStatus === step;

          return (
            <button
              key={step}
              type="button"
              onClick={() => onStatusClick && onStatusClick(step)}
              disabled={!onStatusClick}
              className={cn(
                "flex flex-col items-center text-center p-2 rounded-xl transition-all duration-150 group shadow-xs",
                isCurrent
                  ? "bg-blue-50 border border-blue-300 ring-2 ring-blue-100"
                  : isPassed
                  ? "bg-slate-50 border border-slate-200 text-slate-700"
                  : "bg-white border border-slate-200 text-slate-400",
                onStatusClick && "hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 transition-transform group-hover:scale-110",
                  isCurrent
                    ? "bg-blue-600 text-white shadow-sm"
                    : isPassed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </div>

              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight truncate w-full",
                  isCurrent
                    ? "text-blue-700"
                    : isPassed
                    ? "text-slate-800"
                    : "text-slate-400"
                )}
              >
                {step}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
