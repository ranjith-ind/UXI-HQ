"use client";

import React from "react";
import Link from "next/link";
import { FolderPlus, UserPlus, CheckSquare, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      <Link href="/projects">
        <Button variant="default" size="sm" className="gap-2 shadow-sm font-semibold">
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </Link>

      <Link href="/clients">
        <Button variant="secondary" size="sm" className="gap-2 font-semibold">
          <UserPlus className="w-4 h-4 text-slate-500" />
          <span>New Client</span>
        </Button>
      </Link>

      <Link href="/tasks">
        <Button variant="secondary" size="sm" className="gap-2 font-semibold">
          <CheckSquare className="w-4 h-4 text-slate-500" />
          <span>Create Task</span>
        </Button>
      </Link>

      <Link href="/finance/invoices">
        <Button variant="secondary" size="sm" className="gap-2 hidden sm:inline-flex font-semibold">
          <PlusCircle className="w-4 h-4 text-slate-500" />
          <span>New Invoice</span>
        </Button>
      </Link>
    </div>
  );
}
