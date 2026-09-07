import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  headerAction?: React.ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  actionHref,
  actionLabel = "View all",
  headerAction,
  className,
  children,
  ...props
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E6EAF2] bg-white overflow-hidden transition-all duration-150 hover:border-[#D6DCE8]",
        className
      )}
      {...props}
    >
      {(title || headerAction || actionHref) && (
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E6EAF2]">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#5B6472] mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {headerAction}
            {actionHref && (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#2451EB] hover:underline transition-colors"
              >
                <span>{actionLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

