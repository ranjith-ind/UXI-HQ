"use client";

import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertEmptyStateProps {
  onScan?: () => void;
  scanning?: boolean;
}

export function AlertEmptyState({ onScan, scanning }: AlertEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-sm space-y-3 font-sans">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 font-display">All Systems Operational</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
        No business issues or risk threshold alerts detected. All tasks, deadlines, invoices, and workloads are on track.
      </p>
      {onScan && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onScan}
            disabled={scanning}
            className="gap-1.5 text-xs font-semibold"
          >
            <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${scanning ? "animate-spin" : ""}`} />
            <span>{scanning ? "Scanning Engine..." : "Run Diagnostic Scan"}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
