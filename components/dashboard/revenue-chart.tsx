"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; target: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 h-72 flex items-center justify-center">
        <span className="text-xs text-[#8A93A3] font-medium">Loading revenue trajectory...</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E6EAF2]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#F7F9FC] text-[#5B6472] border border-[#E6EAF2]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] tracking-tight">
              Revenue Trajectory
            </h3>
            <p className="text-xs text-[#5B6472]">
              Monthly recognized revenue vs milestone targets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2451EB]" />
            <span className="text-slate-700 font-medium">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-[#5B6472] font-normal">Target</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2451EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2451EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="targetGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8A93A3" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#8A93A3" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6EAF2" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#8A93A3"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E6EAF2" }}
            />
            <YAxis
              stroke="#8A93A3"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E6EAF2" }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-[#E6EAF2] bg-white p-3 shadow-dropdown">
                      <p className="text-xs font-semibold text-[#0F172A] mb-1">{label} 2026</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-4 text-[#2451EB] font-semibold">
                          <span>Revenue:</span>
                          <span className="font-tabular">
                            {formatCurrency(payload[0]?.value as number, "INR")}
                          </span>
                        </div>
                        {payload[1] && (
                          <div className="flex items-center justify-between gap-4 text-[#5B6472]">
                            <span>Target:</span>
                            <span className="font-tabular font-medium">
                              {formatCurrency(payload[1]?.value as number, "INR")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2451EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradLight)"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#8A93A3"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#targetGradLight)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
