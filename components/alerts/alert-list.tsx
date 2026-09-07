"use client";

import React from "react";
import { BusinessAlertWithDetails } from "@/types/alert";
import { AlertCard } from "./alert-card";
import { AlertEmptyState } from "./alert-empty-state";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface AlertListProps {
  alerts: BusinessAlertWithDetails[];
  onResolve: (id: string) => Promise<void>;
  onScan?: () => void;
  scanning?: boolean;
}

export function AlertList({ alerts, onResolve, onScan, scanning }: AlertListProps) {
  if (alerts.length === 0) {
    return <AlertEmptyState onScan={onScan} scanning={scanning} />;
  }

  const criticalList = alerts.filter((a) => a.severity === "Critical");
  const warningList = alerts.filter((a) => a.severity === "Warning");
  const infoList = alerts.filter((a) => a.severity === "Info");

  const renderSection = (
    title: string,
    list: BusinessAlertWithDetails[],
    Icon: React.ComponentType<{ className?: string }>,
    colorClass: string
  ) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-3 font-mono">
        <div className="flex items-center gap-2 pb-1 border-b border-[#1E2536]">
          <Icon className={`w-4 h-4 ${colorClass}`} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {title} ({list.length})
          </span>
        </div>
        <div className="space-y-2.5">
          {list.map((a) => (
            <AlertCard key={a.id} alert={a} onResolve={onResolve} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSection("Critical Alerts", criticalList, AlertCircle, "text-rose-400")}
      {renderSection("Warnings", warningList, AlertTriangle, "text-amber-400")}
      {renderSection("Informational Notices", infoList, Info, "text-blue-400")}
    </div>
  );
}
