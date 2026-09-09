import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercent?: number;
  icon: LucideIcon;
  variant?: "blue" | "cyan" | "emerald" | "violet" | "amber";
}

const variantStyles = {
  blue: {
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    hoverBorder: "hover:border-blue-300",
  },
  cyan: {
    iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100",
    hoverBorder: "hover:border-cyan-300",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
  },
  violet: {
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    hoverBorder: "hover:border-purple-300",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    hoverBorder: "hover:border-amber-300",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  changePercent,
  icon: Icon,
  variant = "blue",
}: StatsCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E6EAF2] bg-white p-5 scalemorphic-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-medium text-[#5B6472]">
            {title}
          </span>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F172A] font-tabular">
              {value}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg shrink-0 bg-[#F7F9FC] text-[#5B6472] border border-[#E6EAF2]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Footer trend info */}
      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E6EAF2]">
        {changePercent !== undefined ? (
          <div className="flex items-center gap-1.5 font-tabular">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
                isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {changePercent}%
              </span>
            </span>
            <span className="text-[#8A93A3] text-[11px] font-normal">vs last month</span>
          </div>
        ) : (
          <span className="text-[#5B6472] text-[11px] font-normal truncate">
            {subtitle || "Current period"}
          </span>
        )}

        <span className="text-[10px] text-[#8A93A3] font-normal shrink-0">UXI HQ</span>
      </div>
    </div>
  );
}
