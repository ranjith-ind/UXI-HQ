"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, ArrowUpRight } from "lucide-react";
import { ProjectProfitability } from "@/types/profitability";
import { formatCurrency, cn } from "@/lib/utils";

import { DataTable } from "@/components/ui/data-table";

interface ProjectProfitabilityTableProps {
  projects: ProjectProfitability[];
}

export function ProjectProfitabilityTable({ projects }: ProjectProfitabilityTableProps) {
  if (projects.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-[#E6EAF2] bg-white">
        <p className="text-xs text-[#5B6472] italic">No projects found to calculate profitability.</p>
      </div>
    );
  }

  return (
    <DataTable className="font-sans">
      <div className="flex items-center justify-between p-5 border-b border-[#E6EAF2]">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-[#2451EB]" />
          <h3 className="text-sm font-bold text-[#0F172A]">Project Profitability Rankings</h3>
        </div>
        <span className="text-xs text-[#5B6472] font-semibold font-tabular">
          {projects.length} Active Projects
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs saas-table">
          <thead className="bg-[#F7F9FC] text-[11px] font-semibold uppercase tracking-wider text-[#5B6472] border-b border-[#E6EAF2]">
            <tr>
              <th scope="col" className="py-3.5 px-5">Project & Client</th>
              <th scope="col" className="py-3.5 px-4 text-right">Contract Value</th>
              <th scope="col" className="py-3.5 px-4 text-right">Realized Revenue</th>
              <th scope="col" className="py-3.5 px-4 text-right">Direct Expenses</th>
              <th scope="col" className="py-3.5 px-4 text-right">Net Profit</th>
              <th scope="col" className="py-3.5 px-5 text-right">Profit Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EAF2]">
            {projects.map((proj) => {
              const isHighMargin = proj.profitMargin >= 60;
              const isLowMargin = proj.profitMargin < 30 && proj.revenue > 0;

              return (
                <tr key={proj.projectId} className="hover:bg-[#F7F9FC] transition-colors group">
                  <td className="py-3.5 px-5">
                    <div>
                      <Link
                        href={`/projects/${proj.projectId}`}
                        className="font-semibold text-[#0F172A] group-hover:text-[#2451EB] flex items-center gap-1.5 truncate"
                      >
                        <span className="truncate">{proj.projectName}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-[10px] text-[#5B6472] truncate mt-0.5">
                        {proj.projectCode} • {proj.clientName}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-[#0F172A] font-tabular">
                    {formatCurrency(proj.contractValue, "INR")}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0F172A] font-tabular">
                    {formatCurrency(proj.revenue, "INR")}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-tabular">
                    {formatCurrency(proj.expenses, "INR")}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0F172A] font-tabular">
                    {formatCurrency(proj.profit, "INR")}
                  </td>

                  <td className="py-3.5 px-5 text-right font-tabular">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold border",
                        isHighMargin
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isLowMargin
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-[#EFF4FE] text-[#2451EB] border-[#2451EB]/20"
                      )}
                    >
                      {proj.profitMargin}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DataTable>
  );
}
