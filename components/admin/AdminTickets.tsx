"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bug,
  Check,
  CreditCard,
  HelpCircle,
  Inbox,
  LifeBuoy,
  Loader2,
  RotateCcw,
  Search,
  Send,
  ShoppingBag,
  Stethoscope,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { relTime } from "@/lib/account/service";
import {
  type Ticket,
  type TicketCategory,
  type TicketStatus,
  TICKET_CATEGORY_LABEL,
  agentReplyToTicket,
  fetchTickets,
  setTicketStatus,
} from "@/lib/support/service";

const CATEGORY_ICON: Record<TicketCategory, React.ComponentType<{ className?: string }>> = {
  order: ShoppingBag,
  refund: RotateCcw,
  payment: CreditCard,
  appointment: Stethoscope,
  bug: Bug,
  account: LifeBuoy,
  other: HelpCircle,
};

const STATUS_META: Record<TicketStatus, { label: string; cls: string; dot: string }> = {
  open: { label: "Open", cls: "bg-[#0f3a26]/6 text-[#0f3a26]/70", dot: "bg-[#0f3a26]/40" },
  in_progress: { label: "In progress", cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  awaiting_you: { label: "Awaiting customer", cls: "bg-[#c79a3d]/14 text-[#9c7426]", dot: "bg-[#c79a3d]" },
  resolved: { label: "Resolved", cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  closed: { label: "Closed", cls: "bg-[#0f3a26]/6 text-[#0f3a26]/45", dot: "bg-[#0f3a26]/30" },
};

const PRIORITY_META: Record<Ticket["priority"], { label: string; cls: string }> = {
  low: { label: "Low", cls: "text-[#0f3a26]/50" },
  normal: { label: "Normal", cls: "text-[#006E42]" },
  high: { label: "High", cls: "text-[#c14040]" },
};

type Filter = "all" | TicketStatus;
const FILTERS: Filter[] = ["all", "open", "in_progress", "awaiting_you", "resolved", "closed"];
const STATUS_CHOICES: TicketStatus[] = ["open", "in_progress", "awaiting_you", "resolved", "closed"];

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets().then(setTickets);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets?.length ?? 0 };
    for (const t of tickets ?? []) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tickets]);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    return tickets
      .filter((t) => (filter === "all" ? true : t.status === filter))
      .filter((t) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          t.subject.toLowerCase().includes(q) ||
          t.ref.toLowerCase().includes(q) ||
          t.requester.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [tickets, filter, query]);

  const selected = tickets?.find((t) => t.id === selectedId) ?? null;
  const waiting = (counts.open ?? 0) + (counts.in_progress ?? 0);

  return (
    <>
      <AdminTopbar title="Support tickets" subtitle="Read, reply to, and resolve member tickets." />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Filters + search */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${
                  filter === f ? "bg-[#006E42] text-white" : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"
                }`}
              >
                {f === "all" ? "All" : STATUS_META[f].label}
                <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${filter === f ? "bg-white/15" : "bg-[#0f3a26]/8"}`}>{counts[f] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subject, ref, member…" className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none" />
          </div>
        </div>

        {waiting > 0 && filter === "all" && (
          <p className="mb-4 text-[12.5px] text-[#0f3a26]/55">
            <span className="font-semibold text-[#006E42]">{waiting}</span> ticket{waiting === 1 ? "" : "s"} need a response.
          </p>
        )}

        {/* List */}
        {!tickets ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-white p-14 text-center ring-1 ring-[#0f3a26]/8">
            <Inbox className="h-7 w-7 text-[#0f3a26]/30" />
            <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">No tickets</p>
            <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">Member tickets appear here as they are raised.</p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {filtered.map((t, i) => {
              const Icon = CATEGORY_ICON[t.category];
              const sm = STATUS_META[t.status];
              const pm = PRIORITY_META[t.priority];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-[#0f3a26]/[0.02] ${i > 0 ? "border-t border-[#0f3a26]/6" : ""}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]"><Icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{t.subject}</p>
                      <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/50">{t.ref} · {t.requester} · {TICKET_CATEGORY_LABEL[t.category]}</p>
                    </div>
                    <span className={`hidden text-[11px] font-semibold sm:inline ${pm.cls}`}>{pm.label}</span>
                    <span className="hidden w-24 text-right text-[10.5px] text-[#0f3a26]/45 lg:inline">{relTime(t.updatedAt)}</span>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${sm.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />{sm.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <TicketDrawer
        ticket={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={(list) => setTickets(list)}
      />
    </>
  );
}

function TicketDrawer({ ticket, onClose, onUpdate }: { ticket: Ticket | null; onClose: () => void; onUpdate: (l: Ticket[]) => void }) {
  const reduce = useReducedMotion();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  // Start with an empty reply for each ticket shown.
  const [seenTicket, setSeenTicket] = useState<Ticket | null>(null);
  if (ticket && ticket !== seenTicket) {
    setSeenTicket(ticket);
    setReply("");
  }

  useEffect(() => {
    if (!ticket) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ticket, onClose]);

  async function send() {
    if (!ticket || !reply.trim() || busy) return;
    setBusy(true);
    const list = await agentReplyToTicket(ticket.id, reply);
    setBusy(false);
    setReply("");
    onUpdate(list);
  }
  async function changeStatus(s: TicketStatus) {
    if (!ticket) return;
    onUpdate(await setTicketStatus(ticket.id, s));
  }

  const Icon = ticket ? CATEGORY_ICON[ticket.category] : HelpCircle;

  return (
    <AnimatePresence>
      {ticket && (
        <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[#0c1614]/35" onClick={onClose} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Ticket ${ticket.ref}`}
            className="relative flex h-full w-full max-w-[460px] flex-col bg-[#fbfdfb] shadow-2xl"
            initial={reduce ? false : { x: 40, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-[#0f3a26]/8 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold leading-snug text-[#0f3a26]">{ticket.subject}</p>
                <p className="mt-0.5 text-[11px] text-[#0f3a26]/50">{ticket.ref} · {ticket.requester} · {TICKET_CATEGORY_LABEL[ticket.category]}{ticket.related ? ` · ${ticket.related}` : ""}</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#0f3a26]/50 transition hover:bg-[#0f3a26]/6 hover:text-[#0f3a26]"><X className="h-4 w-4" /></button>
            </div>

            {/* Status control */}
            <div className="border-b border-[#0f3a26]/8 p-4">
              <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_CHOICES.map((s) => {
                  const active = ticket.status === s;
                  return (
                    <button key={s} onClick={() => changeStatus(s)} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${active ? `${STATUS_META[s].cls} ring-1 ring-inset ring-[#006E42]/20` : "bg-white text-[#0f3a26]/55 ring-1 ring-inset ring-[#0f3a26]/8 hover:ring-[#006E42]/25"}`}>
                      {active && <Check className="h-3 w-3" />}{STATUS_META[s].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thread */}
            <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto p-4">
              {ticket.messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "agent" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${m.from === "agent" ? "bg-[#006E42] text-white" : "bg-white text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/8"}`}>
                    <p className={`flex items-center gap-1.5 text-[10px] font-semibold ${m.from === "agent" ? "text-[#9af2c4]" : "text-[#006E42]"}`}>
                      {m.from === "you" && <span className="grid h-4 w-4 place-items-center rounded-full bg-[#006E42] text-[7px] text-white">{initials(m.author === "You" ? ticket.requester : m.author)}</span>}
                      {m.from === "you" ? ticket.requester : m.author} · {relTime(m.at)}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply as agent */}
            <div className="border-t border-[#0f3a26]/8 p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Reply to the member…"
                  className="min-h-[46px] flex-1 resize-y rounded-xl border border-[#0f3a26]/10 bg-white px-3 py-2.5 text-[12.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
                />
                <button onClick={send} disabled={!reply.trim() || busy} className="inline-flex h-[46px] shrink-0 items-center gap-1.5 rounded-xl bg-[#006E42] px-4 text-[12.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-45">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Send
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <button onClick={() => changeStatus("resolved")} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42]/8 px-3 py-1.5 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/14"><Check className="h-3.5 w-3.5" />Mark resolved</button>
                <p className="text-[10.5px] text-[#0f3a26]/45">Replying sets status to Awaiting customer.</p>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
