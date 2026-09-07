"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, Sparkles, ArrowLeft, Layers, ShieldCheck, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModulePlaceholderProps {
  title: string;
  subtitle: string;
  description: string;
  phase: string;
  icon: LucideIcon;
  features: string[];
  dbTable: string;
}

export function ModulePlaceholder({
  title,
  subtitle,
  description,
  phase,
  icon: Icon,
  features,
  dbTable,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#1E2536] bg-gradient-to-r from-[#0D121F] to-[#090C14] shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(0,132,255,0.15)]">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
              <Badge variant="glow" className="text-[10px] font-mono">
                {phase}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="rounded-2xl border border-[#1E2536] bg-[#0A0D16]/95 p-8 shadow-xl text-center flex flex-col items-center justify-center max-w-3xl mx-auto py-12">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Icon className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">
          {title} Module Architecture Ready
        </h3>

        <p className="text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
          {description}
        </p>

        {/* Database & Schema Readiness Box */}
        <div className="mt-8 w-full max-w-md p-4 rounded-xl bg-[#0E1320] border border-[#1E273A] text-left">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E273A]/80 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" /> PostgreSQL Table:
            </span>
            <span className="font-mono text-blue-300 font-semibold">
              public.{dbTable}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Table schema, indexes & RLS policies provisioned</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full TypeScript interfaces & database definitions defined</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Interactive UI and CRUD actions queued for Phase 2</span>
            </div>
          </div>
        </div>

        {/* Upcoming Module Capabilities */}
        <div className="mt-6 w-full max-w-md text-left">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Upcoming Features in Next Phase:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111724] border border-[#1B2232] text-xs text-slate-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
