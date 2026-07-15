"use client";

import { BarChart3, FileText, Inbox, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { ReportsDrawer } from "@/components/admin/onboarding/ReportsDrawer";
import { ReviewDrawer } from "@/components/admin/onboarding/ReviewDrawer";
import { fetchApplications } from "@/lib/onboarding/service";
import type { Application, AppStatus, PartnerKind, StepDef } from "@/lib/onboarding/types";
import { STATUS_LABELS } from "@/lib/onboarding/types";

type Filter = "all" | AppStatus;

const FILTERS: Filter[] = [
  "all",
  "submitted",
  "under_review",
  "on_hold",
  "active",
  "rejected",
];

export function OnboardingList({
  kind,
  steps,
  title,
  subtitle,
}: {
  kind: PartnerKind;
  steps: StepDef[];
  title: string;
  subtitle: string;
}) {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [reportsFor, setReportsFor] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications(kind).then(setApps);
  }, [kind]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps?.length ?? 0 };
    for (const a of apps ?? []) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [apps]);

  const filtered = useMemo(() => {
    if (!apps) return [];
    return apps
      .filter((a) => (filter === "all" ? true : a.status === filter))
      .filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          a.displayName.toLowerCase().includes(q) ||
          a.reference.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  }, [apps, filter, query]);

  function onChange(updated: Application) {
    setApps((cur) => (cur ? cur.map((a) => (a.id === updated.id ? updated : a)) : cur));
    setSelected(updated);
  }

  const pending = (counts.submitted ?? 0) + (counts.under_review ?? 0);

  return (
    <>
      <AdminTopbar title={title} subtitle={subtitle} />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Filters + search */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${
                  filter === f
                    ? "bg-[#006E42] text-white"
                    : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"
                }`}
              >
                {f === "all" ? "All" : STATUS_LABELS[f]}
                <span
                  className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                    filter === f ? "bg-white/15" : "bg-[#0f3a26]/8"
                  }`}
                >
                  {counts[f] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, ref, location…"
              className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
            />
          </div>
        </div>

        {pending > 0 && filter === "all" && (
          <p className="mb-4 text-[12.5px] text-[#0f3a26]/55">
            <span className="font-semibold text-[#006E42]">{pending}</span> application
            {pending === 1 ? "" : "s"} waiting for review.
          </p>
        )}

        {/* List */}
        {!apps ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-white p-14 text-center ring-1 ring-[#0f3a26]/8">
            <Inbox className="h-7 w-7 text-[#0f3a26]/30" />
            <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">No applications</p>
            <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">
              New {kind} applications appear here.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {filtered.map((a, i) => (
              <li
                key={a.id}
                className={`flex items-center gap-3 px-5 py-4 transition hover:bg-[#0f3a26]/[0.015] ${
                  i === filtered.length - 1 ? "" : "border-b border-[#0f3a26]/6"
                }`}
              >
                <button
                  onClick={() => setSelected(a)}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[11px] font-bold text-[#006E42]">
                    {initials(a.displayName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-[#0f3a26]">
                      {a.displayName}
                    </p>
                    <p className="text-[11.5px] text-[#0f3a26]/55">
                      {a.reference} · {a.location || "No location"}
                    </p>
                  </div>
                  <span className="hidden items-center gap-1 text-[11px] text-[#0f3a26]/45 sm:inline-flex">
                    <FileText className="h-3 w-3" />
                    {a.files.length} doc{a.files.length === 1 ? "" : "s"}
                  </span>
                  <span className="hidden text-[11.5px] text-[#0f3a26]/55 md:block">
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </span>
                </button>
                <StatusPill status={a.status} />
                {a.status === "active" && (
                  <button
                    onClick={() => setReportsFor(a)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#006E42]/8 px-3 py-1.5 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/15"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Reports
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <ReviewDrawer
        app={selected}
        steps={steps}
        onClose={() => setSelected(null)}
        onChange={onChange}
      />

      <ReportsDrawer app={reportsFor} onClose={() => setReportsFor(null)} />
    </>
  );
}

function StatusPill({ status }: { status: AppStatus }) {
  const tone: Record<AppStatus, string> = {
    draft: "bg-[#0f3a26]/8 text-[#0f3a26]/55",
    submitted: "bg-[#c79a3d]/15 text-[#9c7426]",
    under_review: "bg-[#3a72c1]/12 text-[#2a578f]",
    on_hold: "bg-[#c79a3d]/15 text-[#9c7426]",
    rejected: "bg-[#c14040]/10 text-[#c14040]",
    active: "bg-[#006E42]/12 text-[#006E42]",
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function initials(name: string) {
  return name
    .replace(/^(dr|prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
