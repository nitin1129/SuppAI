"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Bug,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Loader2,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  RotateCcw,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Ticket as TicketIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { relTime } from "@/lib/account/service";
import {
  HELP_CATEGORIES,
  REFUND_STEPS,
  type NewTicket,
  type RefundRequest,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
  TICKET_CATEGORY_LABEL,
  createTicket,
  fetchRefunds,
  fetchTickets,
  replyToTicket,
  setTicketStatus,
} from "@/lib/support/service";

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD = "rounded-3xl bg-white shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10";

const CATEGORY_ICON: Record<TicketCategory, React.ComponentType<{ className?: string }>> = {
  order: ShoppingBag,
  refund: RotateCcw,
  payment: CreditCard,
  appointment: Stethoscope,
  bug: Bug,
  account: LifeBuoy,
  other: HelpCircle,
};

const TICKET_STATUS: Record<TicketStatus, { label: string; cls: string; dot: string }> = {
  open: { label: "Open", cls: "bg-[#0f3a26]/6 text-[#0f3a26]/70", dot: "bg-[#0f3a26]/40" },
  in_progress: { label: "In progress", cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  awaiting_you: { label: "Needs your reply", cls: "bg-[#c79a3d]/14 text-[#9c7426]", dot: "bg-[#c79a3d]" },
  resolved: { label: "Resolved", cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  closed: { label: "Closed", cls: "bg-[#0f3a26]/6 text-[#0f3a26]/45", dot: "bg-[#0f3a26]/30" },
};


export function SupportView() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [refunds, setRefunds] = useState<RefundRequest[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets().then(setTickets);
    fetchRefunds().then(setRefunds);
  }, []);

  return (
    <div className="grid grid-cols-12 items-stretch gap-6 px-6 py-6 md:px-10">
      <Rise i={0} className="col-span-12 xl:col-span-8">
        <TicketComposer
          onCreated={(list, newId) => {
            setTickets(list);
            setExpandedId(newId);
          }}
        />
      </Rise>
      <Rise i={1} className="col-span-12 xl:col-span-4">
        <ContactCard />
      </Rise>

      <Rise i={2} className="col-span-12 xl:col-span-8">
        <TicketsPanel tickets={tickets} expandedId={expandedId} setExpandedId={setExpandedId} onUpdate={setTickets} />
      </Rise>
      <Rise i={3} className="col-span-12 xl:col-span-4">
        <RefundsPanel refunds={refunds} />
      </Rise>

      <Rise i={4} className="col-span-12">
        <HelpCentre />
      </Rise>
    </div>
  );
}

function Rise({ i, className, children }: { i: number; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : i * 0.06 }}
      className={`h-full ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

/* ============================== Raise ticket / report issue ============================== */

type Mode = "question" | "problem";

const QUICK: Record<Mode, { label: string; category: TicketCategory; subject: string }[]> = {
  question: [
    { label: "Refund status", category: "refund", subject: "Question about my refund status" },
    { label: "Where is my order", category: "order", subject: "Where is my order?" },
    { label: "Reschedule booking", category: "appointment", subject: "Need to reschedule my appointment" },
    { label: "Change address", category: "order", subject: "Change my delivery address" },
  ],
  problem: [
    { label: "App crashed", category: "bug", subject: "The app crashed on me" },
    { label: "Payment failed", category: "payment", subject: "Payment failed but money was deducted" },
    { label: "Wrong item", category: "order", subject: "I received the wrong item" },
    { label: "Report not loading", category: "bug", subject: "My lab report will not load" },
  ],
};

const CATEGORY_ORDER: TicketCategory[] = ["order", "refund", "payment", "appointment", "account", "bug", "other"];

function TicketComposer({ onCreated }: { onCreated: (list: Ticket[], newId: string) => void }) {
  const [mode, setMode] = useState<Mode>("question");
  const [category, setCategory] = useState<TicketCategory>("order");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [related, setRelated] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setCategory(next === "problem" ? "bug" : "order");
    setPriority(next === "problem" ? "high" : "normal");
    setDone(null);
  }

  function applyQuick(q: { category: TicketCategory; subject: string }) {
    setCategory(q.category);
    setSubject(q.subject);
    setDone(null);
  }

  const valid = subject.trim().length > 2 && body.trim().length > 4;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    const payload: NewTicket = { category, subject, body, priority, related };
    const list = await createTicket(payload);
    setBusy(false);
    onCreated(list, list[0].id);
    setDone(list[0].ref);
    setSubject("");
    setBody("");
    setRelated("");
    setFiles([]);
  }

  return (
    <section className={`${CARD} flex h-full flex-col p-6 md:p-7`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]">
          <TicketIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-[#0f3a26]">How can we help?</h2>
          <p className="mt-0.5 text-[12.5px] text-[#0f3a26]/55">Raise a ticket or report a problem. Our care team replies within a few hours.</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mt-5 inline-flex rounded-xl bg-[#0f3a26]/[0.05] p-1">
        {(["question", "problem"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`relative rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition ${mode === m ? "text-[#0f3a26]" : "text-[#0f3a26]/50 hover:text-[#0f3a26]/75"}`}
          >
            {mode === m && <motion.span layoutId="composerMode" className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-[#0f3a26]/8" transition={{ duration: 0.25, ease: EASE }} />}
            <span className="relative inline-flex items-center gap-1.5">{m === "question" ? <TicketIcon className="h-3.5 w-3.5" /> : <Bug className="h-3.5 w-3.5" />}{m === "question" ? "Raise a ticket" : "Report a problem"}</span>
          </button>
        ))}
      </div>

      {/* Quick chips */}
      <div className="mt-4">
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/40">Common {mode === "problem" ? "problems" : "requests"}</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK[mode].map((q) => (
            <button key={q.label} onClick={() => applyQuick(q)} className="inline-flex items-center gap-1 rounded-full bg-[#0f3a26]/[0.04] px-3 py-1.5 text-[12px] font-medium text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/8 transition hover:bg-[#006E42]/8 hover:text-[#006E42] hover:ring-[#006E42]/25">
              <Sparkles className="h-3 w-3" />{q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Category</span>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} className="w-full appearance-none rounded-xl border border-[#0f3a26]/[0.14] bg-[#f6faf7] shadow-[inset_0_1px_2px_rgba(15,58,38,0.04)] px-3.5 py-2.5 pr-9 text-[13.5px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15">
              {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{TICKET_CATEGORY_LABEL[c]}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f3a26]/40" />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Related order / booking <span className="font-normal text-[#0f3a26]/40">(optional)</span></span>
          <input value={related} onChange={(e) => setRelated(e.target.value)} placeholder="e.g. SA-ORD-4821" className="w-full rounded-xl border border-[#0f3a26]/[0.14] bg-[#f6faf7] shadow-[inset_0_1px_2px_rgba(15,58,38,0.04)] px-3.5 py-2.5 text-[13.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">{mode === "problem" ? "What went wrong?" : "Subject"}</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={mode === "problem" ? "Briefly describe the problem" : "Summarize your request"} className="w-full rounded-xl border border-[#0f3a26]/[0.14] bg-[#f6faf7] shadow-[inset_0_1px_2px_rgba(15,58,38,0.04)] px-3.5 py-2.5 text-[13.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">{mode === "problem" ? "Steps and details" : "Describe your issue"}</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder={mode === "problem" ? "What were you doing when it happened? What did you expect?" : "Give us the details so we can help faster."} className="w-full resize-y rounded-xl border border-[#0f3a26]/[0.14] bg-[#f6faf7] shadow-[inset_0_1px_2px_rgba(15,58,38,0.04)] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
        </label>
      </div>

      {/* Priority + attach */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#0f3a26]/60">Priority</span>
          <div className="inline-flex rounded-lg bg-[#0f3a26]/[0.05] p-0.5">
            {(["low", "normal", "high"] as TicketPriority[]).map((p) => (
              <button key={p} onClick={() => setPriority(p)} className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold capitalize transition ${priority === p ? "bg-white text-[#0f3a26] shadow-sm ring-1 ring-[#0f3a26]/8" : "text-[#0f3a26]/50 hover:text-[#0f3a26]/75"}`}>{p}</button>
            ))}
          </div>
        </div>

        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]">
          <Paperclip className="h-3.5 w-3.5" />Attach screenshot
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))} />
      </div>

      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {files.map((f, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f3a26]/[0.04] px-2.5 py-1 text-[11px] text-[#0f3a26]/65 ring-1 ring-inset ring-[#0f3a26]/8">
              <Paperclip className="h-3 w-3" />{f}
              <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-[#0f3a26]/40 hover:text-[#c14040]"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Success */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2.5 rounded-xl bg-[#006E42]/8 px-3.5 py-2.5 ring-1 ring-inset ring-[#006E42]/15">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#006E42]" />
            <p className="text-[12.5px] text-[#0f3a26]/75">Ticket <span className="font-bold text-[#006E42]">{done}</span> created. We will reply by email and in Your tickets below.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <p className="text-[11.5px] text-[#0f3a26]/45">Avg. first reply in ~2 hours</p>
        <button onClick={submit} disabled={!valid || busy} className="inline-flex items-center gap-2 rounded-xl bg-[#006E42] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#005634] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 disabled:cursor-not-allowed disabled:opacity-45">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {mode === "problem" ? "Report problem" : "Submit ticket"}
        </button>
      </div>
    </section>
  );
}

/* ============================== Contact support ============================== */

function ContactCard() {
  const [chatOpen, setChatOpen] = useState(false);
  const channels = [
    { icon: Phone, label: "Call us", value: "1800 123 456", href: "tel:+911800123456", hint: "Mon to Sat, 9am to 8pm" },
    { icon: Mail, label: "Email", value: "care@suppai.health", href: "mailto:care@suppai.health", hint: "Replies within a day" },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat on WhatsApp", href: "https://wa.me/911800123456", hint: "Fastest for quick questions" },
  ];

  return (
    <section className={`${CARD} flex h-full flex-col p-6`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">Contact support</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006E42]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#006E42]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#006E42]" />Online</span>
      </div>

      {/* Live chat, primary */}
      <button onClick={() => setChatOpen(true)} className="group mt-4 flex items-center gap-3 rounded-2xl bg-[#006E42] p-4 text-left text-white transition hover:bg-[#005634] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15"><MessageCircle className="h-5 w-5" /></span>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold">Start live chat</p>
          <p className="text-[11px] text-[#9af2c4]">Typical reply in under 15 min</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 flex items-start gap-2 rounded-xl bg-[#006E42]/[0.06] px-3 py-2.5 ring-1 ring-inset ring-[#006E42]/12">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006E42]" />
            <p className="text-[11.5px] text-[#0f3a26]/70">A specialist has been notified and will join this chat shortly. Keep this tab open.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other channels */}
      <div className="mt-3 space-y-2">
        {channels.map((c) => (
          <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-3 rounded-2xl bg-[#f1f7f3] p-3.5 ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)] transition-shadow hover:shadow-[0_6px_16px_-6px_rgba(15,58,38,0.20)] hover:ring-[#006E42]/25">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]"><c.icon className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-[#0f3a26]">{c.value}</p>
              <p className="text-[10.5px] text-[#0f3a26]/50">{c.hint}</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#0f3a26]/30 transition group-hover:text-[#006E42]" />
          </a>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-[#0f3a26]/8 pt-4">
        <div className="flex -space-x-2">
          {["AN", "RH", "MK"].map((n) => (
            <span key={n} className="grid h-8 w-8 place-items-center rounded-full bg-[#006E42] text-[10px] font-bold text-white ring-2 ring-white">{n}</span>
          ))}
        </div>
        <p className="text-[11.5px] leading-tight text-[#0f3a26]/55">Our care team is standing by to help you today.</p>
      </div>
    </section>
  );
}

/* ============================== Tickets & status ============================== */

type TicketFilter = "all" | "open" | "resolved";
const OPEN_SET: TicketStatus[] = ["open", "in_progress", "awaiting_you"];

function TicketsPanel({
  tickets,
  expandedId,
  setExpandedId,
  onUpdate,
}: {
  tickets: Ticket[] | null;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onUpdate: (list: Ticket[]) => void;
}) {
  const [filter, setFilter] = useState<TicketFilter>("all");

  const counts = useMemo(() => {
    const open = (tickets ?? []).filter((t) => OPEN_SET.includes(t.status)).length;
    const resolved = (tickets ?? []).filter((t) => !OPEN_SET.includes(t.status)).length;
    return { all: tickets?.length ?? 0, open, resolved };
  }, [tickets]);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    const list = tickets.filter((t) =>
      filter === "all" ? true : filter === "open" ? OPEN_SET.includes(t.status) : !OPEN_SET.includes(t.status),
    );
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [tickets, filter]);

  return (
    <section className={`${CARD} flex h-full flex-col p-6 md:p-7`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">Your tickets</h2>
        <div className="inline-flex rounded-lg bg-[#0f3a26]/[0.05] p-0.5">
          {(["all", "open", "resolved"] as TicketFilter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1 text-[12px] font-semibold capitalize transition ${filter === f ? "bg-white text-[#0f3a26] shadow-sm ring-1 ring-[#0f3a26]/8" : "text-[#0f3a26]/50 hover:text-[#0f3a26]/75"}`}>
              {f}<span className="ml-1.5 text-[10px] tabular-nums text-[#0f3a26]/40">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex-1">
        {!tickets ? (
          <div className="space-y-2.5">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#0f3a26]/[0.04]" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="grid h-full min-h-[180px] place-items-center rounded-2xl bg-[#f1f7f3] p-8 text-center ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)]">
            <div>
              <TicketIcon className="mx-auto h-6 w-6 text-[#0f3a26]/25" />
              <p className="mt-2 text-[13px] font-semibold text-[#0f3a26]">No {filter === "all" ? "" : filter} tickets</p>
              <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/50">Raise one above and it will show up here with live status.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((t) => (
              <TicketRow key={t.id} ticket={t} expanded={expandedId === t.id} onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)} onUpdate={onUpdate} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TicketRow({ ticket, expanded, onToggle, onUpdate }: { ticket: Ticket; expanded: boolean; onToggle: () => void; onUpdate: (l: Ticket[]) => void }) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const meta = TICKET_STATUS[ticket.status];
  const Icon = CATEGORY_ICON[ticket.category];
  const closed = ticket.status === "closed";

  async function send() {
    if (!reply.trim() || busy) return;
    setBusy(true);
    const list = await replyToTicket(ticket.id, reply);
    setBusy(false);
    setReply("");
    onUpdate(list);
  }
  async function status(s: TicketStatus) {
    onUpdate(await setTicketStatus(ticket.id, s));
  }

  return (
    <li className="overflow-hidden rounded-2xl bg-[#f1f7f3] ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)] transition-shadow hover:shadow-[0_6px_16px_-6px_rgba(15,58,38,0.20)]">
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-[#0f3a26]/[0.02]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#006E42] ring-1 ring-inset ring-[#0f3a26]/8"><Icon className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{ticket.subject}</p>
          <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/50">{ticket.ref} · {TICKET_CATEGORY_LABEL[ticket.category]} · updated {relTime(ticket.updatedAt)}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${meta.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#0f3a26]/35 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-[#0f3a26]/8 px-4 pb-4 pt-3">
            <div className="space-y-2.5">
              {ticket.messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${m.from === "you" ? "bg-[#006E42] text-white" : "bg-white text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/8"}`}>
                    <p className={`text-[10px] font-semibold ${m.from === "you" ? "text-[#9af2c4]" : "text-[#006E42]"}`}>{m.author} · {relTime(m.at)}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {!closed && ticket.status !== "resolved" && (
              <div className="mt-3 flex items-end gap-2">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={1} placeholder="Write a reply…" className="min-h-[42px] flex-1 resize-y rounded-xl border border-[#0f3a26]/[0.14] bg-[#f6faf7] shadow-[inset_0_1px_2px_rgba(15,58,38,0.04)] px-3 py-2.5 text-[12.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
                <button onClick={send} disabled={!reply.trim() || busy} className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-[#006E42] text-white transition hover:bg-[#005634] disabled:opacity-45">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ticket.status !== "resolved" && !closed && (
                <button onClick={() => status("resolved")} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42]/8 px-3 py-1.5 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/14"><Check className="h-3.5 w-3.5" />Mark resolved</button>
              )}
              {(ticket.status === "resolved" || closed) && (
                <button onClick={() => status("open")} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f3a26]/[0.05] px-3 py-1.5 text-[11.5px] font-semibold text-[#0f3a26]/70 transition hover:bg-[#0f3a26]/8"><RotateCcw className="h-3.5 w-3.5" />Reopen</button>
              )}
              {!closed && (
                <button onClick={() => status("closed")} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-medium text-[#0f3a26]/50 transition hover:text-[#0f3a26]/80">Close ticket</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ============================== Refunds & cancellations ============================== */

function RefundsPanel({ refunds }: { refunds: RefundRequest[] | null }) {
  return (
    <section className={`${CARD} flex h-full flex-col p-6`}>
      <div className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-[#006E42]" />
        <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">Refunds & cancellations</h2>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {!refunds ? (
          [0, 1].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#0f3a26]/[0.04]" />)
        ) : refunds.length === 0 ? (
          <div className="grid h-full min-h-[160px] place-items-center rounded-2xl bg-[#f1f7f3] p-6 text-center ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)]">
            <div>
              <RotateCcw className="mx-auto h-6 w-6 text-[#0f3a26]/25" />
              <p className="mt-2 text-[12.5px] font-semibold text-[#0f3a26]">No active refunds</p>
              <p className="mt-0.5 text-[11px] text-[#0f3a26]/50">Cancellations and refunds show their status here.</p>
            </div>
          </div>
        ) : (
          refunds.map((r) => <RefundCard key={r.id} refund={r} />)
        )}
      </div>
    </section>
  );
}

function RefundCard({ refund }: { refund: RefundRequest }) {
  const rejected = refund.status === "rejected";
  const currentIdx = REFUND_STEPS.findIndex((s) => s.key === refund.status);

  return (
    <div className="rounded-2xl bg-[#f1f7f3] p-4 ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold text-[#0f3a26]">{refund.label}</p>
          <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/50">{refund.ref} · {refund.orderRef}</p>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">₹{refund.amount.toLocaleString()}</p>
          <span className="text-[9.5px] font-semibold uppercase tracking-wider text-[#0f3a26]/45">{refund.kind}</span>
        </div>
      </div>

      {rejected ? (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#c14040]/8 px-2.5 py-1.5 text-[11.5px] font-semibold text-[#c14040]"><AlertCircle className="h-3.5 w-3.5" />Rejected</div>
      ) : (
        <div className="mt-3.5 flex items-center">
          {REFUND_STEPS.map((step, idx) => {
            const done = idx <= currentIdx;
            const isLast = idx === REFUND_STEPS.length - 1;
            return (
              <div key={step.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-white transition ${done ? "bg-[#006E42]" : "bg-[#0f3a26]/12"}`}>
                    {done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className={`mt-1 text-[9px] font-medium ${done ? "text-[#0f3a26]/70" : "text-[#0f3a26]/40"}`}>{step.label}</span>
                </div>
                {!isLast && <span className={`mx-1 h-0.5 flex-1 rounded-full ${idx < currentIdx ? "bg-[#006E42]" : "bg-[#0f3a26]/12"}`} />}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-[#0f3a26]/6 pt-2.5">
        <p className="text-[10.5px] text-[#0f3a26]/50">{refund.method}</p>
        {refund.eta && <p className={`text-[10.5px] font-semibold ${refund.status === "credited" ? "text-[#006E42]" : "text-[#9c7426]"}`}>{refund.eta}</p>}
      </div>
    </div>
  );
}

/* ============================== Help centre ============================== */

function HelpCentre() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!q) return null;
    const all = HELP_CATEGORIES.flatMap((c) => c.articles.map((a) => ({ ...a, cat: c.title })));
    return all.filter((a) => a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q));
  }, [q]);

  return (
    <section className={`${CARD} p-6 md:p-7`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#006E42]" />
          <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">Help centre</h2>
        </div>
        <div className="flex w-full items-center gap-2 rounded-xl bg-[#f1f7f3] px-3.5 py-2.5 text-[13px] ring-1 ring-inset ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 sm:w-80">
          <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search help articles…" className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none" />
          {query && <button onClick={() => setQuery("")} className="text-[#0f3a26]/40 hover:text-[#0f3a26]"><X className="h-3.5 w-3.5" /></button>}
        </div>
      </div>

      {matches ? (
        <div className="mt-5">
          {matches.length === 0 ? (
            <p className="rounded-2xl bg-[#f1f7f3] p-6 text-center text-[12.5px] text-[#0f3a26]/55 ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)]">No articles matched. Try different words, or raise a ticket above.</p>
          ) : (
            <ul className="space-y-2">
              {matches.map((a) => <FaqItem key={a.id} id={a.id} q={a.q} a={a.a} tag={a.cat} open={openId === a.id} onToggle={() => setOpenId(openId === a.id ? null : a.id)} />)}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {HELP_CATEGORIES.map((c) => (
            <div key={c.id}>
              <p className="text-[12.5px] font-bold text-[#0f3a26]">{c.title}</p>
              <p className="mt-0.5 text-[11px] text-[#0f3a26]/50">{c.blurb}</p>
              <ul className="mt-2.5 space-y-1.5">
                {c.articles.map((a) => <FaqItem key={a.id} id={a.id} q={a.q} a={a.a} open={openId === a.id} onToggle={() => setOpenId(openId === a.id ? null : a.id)} compact />)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FaqItem({ q, a, tag, open, onToggle, compact }: { id: string; q: string; a: string; tag?: string; open: boolean; onToggle: () => void; compact?: boolean }) {
  return (
    <li className={compact ? "" : "overflow-hidden rounded-2xl bg-[#f1f7f3] ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)]"}>
      <button onClick={onToggle} className={`flex w-full items-center gap-2 text-left ${compact ? "py-1" : "p-4"}`}>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#006E42] transition ${open ? "rotate-180" : ""}`} />
        <span className="flex-1 text-[12.5px] font-medium text-[#0f3a26]/85">{q}</span>
        {tag && <span className="shrink-0 rounded-full bg-[#0f3a26]/6 px-2 py-0.5 text-[9.5px] font-semibold text-[#0f3a26]/50">{tag}</span>}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={`text-[12px] leading-relaxed text-[#0f3a26]/60 ${compact ? "pb-1.5 pl-[22px] pr-2" : "px-4 pb-4"}`}>
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </li>
  );
}
