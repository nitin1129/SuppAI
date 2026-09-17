"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CoffeeIcon,
  CreditCard,
  Droplet,
  Home,
  Loader2,
  MapPin,
  Search,
  Timer,
  TrendingUp,
  UserCog,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";

import { useLabSession } from "@/lib/partner/auth";
import {
  LAB_STATUS_LABELS,
  LAB_STATUS_ORDER,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  computeLabAnalytics,
  fetchLabOrders,
  updateLabOrderStatus,
} from "@/lib/partner/service";
import type {
  LabOrder,
  LabOrderStatus,
  PaymentStatus,
} from "@/lib/partner/types";

const EASE = [0.22, 1, 0.36, 1] as const;
const LAB_LEAVE_KEY = "suppai.lab.leaveDates";

type Tab = "today" | "calendar" | "orders" | "reports";

export default function LabDashboardPage() {
  const { session } = useLabSession();
  const labId = session?.labId ?? "lab-thyrocare";
  const [orders, setOrders] = useState<LabOrder[] | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [selectedDate, setSelectedDate] = useState<string>(isoToday());
  const hydrated = useHydrated();
  const storedLeave = useMemo<Record<string, string>>(() => {
    if (!hydrated || !labId) return {};
    try {
      const raw = localStorage.getItem(`${LAB_LEAVE_KEY}.${labId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [hydrated, labId]);
  const [leaveEdit, setLeaveEdit] = useState<{ labId: string; leave: Record<string, string> } | null>(null);
  const leave = leaveEdit && leaveEdit.labId === labId ? leaveEdit.leave : storedLeave;
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!labId) return;
    let alive = true;
    fetchLabOrders(labId).then((o) => alive && setOrders(o));
    return () => {
      alive = false;
    };
  }, [labId]);

  function persistLeave(next: Record<string, string>) {
    setLeaveEdit({ labId, leave: next });
    try {
      localStorage.setItem(`${LAB_LEAVE_KEY}.${labId}`, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  function setLeaveForDate(date: string, enabled: boolean, message?: string) {
    const next = { ...leave };
    if (enabled) next[date] = message ?? "";
    else delete next[date];
    persistLeave(next);
  }

  async function advance(o: LabOrder) {
    if (!orders) return;
    const next = nextStatus(o.status);
    if (!next) return;
    setBusyId(o.id);
    setOrders(orders.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    await updateLabOrderStatus(labId, o.id, next);
    setBusyId(null);
  }
  async function cancel(o: LabOrder) {
    if (!orders) return;
    if (!confirm("Cancel this order?")) return;
    setOrders(
      orders.map((x) =>
        x.id === o.id ? { ...x, status: "cancelled" } : x,
      ),
    );
    await updateLabOrderStatus(labId, o.id, "cancelled");
  }

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <h1 className="text-[28px] font-bold leading-[1.1] tracking-tight text-[#0f3a26]">
          {session?.labName ?? "Lab"}
        </h1>
      </motion.section>

      <nav className="flex items-center gap-1 border-b border-[#0f3a26]/8">
        {(
          [
            { id: "today", label: "Today" },
            { id: "calendar", label: "Calendar" },
            { id: "orders", label: "All orders" },
            { id: "reports", label: "Reports" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-[13px] font-semibold transition ${
              tab === t.id
                ? "text-[#006E42]"
                : "text-[#0f3a26]/55 hover:text-[#0f3a26]"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span
                layoutId="lab-tab"
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[#006E42]"
              />
            )}
          </button>
        ))}
      </nav>

      {tab === "today" && (
        <TodayPanel
          orders={orders}
          leave={leave}
          onAdvance={advance}
          onCancel={cancel}
          busyId={busyId}
          onSetLeave={setLeaveForDate}
        />
      )}

      {tab === "calendar" && (
        <CalendarPanel
          orders={orders}
          leave={leave}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onAdvance={advance}
          onCancel={cancel}
          busyId={busyId}
          onSetLeave={setLeaveForDate}
        />
      )}

      {tab === "orders" && (
        <OrdersPanel
          orders={orders}
          onAdvance={advance}
          onCancel={cancel}
          busyId={busyId}
        />
      )}

      {tab === "reports" && <ReportsPanel orders={orders} />}
    </div>
  );
}

/* ============================== Today ============================== */

function TodayPanel({
  orders,
  leave,
  onAdvance,
  onCancel,
  busyId,
  onSetLeave,
}: {
  orders: LabOrder[] | null;
  leave: Record<string, string>;
  onAdvance: (o: LabOrder) => void;
  onCancel: (o: LabOrder) => void;
  busyId: string | null;
  onSetLeave: (date: string, enabled: boolean, message?: string) => void;
}) {
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState("");

  if (!orders)
    return (
      <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
    );

  const todayISO = isoToday();
  const paused = todayISO in leave;
  const pauseMsg = leave[todayISO] ?? "";

  const today = orders
    .filter((o) => o.schedule.date === todayISO)
    .sort((a, b) => a.schedule.slotLabel.localeCompare(b.schedule.slotLabel));

  const upcoming = orders
    .filter(
      (o) =>
        o.schedule.date > todayISO &&
        o.status !== "cancelled" &&
        o.status !== "result-published",
    )
    .sort((a, b) => a.schedule.date.localeCompare(b.schedule.date))
    .slice(0, 4);

  // Operational counters labs care about at a glance.
  const pendingAction = orders.filter((o) => o.status === "received").length;
  const inLab = orders.filter((o) => o.status === "in-lab").length;
  const homeToday = today.filter((o) => o.homeCollection).length;
  const collectedToday = today.reduce(
    (s, o) => (o.payment?.status === "paid" ? s + o.total : s),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Operational stat strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <MiniStat
          icon={Wallet}
          label="Awaiting confirm"
          value={pendingAction.toString()}
          accent={pendingAction > 0}
        />
        <MiniStat icon={Droplet} label="In lab" value={inLab.toString()} />
        <MiniStat
          icon={Home}
          label="Home visits today"
          value={homeToday.toString()}
        />
        <MiniStat
          icon={Banknote}
          label="Collected today"
          value={`₹${formatINR(collectedToday)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
              {longDate(todayISO)}
            </p>
            <p className="mt-1.5 text-[20px] font-bold tracking-tight text-[#0f3a26]">
              {paused
                ? "Lab paused today."
                : today.length === 0
                  ? "No orders due today."
                  : `${today.length} order${today.length === 1 ? "" : "s"} today.`}
            </p>
          </div>
          {!paused && !drafting && (
            <button
              onClick={() => setDrafting(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/8"
            >
              <CoffeeIcon className="h-3.5 w-3.5" />
              Pause today
            </button>
          )}
        </div>

        {drafting && !paused && (
          <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
            <p className="text-[12.5px] font-semibold text-[#0f3a26]">
              Pause collections today
            </p>
            <p className="mt-1 text-[11.5px] text-[#0f3a26]/55">
              Optional note for patients.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Equipment maintenance, back tomorrow."
              rows={2}
              className="mt-3 w-full resize-none rounded-xl border border-[#0f3a26]/10 bg-white px-3.5 py-2.5 text-[13.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onSetLeave(todayISO, true, draft.trim() || undefined);
                  setDrafting(false);
                  setDraft("");
                }}
                className="rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setDrafting(false);
                  setDraft("");
                }}
                className="rounded-lg px-3 py-2 text-[12.5px] font-medium text-[#0f3a26]/65 transition hover:bg-[#0f3a26]/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {paused && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-5 rounded-2xl bg-[#006E42]/[0.06] p-5 ring-1 ring-inset ring-[#006E42]/20"
          >
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
              <CoffeeIcon className="h-3 w-3" />
              Lab paused
            </p>
            {pauseMsg && (
              <p className="mt-2 max-w-prose text-[13.5px] leading-relaxed text-[#0f3a26]/85">
                &quot;{pauseMsg}&quot;
              </p>
            )}
            <button
              onClick={() => onSetLeave(todayISO, false)}
              className="mt-3 text-[12px] font-semibold text-[#006E42] hover:underline"
            >
              Resume operations →
            </button>
          </motion.div>
        )}

        {!paused && (
          <div className="mt-5">
            {today.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-[#0f3a26]/8">
                <p className="text-[13.5px] font-semibold text-[#0f3a26]">
                  Nothing on the books.
                </p>
                <p className="mt-1 text-[12px] text-[#0f3a26]/55">
                  New orders appear here as they come in.
                </p>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
                {today.map((o, i) => (
                  <li
                    key={o.id}
                    className={
                      i === today.length - 1 ? "" : "border-b border-[#0f3a26]/6"
                    }
                  >
                    <OrderRow
                      order={o}
                      onAdvance={() => onAdvance(o)}
                      onCancel={() => onCancel(o)}
                      busy={busyId === o.id}
                      timelineMarker
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <aside>
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f3a26]/55">
            Coming up
          </p>
          <p className="text-[10.5px] tabular-nums text-[#0f3a26]/45">next 7 days</p>
        </div>

        {upcoming.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-white p-8 text-center ring-1 ring-[#0f3a26]/8">
            <p className="text-[12.5px] text-[#0f3a26]/55">No future orders.</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((o) => (
              <li
                key={o.id}
                className="flex items-start gap-3 rounded-xl bg-white p-3.5 ring-1 ring-[#0f3a26]/8"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
                  <span className="text-[10px] font-bold uppercase tracking-tight tabular-nums">
                    {shortDate(o.schedule.date)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-[#0f3a26]">
                    {o.pkg.name}
                  </p>
                  <p className="text-[11px] text-[#0f3a26]/55">
                    {o.patient.fullName} · {o.schedule.slotLabel}
                  </p>
                </div>
                <StatusPill status={o.status} compact />
              </li>
            ))}
          </ul>
        )}
      </aside>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ring-1 ${
        accent
          ? "bg-[#006E42]/[0.06] ring-[#006E42]/20"
          : "bg-white ring-[#0f3a26]/8"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          accent ? "bg-[#006E42] text-white" : "bg-[#006E42]/8 text-[#006E42]"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-none tabular-nums text-[#0f3a26]">
          {value}
        </p>
        <p className="mt-1 truncate text-[10.5px] text-[#0f3a26]/55">{label}</p>
      </div>
    </div>
  );
}

/* ============================== Calendar ============================== */

function CalendarPanel({
  orders,
  leave,
  selectedDate,
  onSelectDate,
  onAdvance,
  onCancel,
  busyId,
  onSetLeave,
}: {
  orders: LabOrder[] | null;
  leave: Record<string, string>;
  selectedDate: string;
  onSelectDate: (d: string) => void;
  onAdvance: (o: LabOrder) => void;
  onCancel: (o: LabOrder) => void;
  busyId: string | null;
  onSetLeave: (date: string, enabled: boolean, message?: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => {
    const d = new Date(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  if (!orders)
    return (
      <div className="h-96 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
    );

  const grid = monthGrid(cursor.year, cursor.month);
  const counts = orders.reduce(
    (acc, o) => {
      acc[o.schedule.date] = (acc[o.schedule.date] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const dayOrders = orders
    .filter((o) => o.schedule.date === selectedDate)
    .sort((a, b) => a.schedule.slotLabel.localeCompare(b.schedule.slotLabel));
  const isLeave = selectedDate in leave;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-[16px] font-bold tracking-tight text-[#0f3a26]">
            {new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setCursor(
                  cursor.month === 0
                    ? { year: cursor.year - 1, month: 11 }
                    : { year: cursor.year, month: cursor.month - 1 },
                )
              }
              aria-label="Previous"
              className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5 hover:text-[#006E42]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                onSelectDate(isoToday());
                setCursor({ year: today.getFullYear(), month: today.getMonth() });
              }}
              className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/8"
            >
              Today
            </button>
            <button
              onClick={() =>
                setCursor(
                  cursor.month === 11
                    ? { year: cursor.year + 1, month: 0 }
                    : { year: cursor.year, month: cursor.month + 1 },
                )
              }
              aria-label="Next"
              className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5 hover:text-[#006E42]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 px-3 pb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/40">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 p-3">
          {grid.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;
            const isToday = cell.iso === isoToday();
            const isSelected = cell.iso === selectedDate;
            const count = counts[cell.iso] ?? 0;
            const isClosed = cell.iso in leave;
            return (
              <button
                key={cell.iso}
                onClick={() => onSelectDate(cell.iso)}
                className={`relative flex aspect-square flex-col items-stretch justify-between rounded-lg p-1.5 text-left transition ${
                  isSelected
                    ? "bg-[#006E42] text-white shadow-[0_8px_18px_-10px_rgba(0,110,66,0.55)]"
                    : isToday
                      ? "ring-1 ring-inset ring-[#006E42]/40 text-[#006E42]"
                      : isClosed
                        ? "bg-[#c14040]/[0.05] text-[#c14040]/80"
                        : "text-[#0f3a26] hover:bg-[#0f3a26]/[0.03]"
                }`}
              >
                <span
                  className={`text-[12.5px] font-semibold tabular-nums ${
                    isSelected ? "text-white" : ""
                  }`}
                >
                  {cell.day}
                </span>
                {count > 0 && (
                  <span
                    className={`self-end rounded-full px-1.5 text-[9.5px] font-bold tabular-nums ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#006E42]/12 text-[#006E42]"
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isClosed && !isSelected && (
                  <span
                    aria-hidden
                    className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#c14040]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
              {selectedDate === isoToday()
                ? "Today"
                : isInPast(selectedDate)
                  ? "Past"
                  : "Coming up"}
            </p>
            <p className="mt-0.5 text-[16px] font-bold tracking-tight text-[#0f3a26]">
              {longDate(selectedDate)}
            </p>
          </div>
          {!isLeave && selectedDate >= isoToday() && (
            <button
              onClick={() => onSetLeave(selectedDate, true)}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/8"
            >
              <CoffeeIcon className="h-3 w-3" />
              Pause
            </button>
          )}
        </div>

        {isLeave && (
          <div className="rounded-xl bg-[#006E42]/[0.05] p-4 ring-1 ring-inset ring-[#006E42]/15">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
              <CoffeeIcon className="-mt-0.5 mr-1 inline h-3 w-3" />
              Lab closed
            </p>
            {leave[selectedDate] && (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#0f3a26]/75">
                &quot;{leave[selectedDate]}&quot;
              </p>
            )}
            <button
              onClick={() => onSetLeave(selectedDate, false)}
              className="mt-2 text-[11.5px] font-semibold text-[#006E42] hover:underline"
            >
              Resume
            </button>
          </div>
        )}

        {dayOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-[#0f3a26]/8">
            <p className="text-[12.5px] text-[#0f3a26]/55">
              {isLeave ? "Patients have been notified." : "No orders."}
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {dayOrders.map((o, i) => (
              <li
                key={o.id}
                className={
                  i === dayOrders.length - 1 ? "" : "border-b border-[#0f3a26]/6"
                }
              >
                <OrderRow
                  order={o}
                  onAdvance={() => onAdvance(o)}
                  onCancel={() => onCancel(o)}
                  busy={busyId === o.id}
                  compact
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================== Orders ============================== */

function OrdersPanel({
  orders,
  onAdvance,
  onCancel,
  busyId,
}: {
  orders: LabOrder[] | null;
  onAdvance: (o: LabOrder) => void;
  onCancel: (o: LabOrder) => void;
  busyId: string | null;
}) {
  const [filter, setFilter] = useState<"active" | "all" | LabOrderStatus>(
    "active",
  );
  const [query, setQuery] = useState("");

  // Hooks must run on every render: keep this above the loading guard.
  const stats = useMemo(() => {
    let revenue = 0;
    let active = 0;
    for (const o of orders ?? []) {
      if (o.status !== "cancelled") revenue += o.total;
      if (o.status !== "result-published" && o.status !== "cancelled") active += 1;
    }
    return { revenue, active };
  }, [orders]);

  if (!orders)
    return (
      <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
    );

  const filtered = orders
    .filter((o) => {
      if (filter === "all") return true;
      if (filter === "active")
        return o.status !== "result-published" && o.status !== "cancelled";
      return o.status === filter;
    })
    .filter((o) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        o.reference.toLowerCase().includes(q) ||
        o.patient.fullName.toLowerCase().includes(q) ||
        o.pkg.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.schedule.date.localeCompare(a.schedule.date));

  return (
    <div className="space-y-5">
      {/* Slim summary line, not big tiles */}
      <p className="text-[12.5px] text-[#0f3a26]/65">
        <span className="font-bold text-[#0f3a26]">
          {stats.active}
        </span>{" "}
        active ·{" "}
        <span className="font-bold text-[#0f3a26]">
          ₹{formatINR(stats.revenue)}
        </span>{" "}
        revenue (all-time)
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "active", label: "Active" },
              { id: "all", label: "All" },
              ...LAB_STATUS_ORDER.map((s) => ({
                id: s,
                label: LAB_STATUS_LABELS[s],
              })),
              { id: "cancelled" as LabOrderStatus, label: "Cancelled" },
            ] as { id: typeof filter; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
                filter === f.id
                  ? "bg-[#006E42] text-white"
                  : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
          <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ref, patient, test…"
            className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-[#0f3a26]/8">
          <p className="text-[13px] font-semibold text-[#0f3a26]">
            Nothing matches.
          </p>
          <p className="mt-1 text-[12px] text-[#0f3a26]/55">
            Try a different filter or clear the search.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
          {filtered.map((o, i) => (
            <li
              key={o.id}
              className={
                i === filtered.length - 1 ? "" : "border-b border-[#0f3a26]/6"
              }
            >
              <OrderRow
                order={o}
                onAdvance={() => onAdvance(o)}
                onCancel={() => onCancel(o)}
                busy={busyId === o.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================== OrderRow ============================== */

function OrderRow({
  order,
  onAdvance,
  onCancel,
  busy,
  timelineMarker,
  compact,
}: {
  order: LabOrder;
  onAdvance: () => void;
  onCancel: () => void;
  busy: boolean;
  timelineMarker?: boolean;
  compact?: boolean;
}) {
  const next = nextStatus(order.status);
  const terminal =
    order.status === "result-published" || order.status === "cancelled";
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      {timelineMarker ? (
        <div className="pt-1 text-right">
          <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
            {order.schedule.slotLabel.split(" - ")[0]}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[#0f3a26]/45">
            {order.homeCollection ? "Home" : "Walk-in"}
          </p>
        </div>
      ) : (
        <div className="text-right">
          <p className="text-[10.5px] font-semibold tracking-[0.12em] text-[#006E42] tabular-nums">
            {order.reference}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[#0f3a26]/65">
            {formatDate(order.schedule.date)}
          </p>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13.5px] font-bold text-[#0f3a26]">
            {order.pkg.name}
          </p>
          <p className="text-[12px] font-semibold tabular-nums text-[#0f3a26]">
            ₹{order.total.toLocaleString()}
          </p>
        </div>
        <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/65">
          {order.patient.fullName}
          {!compact && (
            <>
              <span className="text-[#0f3a26]/30"> · </span>
              {order.schedule.slotLabel}
              <span className="text-[#0f3a26]/30"> · </span>
              {order.pkg.parameterCount} params
            </>
          )}
        </p>
        {!compact && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#0f3a26]/55">
            {order.homeCollection && order.collectionAddress && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {order.collectionAddress}
              </span>
            )}
            {order.phlebotomist && (
              <span className="inline-flex items-center gap-1">
                <UserCog className="h-3 w-3" />
                {order.phlebotomist}
              </span>
            )}
            {order.fastingRequired && (
              <span className="inline-flex items-center gap-1 font-medium text-[#9c7426]">
                <Droplet className="h-3 w-3" />
                Fasting
              </span>
            )}
            {order.payment && (
              <>
                <span className="inline-flex items-center gap-1">
                  {order.payment.method === "cod" ? (
                    <Banknote className="h-3 w-3" />
                  ) : (
                    <CreditCard className="h-3 w-3" />
                  )}
                  {PAYMENT_METHOD_LABELS[order.payment.method]}
                </span>
                <PayPill status={order.payment.status} />
              </>
            )}
            {order.turnaroundHours != null && (
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {order.turnaroundHours}h TAT
              </span>
            )}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusPill status={order.status} />
          {!terminal && next && (
            <button
              onClick={onAdvance}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-md bg-[#006E42]/8 px-2 py-1 text-[10.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/15 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowRight className="h-3 w-3" />
              )}
              Move to {LAB_STATUS_LABELS[next]}
            </button>
          )}
          {!terminal && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-medium text-[#0f3a26]/55 transition hover:text-[#c14040]"
            >
              <XCircle className="h-3 w-3" />
              Cancel
            </button>
          )}
          {order.status === "result-published" && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#006E42]">
              <CheckCircle2 className="h-3 w-3" />
              Closed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Status pill ============================== */

function StatusPill({
  status,
  compact,
}: {
  status: LabOrderStatus;
  compact?: boolean;
}) {
  const tone: Record<LabOrderStatus, string> = {
    received: "bg-[#c79a3d]/15 text-[#9c7426]",
    confirmed: "bg-[#006E42]/12 text-[#006E42]",
    "sample-collected": "bg-[#3a72c1]/12 text-[#2a578f]",
    "in-lab": "bg-[#7b5cc5]/12 text-[#5a3fa0]",
    "result-published": "bg-[#006E42]/12 text-[#006E42]",
    cancelled: "bg-[#c14040]/10 text-[#c14040]",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider ${tone[status]} ${
        compact ? "text-[9.5px]" : "text-[10px]"
      }`}
    >
      {LAB_STATUS_LABELS[status]}
    </span>
  );
}

function PayPill({ status }: { status: PaymentStatus }) {
  const tone: Record<PaymentStatus, string> = {
    paid: "text-[#006E42]",
    pending: "text-[#9c7426]",
    refunded: "text-[#c14040]",
  };
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${tone[status]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "paid"
            ? "bg-[#006E42]"
            : status === "pending"
              ? "bg-[#c79a3d]"
              : "bg-[#c14040]"
        }`}
      />
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

/* ============================== Reports ============================== */

function ReportsPanel({ orders }: { orders: LabOrder[] | null }) {
  if (!orders)
    return (
      <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
    );

  const a = computeLabAnalytics(orders);
  const maxMonth = Math.max(1, ...a.byMonth.map((m) => m.revenue));
  const maxTest = Math.max(1, ...a.topTests.map((t) => t.revenue));

  return (
    <div className="space-y-6">
      {/* Revenue headline */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-[#006E42] p-5 text-white shadow-[0_14px_30px_-16px_rgba(0,110,66,0.45)] sm:col-span-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70">
            Total revenue
          </p>
          <p className="mt-1 text-[26px] font-bold tabular-nums leading-none">
            ₹{formatINR(a.totalRevenue)}
          </p>
          <p className="mt-1.5 text-[11px] text-white/70">
            {a.orderCount} settled orders
          </p>
        </div>
        <ReportStat
          icon={Banknote}
          label="Collected"
          value={`₹${formatINR(a.collectedRevenue)}`}
          sub="payment received"
        />
        <ReportStat
          icon={Wallet}
          label="Pending"
          value={`₹${formatINR(a.pendingRevenue)}`}
          sub="awaiting payment"
          warn={a.pendingRevenue > 0}
        />
        <ReportStat
          icon={Timer}
          label="Avg turnaround"
          value={a.avgTurnaroundHours != null ? `${a.avgTurnaroundHours}h` : "—"}
          sub="order to result"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly revenue */}
        <section className="rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[14px] font-bold text-[#0f3a26]">
              Revenue by month
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#006E42]">
              <TrendingUp className="h-3 w-3" />
              {a.avgOrderValue ? `₹${formatINR(a.avgOrderValue)} avg` : "—"}
            </span>
          </div>
          {a.byMonth.length === 0 ? (
            <p className="mt-4 text-[12px] text-[#0f3a26]/55">No revenue yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {a.byMonth.map((m) => (
                <li key={m.month}>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="font-semibold text-[#0f3a26]">
                      {formatMonth(m.month)}
                    </span>
                    <span className="tabular-nums text-[#0f3a26]/70">
                      {m.count} · ₹{formatINR(m.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#0f3a26]/[0.05]">
                    <div
                      className="h-full rounded-full bg-[#006E42]/85"
                      style={{ width: `${(m.revenue / maxMonth) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Payment method split */}
        <section className="rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
          <h2 className="text-[14px] font-bold text-[#0f3a26]">
            Payment methods
          </h2>
          {a.byMethod.length === 0 ? (
            <p className="mt-4 text-[12px] text-[#0f3a26]/55">No payments yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {a.byMethod.map((m) => {
                const pct = a.totalRevenue
                  ? Math.round((m.revenue / a.totalRevenue) * 100)
                  : 0;
                return (
                  <li
                    key={m.method}
                    className="flex items-center gap-3 rounded-xl bg-[#fbfdfb] px-3.5 py-2.5 ring-1 ring-inset ring-[#0f3a26]/6"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
                      {m.method === "cod" ? (
                        <Banknote className="h-3.5 w-3.5" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-[#0f3a26]">
                        {PAYMENT_METHOD_LABELS[m.method]}
                      </p>
                      <p className="text-[10.5px] text-[#0f3a26]/55">
                        {m.count} order{m.count === 1 ? "" : "s"} · {pct}%
                      </p>
                    </div>
                    <p className="text-[13px] font-bold tabular-nums text-[#0f3a26]">
                      ₹{formatINR(m.revenue)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-[#0f3a26]/8 pt-3 text-[11.5px]">
            <span className="text-[#0f3a26]/55">Refunded</span>
            <span className="font-semibold tabular-nums text-[#c14040]">
              ₹{formatINR(a.refundedRevenue)}
            </span>
          </div>
        </section>
      </div>

      {/* Top tests */}
      <section className="rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[14px] font-bold text-[#0f3a26]">
            Top tests by revenue
          </h2>
          <span className="text-[11px] text-[#0f3a26]/55">
            {a.homeShare}% home collection
          </span>
        </div>
        {a.topTests.length === 0 ? (
          <p className="mt-4 text-[12px] text-[#0f3a26]/55">No data yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {a.topTests.map((t, i) => (
              <li key={t.name} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[11px] font-bold text-[#006E42] tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="truncate font-semibold text-[#0f3a26]">
                      {t.name}
                    </span>
                    <span className="ml-2 shrink-0 tabular-nums text-[#0f3a26]/70">
                      {t.count} · ₹{formatINR(t.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#0f3a26]/[0.05]">
                    <div
                      className="h-full rounded-full bg-[#006E42]/70"
                      style={{ width: `${(t.revenue / maxTest) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-start gap-2 rounded-2xl bg-[#006E42]/[0.04] p-4 text-[11.5px] text-[#0f3a26]/65 ring-1 ring-inset ring-[#006E42]/15">
        <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006E42]" />
        <p>
          Payouts are reconciled weekly by SuppAI. For invoices and settlement
          queries, contact{" "}
          <a
            href="mailto:labs@suppai.health"
            className="font-semibold text-[#006E42] hover:underline"
          >
            labs@suppai.health
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function ReportStat({
  icon: Icon,
  label,
  value,
  sub,
  warn,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-3.5 w-3.5 ${warn ? "text-[#9c7426]" : "text-[#006E42]"}`}
        />
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
          {label}
        </p>
      </div>
      <p className="mt-1.5 text-[22px] font-bold tabular-nums leading-none text-[#0f3a26]">
        {value}
      </p>
      <p className="mt-1.5 text-[10.5px] text-[#0f3a26]/45">{sub}</p>
    </div>
  );
}

/* ============================== Helpers ============================== */

function nextStatus(s: LabOrderStatus): LabOrderStatus | null {
  const idx = LAB_STATUS_ORDER.indexOf(s);
  if (idx < 0 || idx === LAB_STATUS_ORDER.length - 1) return null;
  return LAB_STATUS_ORDER[idx + 1];
}
function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function isInPast(iso: string): boolean {
  return iso < isoToday();
}
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: ({ iso: string; day: number } | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) {
    const iso = new Date(year, month, d).toISOString().slice(0, 10);
    cells.push({ iso, day: d });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}
function longDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}
function shortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (iso === isoToday()) return "Today";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}
function formatINR(n: number) {
  return n.toLocaleString("en-IN");
}
function formatMonth(yyyymm: string) {
  try {
    const [y, m] = yyyymm.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return yyyymm;
  }
}
