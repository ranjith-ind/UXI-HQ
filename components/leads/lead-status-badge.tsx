import React from "react";
import { LeadStatus } from "@/types/lead";
import {
  Sparkles,
  PhoneCall,
  CheckCircle,
  MessageSquare,
  FileText,
  Send,
  Handshake,
  Trophy,
  XCircle,
  PauseCircle,
} from "lucide-react";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  New: {
    label: "New",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Sparkles,
  },
  Contacted: {
    label: "Contacted",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    icon: PhoneCall,
  },
  Qualified: {
    label: "Qualified",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: CheckCircle,
  },
  Discussion: {
    label: "Discussion",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: MessageSquare,
  },
  "Requirement Gathering": {
    label: "Requirements",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    icon: FileText,
  },
  "Proposal Sent": {
    label: "Proposal Sent",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Send,
  },
  Negotiation: {
    label: "Negotiation",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: Handshake,
  },
  Won: {
    label: "Won & Closed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: Trophy,
  },
  Lost: {
    label: "Lost",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
  "On Hold": {
    label: "On Hold",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: PauseCircle,
  },
};

export function LeadStatusBadge({ status, size = "sm" }: LeadStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.New;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs font-sans ${
        config.bg
      } ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      <Icon className={size === "sm" ? "w-2.5 h-2.5" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      <span className="font-semibold">{config.label}</span>
    </span>
  );
}
