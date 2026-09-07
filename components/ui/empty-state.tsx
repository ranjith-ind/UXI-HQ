import * as React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  title = "No data available",
  description = "There are no records to display at this moment.",
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#E6EAF2] bg-[#F7F9FC]/60",
        className
      )}
    >
      <div className="p-3 rounded-full bg-white border border-[#E6EAF2] text-[#8A93A3] mb-3">
        <Icon className="w-6 h-6 text-[#5B6472]" />
      </div>

      <h4 className="text-sm font-semibold text-[#0F172A] tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-[#5B6472] max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

