"use client";

import { IndianRupee, Inbox, Search, ShieldCheck, Stethoscope, TestTube } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { fetchOrders, relativeTime } from "@/lib/orders/service";
import type { OrderRecord } from "@/lib/orders/types";

type BookingKind = "test" | "consult" | "insurance";
type Booking = Extract<OrderRecord, { kind: BookingKind }>;

const KIND_META: Record<BookingKind, { label: string; plural: string; icon: React.ComponentType<{ className?: string }> }> = {
  test: { label: "Lab test", plural: "Lab tests", icon: TestTube },
  consult: { label: "Consult", plural: "Consults", icon: Stethoscope },
  insurance: { label: "Insurance", plural: "Insurance", icon: ShieldCheck },
};

type Tone = "progress" | "success" | "danger";
const TONE: Record<Tone, { cls: string; dot: string }> = {
  progress: { cls: "bg-[#c79a3d]/14 text-[#9c7426]", dot: "bg-[#c79a3d]" },
  success: { cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  danger: { cls: "bg-[#c14040]/10 text-[#c14040]", dot: "bg-[#c14040]" },
};

function statusInfo(b: Booking): { label: string; tone: Tone } {
  if (b.kind === "test") return b.status === "result_published" ? { label: "Report ready", tone: "success" } : { label: "In progress", tone: "progress" };
  if (b.kind === "consult") return b.status === "completed" ? { label: "Completed", tone: "success" } : b.status === "cancelled" ? { label: "Cancelled", tone: "danger" } : { label: "Upcoming", tone: "progress" };
  return b.status === "active" ? { label: "Active", tone: "success" } : { label: "Pending", tone: "progress" };
}
function title(b: Booking): string {
  if (b.kind === "test") return `${b.vendorName}, ${b.tests[0]?.name ?? "Lab test"}`;
  if (b.kind === "consult") return `${b.doctor.name}, ${b.doctor.specialtyLabel}`;
  return `${b.insurer} health cover`;
}
function customer(b: Booking): string {
  return b.kind === "insurance" ? "Jane Sharma" : b.patient.fullName;
}

type Filter = "all" | BookingKind;

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchOrders().then((all) => setBookings(all.filter((o): o is Booking => o.kind === "test" || o.kind === "consult" || o.kind === "insurance")));
  }, []);

  const report = useMemo(() => {
    const r = { test: { n: 0, rev: 0 }, consult: { n: 0, rev: 0 }, insurance: { n: 0, rev: 0 } };
    for (const b of bookings ?? []) { r[b.kind].n += 1; if (statusInfo(b).tone !== "danger") r[b.kind].rev += b.total; }
    return r;
  }, [bookings]);
  const totalRev = report.test.rev + report.consult.rev + report.insurance.rev;

  const counts = useMemo(() => ({
    all: bookings?.length ?? 0,
    test: report.test.n, consult: report.consult.n, insurance: report.insurance.n,
  }), [bookings, report]);

  const filtered = useMemo(() => {
    if (!bookings) return [];
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => (filter === "all" ? true : b.kind === filter))
      .filter((b) => !q || title(b).toLowerCase().includes(q) || b.reference.toLowerCase().includes(q) || customer(b).toLowerCase().includes(q));
  }, [bookings, filter, query]);

  return (
    <>
      <AdminTopbar title="Bookings" subtitle="Lab tests, doctor consults, and insurance bookings across the platform." />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Report */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SectionTile label="Total revenue" value={`₹${totalRev.toLocaleString()}`} sub={`${counts.all} bookings`} icon={IndianRupee} accent />
          <SectionTile label="Lab tests" value={String(report.test.n)} sub={`₹${report.test.rev.toLocaleString()}`} icon={TestTube} />
          <SectionTile label="Consults" value={String(report.consult.n)} sub={`₹${report.consult.rev.toLocaleString()}`} icon={Stethoscope} />
          <SectionTile label="Insurance" value={String(report.insurance.n)} sub={`₹${report.insurance.rev.toLocaleString()}`} icon={ShieldCheck} />
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "test", "consult", "insurance"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${filter === f ? "bg-[#006E42] text-white" : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"}`}>
                {f === "all" ? "All" : KIND_META[f].plural}
                <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${filter === f ? "bg-white/15" : "bg-[#0f3a26]/8"}`}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ref, name, customer…" className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none" />
          </div>
        </div>

        {/* List */}
        {!bookings ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-white p-14 text-center ring-1 ring-[#0f3a26]/8">
            <Inbox className="h-7 w-7 text-[#0f3a26]/30" />
            <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">No bookings</p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {filtered.map((b, i) => {
              const Icon = KIND_META[b.kind].icon;
              const s = statusInfo(b);
              return (
                <li key={b.id} className={`flex items-center gap-4 px-4 py-3 ${i === 0 ? "" : "border-t border-[#0f3a26]/6"}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{title(b)}</p>
                    <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/50">{b.reference} · {KIND_META[b.kind].label} · {customer(b)}</p>
                  </div>
                  <span className="hidden w-24 text-[11.5px] text-[#0f3a26]/50 md:inline">{relativeTime(b.placedAt)}</span>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${TONE[s.tone].cls}`}><span className={`h-1.5 w-1.5 rounded-full ${TONE[s.tone].dot}`} />{s.label}</span>
                  <span className="w-24 text-right text-[13px] font-bold tabular-nums text-[#0f3a26]">₹{b.total.toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function SectionTile({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${accent ? "bg-[#006E42] ring-[#006E42]" : "bg-white ring-[#0f3a26]/8"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${accent ? "text-[#9af2c4]" : "text-[#0f3a26]/45"}`}>{label}</p>
        <Icon className={`h-4 w-4 ${accent ? "text-[#9af2c4]" : "text-[#006E42]"}`} />
      </div>
      <p className={`mt-2 text-[24px] font-bold tabular-nums tracking-tight ${accent ? "text-white" : "text-[#0f3a26]"}`}>{value}</p>
      <p className={`mt-0.5 text-[11px] ${accent ? "text-white/70" : "text-[#0f3a26]/50"}`}>{sub}</p>
    </div>
  );
}
