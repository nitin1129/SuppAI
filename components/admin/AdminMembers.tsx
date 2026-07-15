"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ban, Inbox, Loader2, PauseCircle, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  type Member,
  type MemberStatus,
  STATUS_META,
  fetchMembers,
  initials,
  setMemberStatus,
} from "@/lib/admin/members";

type Filter = "all" | MemberStatus;

export function AdminMembers() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { fetchMembers().then(setMembers); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: members?.length ?? 0, active: 0, suspended: 0, on_hold: 0, banned: 0 };
    for (const m of members ?? []) c[m.status] += 1;
    return c;
  }, [members]);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => (filter === "all" ? true : m.status === filter))
      .filter((m) => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.city.toLowerCase().includes(q));
  }, [members, filter, query]);

  const selected = members?.find((m) => m.id === selectedId) ?? null;

  return (
    <>
      <AdminTopbar title="Members" subtitle="Every end user on SuppAI. Manage account access and standing." />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "active", "on_hold", "suspended", "banned"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${filter === f ? "bg-[#006E42] text-white" : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"}`}>
                {f === "all" ? "All" : STATUS_META[f].label}
                <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${filter === f ? "bg-white/15" : "bg-[#0f3a26]/8"}`}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, city…" className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none" />
          </div>
        </div>

        {!members ? (
          <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-white p-14 text-center ring-1 ring-[#0f3a26]/8">
            <Inbox className="h-7 w-7 text-[#0f3a26]/30" />
            <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">No members</p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {filtered.map((m, i) => {
              const s = STATUS_META[m.status];
              return (
                <li key={m.id}>
                  <button onClick={() => setSelectedId(m.id)} className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[#0f3a26]/[0.02] ${i === 0 ? "" : "border-t border-[#0f3a26]/6"}`}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#006E42] text-[12px] font-bold text-white">{initials(m.name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{m.name}</p>
                      <p className="truncate text-[10.5px] text-[#0f3a26]/50">{m.email} · {m.city}</p>
                    </div>
                    <span className="hidden w-28 text-[11.5px] text-[#0f3a26]/55 md:inline">{m.orders} orders</span>
                    <span className="hidden w-24 text-right text-[11.5px] tabular-nums text-[#0f3a26]/55 lg:inline">₹{m.spend.toLocaleString()}</span>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${s.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <MemberDrawer member={selected} onClose={() => setSelectedId(null)} onUpdate={setMembers} />
    </>
  );
}

function MemberDrawer({ member, onClose, onUpdate }: { member: Member | null; onClose: () => void; onUpdate: (list: Member[]) => void }) {
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [banning, setBanning] = useState(false);
  const [checks, setChecks] = useState({ history: false, permanent: false, irreversible: false });

  useEffect(() => {
    if (!member) return;
    setReason(""); setBanning(false); setChecks({ history: false, permanent: false, irreversible: false });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [member, onClose]);

  if (!member) return <AnimatePresence />;
  const m = member;
  const s = STATUS_META[m.status];

  async function apply(status: MemberStatus, r?: string) {
    setBusy(true);
    onUpdate(await setMemberStatus(m.id, status, r));
    setBusy(false);
    onClose();
  }

  const banReady = reason.trim().length >= 10 && checks.history && checks.permanent && checks.irreversible;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        <div className="absolute inset-0 bg-[#0c1614]/35" onClick={onClose} aria-hidden />
        <motion.aside role="dialog" aria-modal="true" aria-label={m.name} className="relative flex h-full w-full max-w-[440px] flex-col bg-[#fbfdfb] shadow-2xl" initial={reduce ? false : { x: 44, opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { x: 44, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-start gap-3 border-b border-[#0f3a26]/8 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#006E42] text-[14px] font-bold text-white">{initials(m.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-[#0f3a26]">{m.name}</p>
              <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/55">{m.email} · +91 {m.phone}</p>
              <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}</span>
            </div>
            <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#0f3a26]/50 transition hover:bg-[#0f3a26]/6 hover:text-[#0f3a26]"><X className="h-4 w-4" /></button>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto p-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[#f1f7f3] p-3.5 text-[12px] ring-1 ring-inset ring-[#0f3a26]/[0.08]">
              <div className="flex justify-between"><dt className="text-[#0f3a26]/55">City</dt><dd className="font-semibold text-[#0f3a26]">{m.city}</dd></div>
              <div className="flex justify-between"><dt className="text-[#0f3a26]/55">Joined</dt><dd className="font-semibold text-[#0f3a26]">{new Date(m.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</dd></div>
              <div className="flex justify-between"><dt className="text-[#0f3a26]/55">Orders</dt><dd className="font-semibold text-[#0f3a26]">{m.orders}</dd></div>
              <div className="flex justify-between"><dt className="text-[#0f3a26]/55">Lifetime spend</dt><dd className="font-semibold text-[#0f3a26]">₹{m.spend.toLocaleString()}</dd></div>
            </dl>
            {m.status !== "active" && m.statusReason && (
              <p className={`mt-4 rounded-lg px-3 py-2 text-[11.5px] font-medium ${m.status === "banned" ? "bg-[#c14040]/8 text-[#c14040]" : "bg-[#c79a3d]/10 text-[#9c7426]"}`}>
                {s.label}: {m.statusReason}
              </p>
            )}
          </div>

          <div className="border-t border-[#0f3a26]/8 p-4">
            {!banning ? (
              <>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Account access</p>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required for suspend / hold)" className="mb-2.5 w-full rounded-lg border border-[#0f3a26]/12 bg-white px-3 py-2 text-[12.5px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => apply("active")} disabled={busy || m.status === "active"} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#006E42]/8 px-3 py-2 text-[12px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/14 disabled:opacity-40"><ShieldCheck className="h-3.5 w-3.5" />Activate</button>
                  <button onClick={() => reason.trim() && apply("on_hold", reason.trim())} disabled={busy || !reason.trim()} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#c79a3d]/12 px-3 py-2 text-[12px] font-semibold text-[#9c7426] transition hover:bg-[#c79a3d]/20 disabled:opacity-40"><PauseCircle className="h-3.5 w-3.5" />Put on hold</button>
                  <button onClick={() => reason.trim() && apply("suspended", reason.trim())} disabled={busy || !reason.trim()} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#c79a3d]/12 px-3 py-2 text-[12px] font-semibold text-[#9c7426] transition hover:bg-[#c79a3d]/20 disabled:opacity-40"><PauseCircle className="h-3.5 w-3.5" />Suspend</button>
                  <button onClick={() => setBanning(true)} disabled={busy || m.status === "banned"} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-[#c14040] ring-1 ring-inset ring-[#c14040]/25 transition hover:bg-[#c14040]/6 disabled:opacity-40"><Ban className="h-3.5 w-3.5" />Ban forever</button>
                </div>
              </>
            ) : (
              <div>
                <p className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#c14040]"><Ban className="h-4 w-4" />Ban {m.name} permanently</p>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="State the reason (at least 10 characters). This is recorded." className="w-full resize-none rounded-lg border border-[#c14040]/30 bg-white px-3 py-2 text-[12.5px] text-[#0f3a26] focus:border-[#c14040]/50 focus:outline-none focus:ring-2 focus:ring-[#c14040]/15" />
                <p className="mt-1 text-[10.5px] text-[#0f3a26]/45">{reason.trim().length}/10 characters minimum.</p>
                <div className="mt-3 space-y-2">
                  {[
                    { k: "history" as const, label: "I have reviewed this member's order and dispute history." },
                    { k: "permanent" as const, label: "I confirm a permanent ban is warranted." },
                    { k: "irreversible" as const, label: "I understand this blocks all access and cannot be self-undone." },
                  ].map((c) => (
                    <label key={c.k} className="flex items-start gap-2.5 text-[11.5px] text-[#0f3a26]/75">
                      <input type="checkbox" checked={checks[c.k]} onChange={(e) => setChecks((cur) => ({ ...cur, [c.k]: e.target.checked }))} className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[#0f3a26]/30 text-[#c14040] focus:ring-[#c14040]" />
                      {c.label}
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => apply("banned", reason.trim())} disabled={!banReady || busy} className="inline-flex items-center gap-1.5 rounded-lg bg-[#c14040] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#a83535] disabled:opacity-45">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}Confirm permanent ban</button>
                  <button onClick={() => setBanning(false)} className="rounded-lg px-3 py-2 text-[12px] font-medium text-[#0f3a26]/55 hover:bg-[#0f3a26]/5">Back</button>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}
