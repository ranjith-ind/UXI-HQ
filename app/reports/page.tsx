"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Executive Reports & Telemetry"
      subtitle="Operational performance metrics, developer velocity, and business summaries"
      description="The Reports module will generate high-level executive summaries and operational audit reports for company reviews, client presentations, and business intelligence."
      phase="Queued for Phase 2"
      icon={BarChart3}
      dbTable="activity_logs"
      features={[
        "Monthly Company Scorecard",
        "Developer Velocity & Throughput",
        "Client Satisfaction Telemetry",
        "Automated Email Digests",
        "PDF Executive Briefing Exports",
        "Custom KPI Query Builder",
      ]}
    />
  );
}
