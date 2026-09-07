import React from "react";
import { SalesPipelineStats } from "@/types/sales";
import { formatCurrency } from "@/lib/utils";
import { Layers } from "lucide-react";

interface SalesFunnelProps {
  stats: SalesPipelineStats;
}

export function SalesFunnel({ stats }: SalesFunnelProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 font-display">Sales Pipeline Funnel Distribution</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-500">
            Total Pipeline: <strong className="text-slate-900">{formatCurrency(stats.totalPipelineValue, "INR")}</strong>
          </span>
          <span className="text-slate-500">
            Weighted: <strong className="text-blue-700">{formatCurrency(stats.totalWeightedValue, "INR")}</strong>
          </span>
        </div>
      </div>

      {/* Funnel Progress Bars */}
      <div className="space-y-3">
        {stats.stages.map((st, idx) => {
          const maxWidth = Math.max(8, st.percentageOfPipeline);

          return (
            <div key={st.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold w-4 font-mono">{idx + 1}.</span>
                  <span className="font-bold text-slate-900 font-display">{st.label}</span>
                  <span className="text-[10px] text-slate-500">({st.count} leads)</span>
                </div>
                <div className="flex items-center gap-3 text-right font-mono">
                  <span className="font-bold text-slate-900">
                    {formatCurrency(st.totalValue, "INR")}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold w-12 text-right">
                    {st.percentageOfPipeline}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${maxWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
