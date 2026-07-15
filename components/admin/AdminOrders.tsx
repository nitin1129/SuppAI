"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  Check,
  Inbox,
  IndianRupee,
  Loader2,
  MapPin,
  Package,
  Printer,
  Search,
  ShieldCheck,
  Stethoscope,
  TestTube,
  TrendingUp,
  User,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import {
  PRODUCT_STATUS_LABEL,
  TEST_STATUS_LABEL,
  dayGroupLabel,
  fetchOrders,
  relativeTime,
} from "@/lib/orders/service";
import {
  PRODUCT_STEPS,
  TEST_STEPS,
  buildSteps,
  type OrderKind,
  type OrderRecord,
} from "@/lib/orders/types";

type Tone = "neutral" | "progress" | "success" | "danger";

const KIND_META: Record<OrderKind, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  product: { label: "Product", icon: Package },
  test: { label: "Lab test", icon: TestTube },
  consult: { label: "Consult", icon: Stethoscope },
  insurance: { label: "Insurance", icon: ShieldCheck },
};

const TONE_PILL: Record<Tone, { cls: string; dot: string }> = {
  neutral: { cls: "bg-[#0f3a26]/6 text-[#0f3a26]/70", dot: "bg-[#0f3a26]/40" },
  progress: { cls: "bg-[#c79a3d]/14 text-[#9c7426]", dot: "bg-[#c79a3d]" },
  success: { cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  danger: { cls: "bg-[#c14040]/10 text-[#c14040]", dot: "bg-[#c14040]" },
};

function statusInfo(o: OrderRecord): { label: string; tone: Tone; completed: boolean; inProgress: boolean } {
  switch (o.kind) {
    case "product": {
      if (o.resolution === "cancelled") return { label: "Cancelled", tone: "danger", completed: false, inProgress: false };
      if (o.resolution === "return_requested") return { label: "Return requested", tone: "progress", completed: false, inProgress: true };
      const done = o.status === "delivered";
      return { label: PRODUCT_STATUS_LABEL[o.status], tone: done ? "success" : "progress", completed: done, inProgress: !done };
    }
    case "test": {
      const done = o.status === "result_published";
      return { label: TEST_STATUS_LABEL[o.status], tone: done ? "success" : "progress", completed: done, inProgress: !done };
    }
    case "consult": {
      if (o.status === "completed") return { label: "Completed", tone: "success", completed: true, inProgress: false };
      if (o.status === "cancelled") return { label: "Cancelled", tone: "danger", completed: false, inProgress: false };
      return { label: "Upcoming", tone: "progress", completed: false, inProgress: true };
    }
    case "insurance": {
      const done = o.status === "active";
      return { label: done ? "Active" : "Pending", tone: done ? "success" : "progress", completed: done, inProgress: !done };
    }
  }
}

function orderTitle(o: OrderRecord): string {
  switch (o.kind) {
    case "product":
      return o.lines.length > 1 ? `${o.lines[0].name} +${o.lines.length - 1} more` : o.lines[0].name;
    case "test":
      return `${o.vendorName}, ${o.tests[0].name}`;
    case "consult":
      return `${o.doctor.name}, ${o.doctor.specialtyLabel}`;
    case "insurance":
      return `${o.insurer} health cover`;
  }
}

function orderCustomer(o: OrderRecord): string {
  if (o.kind === "test" || o.kind === "consult") return o.patient.fullName;
  return "Jane Sharma";
}

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

type Filter = "all" | OrderKind;
const FILTERS: Filter[] = ["all", "product", "test", "consult", "insurance"];

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders().then(setOrders);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders?.length ?? 0 };
    for (const o of orders ?? []) c[o.kind] = (c[o.kind] ?? 0) + 1;
    return c;
  }, [orders]);

  const report = useMemo(() => {
    const list = orders ?? [];
    let revenue = 0;
    let inProgress = 0;
    let completed = 0;
    for (const o of list) {
      const s = statusInfo(o);
      if (s.tone !== "danger") revenue += o.total;
      if (s.inProgress) inProgress += 1;
      if (s.completed) completed += 1;
    }
    return { total: list.length, revenue, inProgress, completed };
  }, [orders]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders
      .filter((o) => (filter === "all" ? true : o.kind === filter))
      .filter((o) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          o.reference.toLowerCase().includes(q) ||
          orderTitle(o).toLowerCase().includes(q) ||
          orderCustomer(o).toLowerCase().includes(q)
        );
      });
  }, [orders, filter, query]);

  const selected = orders?.find((o) => o.id === selectedId) ?? null;

  return (
    <>
      <AdminTopbar title="Orders" subtitle="Latest orders across products, labs, consults, and insurance." />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Report row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Total orders" value={report.total.toString()} icon={Package} />
          <StatTile label="Booked revenue" value={`₹${report.revenue.toLocaleString()}`} icon={IndianRupee} accent />
          <StatTile label="In progress" value={report.inProgress.toString()} icon={TrendingUp} />
          <StatTile label="Completed" value={report.completed.toString()} icon={Check} />
        </div>

        {/* Filters + search */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium capitalize transition ${
                  filter === f ? "bg-[#006E42] text-white" : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"
                }`}
              >
                {f === "all" ? "All" : `${KIND_META[f].label}s`}
                <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${filter === f ? "bg-white/15" : "bg-[#0f3a26]/8"}`}>{counts[f] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ref, item, customer…" className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none" />
          </div>
        </div>

        {/* List */}
        {!orders ? (
          <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-white p-14 text-center ring-1 ring-[#0f3a26]/8">
            <Inbox className="h-7 w-7 text-[#0f3a26]/30" />
            <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">No orders</p>
            <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">Orders placed by members appear here, newest first.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {/* header row */}
            <div className="hidden items-center gap-4 border-b border-[#0f3a26]/8 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/40 md:flex">
              <span className="w-9" />
              <span className="flex-1">Order</span>
              <span className="w-32">Customer</span>
              <span className="w-24">Date</span>
              <span className="w-36">Status</span>
              <span className="w-24 text-right">Amount</span>
            </div>
            <ul>
              {filtered.map((o, i) => {
                const Icon = KIND_META[o.kind].icon;
                const s = statusInfo(o);
                const pill = TONE_PILL[s.tone];
                return (
                  <li key={o.id}>
                    <button
                      onClick={() => setSelectedId(o.id)}
                      className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[#0f3a26]/[0.02] ${i > 0 ? "border-t border-[#0f3a26]/6" : ""}`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]"><Icon className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{orderTitle(o)}</p>
                        <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/50">{o.reference} · {KIND_META[o.kind].label}</p>
                      </div>
                      <span className="hidden w-32 truncate text-[12px] text-[#0f3a26]/65 md:inline">{orderCustomer(o)}</span>
                      <span className="hidden w-24 text-[11.5px] text-[#0f3a26]/50 md:inline">{relativeTime(o.placedAt)}</span>
                      <span className="w-36 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${pill.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />{s.label}</span>
                      </span>
                      <span className="w-24 text-right text-[13px] font-bold tabular-nums text-[#0f3a26]">₹{o.total.toLocaleString()}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>

      <OrderReportDrawer order={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}

function StatTile({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${accent ? "bg-[#006E42] ring-[#006E42]" : "bg-white ring-[#0f3a26]/8"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${accent ? "text-[#9af2c4]" : "text-[#0f3a26]/45"}`}>{label}</p>
        <Icon className={`h-4 w-4 ${accent ? "text-[#9af2c4]" : "text-[#006E42]"}`} />
      </div>
      <p className={`mt-2 text-[24px] font-bold tabular-nums tracking-tight ${accent ? "text-white" : "text-[#0f3a26]"}`}>{value}</p>
    </div>
  );
}

/* ============================== Report drawer ============================== */

function OrderReportDrawer({ order, onClose }: { order: OrderRecord | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  function print() {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 60);
  }

  const s = order ? statusInfo(order) : null;
  const Icon = order ? KIND_META[order.kind].icon : Package;

  return (
    <AnimatePresence>
      {order && s && (
        <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[#0c1614]/35" onClick={onClose} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${order.reference}`}
            className="relative flex h-full w-full max-w-[480px] flex-col bg-[#fbfdfb] shadow-2xl"
            initial={reduce ? false : { x: 44, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: 44, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-[#0f3a26]/8 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-[#0f3a26]">{order.reference}</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TONE_PILL[s.tone].cls}`}><span className={`h-1.5 w-1.5 rounded-full ${TONE_PILL[s.tone].dot}`} />{s.label}</span>
                </div>
                <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/50">{KIND_META[order.kind].label} order · {dayGroupLabel(order.placedAt)}</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#0f3a26]/50 transition hover:bg-[#0f3a26]/6 hover:text-[#0f3a26]"><X className="h-4 w-4" /></button>
            </div>

            <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
              {/* Customer */}
              <Row label="Customer">
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#006E42] text-[9px] font-bold text-white">{initials(orderCustomer(order))}</span>
                  {orderCustomer(order)}
                </span>
              </Row>

              <OrderBody order={order} />

              {/* Total */}
              <div className="flex items-center justify-between rounded-2xl bg-[#006E42]/[0.06] px-4 py-3 ring-1 ring-inset ring-[#006E42]/12">
                <span className="text-[12.5px] font-semibold text-[#0f3a26]">Order total</span>
                <span className="text-[18px] font-bold tabular-nums text-[#006E42]">₹{order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-[#0f3a26]/8 p-4">
              <button onClick={print} disabled={printing} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3a26] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0c2f1f] disabled:opacity-60">
                {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}Print / save report
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#0f3a26]/6 pb-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/45">{label}</span>
      <span className="text-right text-[12.5px] font-medium text-[#0f3a26]">{children}</span>
    </div>
  );
}

function OrderBody({ order }: { order: OrderRecord }) {
  if (order.kind === "product") {
    const steps = buildSteps(PRODUCT_STEPS, order.status, order.placedAt);
    return (
      <>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/45">Items</p>
          <ul className="space-y-2">
            {order.lines.map((l, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-inset ring-[#0f3a26]/8">
                <span className="h-11 w-11 shrink-0 rounded-lg bg-[#0f3a26]/[0.04] bg-cover bg-center ring-1 ring-inset ring-[#0f3a26]/8" style={{ backgroundImage: `url(${l.image})` }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-[#0f3a26]">{l.name}</p>
                  <p className="text-[10.5px] text-[#0f3a26]/50">{l.brand} · Qty {l.qty}{l.subscription ? ` · every ${l.subscription.frequencyWeeks}w` : ""}</p>
                </div>
                <span className="text-[12.5px] font-bold tabular-nums text-[#0f3a26]">₹{l.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <InfoLine icon={MapPin} text={order.address} />
        <InfoLine icon={Calendar} text={`ETA ${dayGroupLabel(order.eta)}`} />
        <Timeline steps={steps} />
      </>
    );
  }
  if (order.kind === "test") {
    const steps = buildSteps(TEST_STEPS, order.status, order.placedAt);
    return (
      <>
        <Row label="Lab">{order.vendorName}</Row>
        <Row label="Patient">{order.patient.fullName}</Row>
        <InfoLine icon={Calendar} text={`${dayGroupLabel(order.schedule.date)} · ${order.schedule.slotLabel}`} />
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/45">Tests</p>
          <ul className="space-y-1.5">
            {order.tests.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-[12px] ring-1 ring-inset ring-[#0f3a26]/8">
                <span className="font-medium text-[#0f3a26]">{t.name}</span>
                <span className="text-[#0f3a26]/50">{t.parameterCount} params</span>
              </li>
            ))}
          </ul>
        </div>
        <Timeline steps={steps} />
      </>
    );
  }
  if (order.kind === "consult") {
    return (
      <>
        <Row label="Doctor">{order.doctor.name}</Row>
        <Row label="Speciality">{order.doctor.specialtyLabel}</Row>
        <Row label="Patient">{order.patient.fullName}</Row>
        <InfoLine icon={order.mode === "video" ? Video : User} text={`${order.mode === "video" ? "Video consult" : "In-clinic"} · ${dayGroupLabel(order.schedule.date)} · ${order.schedule.slotLabel}`} />
      </>
    );
  }
  return (
    <>
      <Row label="Insurer">{order.insurer}</Row>
      <Row label="Cover">₹{order.cover.toLocaleString()}</Row>
      <Row label="Members">{order.members}</Row>
      <Row label="Term">{order.termYears} year{order.termYears > 1 ? "s" : ""}</Row>
      {order.policy.features.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/45">Benefits</p>
          <ul className="space-y-1.5">
            {order.policy.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px] text-[#0f3a26]/75"><Check className="h-3.5 w-3.5 shrink-0 text-[#006E42]" />{f}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function InfoLine({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-start gap-2 text-[12px] text-[#0f3a26]/65">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006E42]" />
      <span>{text}</span>
    </div>
  );
}

function Timeline({ steps }: { steps: { key: string; label: string; state: "done" | "current" | "todo"; at?: string }[] }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/45">Timeline</p>
      <ol className="space-y-0">
        {steps.map((step, i) => {
          const active = step.state !== "todo";
          const isLast = i === steps.length - 1;
          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`grid h-5 w-5 place-items-center rounded-full text-white ${active ? "bg-[#006E42]" : "bg-[#0f3a26]/12"}`}>
                  {step.state === "done" ? <Check className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full ${step.state === "current" ? "bg-white" : "bg-white/70"}`} />}
                </span>
                {!isLast && <span className={`w-0.5 flex-1 ${step.state === "done" ? "bg-[#006E42]" : "bg-[#0f3a26]/12"}`} style={{ minHeight: 18 }} />}
              </div>
              <div className={`pb-3 ${isLast ? "" : ""}`}>
                <p className={`text-[12px] font-semibold ${active ? "text-[#0f3a26]" : "text-[#0f3a26]/45"}`}>{step.label}</p>
                {step.at && <p className="text-[10.5px] text-[#0f3a26]/45">{dayGroupLabel(step.at)}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
