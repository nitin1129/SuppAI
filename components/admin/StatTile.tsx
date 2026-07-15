"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import type { AdminMetric } from "@/lib/admin/types";

export function StatTile({ metric }: { metric: AdminMetric }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/50">
        {metric.label}
      </p>
      <p className="mt-2 text-[26px] font-bold leading-none tabular-nums text-[#0f3a26]">
        {metric.value}
      </p>
      <div className="mt-3 flex items-center gap-2 text-[11.5px] text-[#0f3a26]/55">
        {metric.delta && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
              metric.delta.dir === "up"
                ? "bg-[#006E42]/8 text-[#006E42]"
                : "bg-[#c14040]/10 text-[#c14040]"
            }`}
          >
            {metric.delta.dir === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {metric.delta.pct.toFixed(1)}%
          </span>
        )}
        {metric.hint && <span>{metric.hint}</span>}
      </div>
    </div>
  );
}
