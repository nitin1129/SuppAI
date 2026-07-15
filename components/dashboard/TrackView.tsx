"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Ban,
  Bell,
  Box,
  Calendar,
  CalendarClock,
  Check,
  ChevronDown,
  Clock,
  Download,
  Loader2,
  MapPin,
  Package,
  Pause,
  Play,
  Repeat,
  Replace,
  ShieldCheck,
  ShoppingBag,
  SkipForward,
  Stethoscope,
  TestTube,
  Truck,
  Undo2,
  User,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  PRODUCT_STATUS_LABEL,
  RESCHEDULE_CUTOFF_HOURS,
  TEST_STATUS_LABEL,
  canReschedule,
  dayGroupLabel,
  fetchOrders,
  relativeTime,
  rescheduleOrder,
  setProductResolution,
} from "@/lib/orders/service";
import {
  FREQUENCY_OPTIONS,
  cancelSub,
  changeFrequency,
  fetchSubscriptions,
  frequencyLabel,
  pauseSub,
  resumeSub,
  skipNext,
  type Subscription,
} from "@/lib/subscriptions/service";
import {
  PRODUCT_STEPS,
  TEST_STEPS,
  buildSteps,
  type ConsultOrder,
  type InsuranceOrder,
  type OrderKind,
  type OrderRecord,
  type ProductOrder,
  type TestOrder,
  type TimelineStep,
} from "@/lib/orders/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

type FilterKind = "all" | OrderKind | "subscription";

export function TrackView() {
  const reduce = useReducedMotion();
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders().then(setOrders);
    fetchSubscriptions().then(setSubs);
  }, []);

  function updateOrder(updated: OrderRecord) {
    setOrders((cur) => (cur ? cur.map((o) => (o.id === updated.id ? updated : o)) : cur));
  }
  function updateSub(updated: Subscription) {
    setSubs((cur) =>
      updated.status === "cancelled"
        ? cur.filter((s) => s.id !== updated.id)
        : cur.map((s) => (s.id === updated.id ? updated : s)),
    );
  }

  const upcoming = useMemo(() => {
    if (!orders) return [];
    const todayISO = new Date().toISOString().slice(0, 10);
    return orders
      .filter(
        (o) =>
          (o.kind === "consult" && o.status === "upcoming") ||
          (o.kind === "test" &&
            o.status !== "result_published" &&
            o.schedule.date >= todayISO),
      )
      .sort((a, b) =>
        (a as ConsultOrder | TestOrder).schedule.date.localeCompare(
          (b as ConsultOrder | TestOrder).schedule.date,
        ),
      ) as (ConsultOrder | TestOrder)[];
  }, [orders]);

  const grouped = useMemo(() => {
    if (!orders) return [];
    const filtered = orders.filter((o) => filter === "all" || o.kind === filter);
    const map = new Map<string, OrderRecord[]>();
    for (const o of filtered) {
      const key = o.placedAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(o);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, list]) => ({ date, list }));
  }, [orders, filter]);

  // Orchestration props, disabled under reduced motion.
  const orchestrate = reduce
    ? {}
    : ({ variants: container, initial: "hidden", animate: "show" } as const);
  const riseItem = reduce ? {} : ({ variants: rise } as const);

  if (!orders) {
    return (
      <div className="space-y-4 px-6 py-6 md:px-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) return <EmptyState />;

  return (
    <div className="px-6 py-6 md:px-10">
      {/* Upcoming appointments */}
      {upcoming.length > 0 && (
        <section className="mb-9">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">
              Upcoming appointments
            </h2>
            <span className="text-[11px] text-[#0f3a26]/45">{upcoming.length} scheduled</span>
          </div>
          <motion.div {...orchestrate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upcoming.map((o) => (
              <UpcomingCard key={o.id} order={o} itemProps={riseItem} reduce={!!reduce} />
            ))}
          </motion.div>
        </section>
      )}

      {/* Orders */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">Your orders</h2>
          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                { id: "all", label: "All" },
                { id: "product", label: "Products" },
                { id: "subscription", label: "Subscriptions" },
                { id: "test", label: "Tests" },
                { id: "consult", label: "Consults" },
                { id: "insurance", label: "Insurance" },
              ] as { id: FilterKind; label: string }[]
            ).map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`relative rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                    active ? "text-white" : "text-[#0f3a26]/70 hover:text-[#0f3a26]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "track-tab"}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="absolute inset-0 -z-0 rounded-full bg-[#006E42]"
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {filter === "subscription" ? (
              subs.length === 0 ? (
                <EmptyMini text="No subscriptions yet." />
              ) : (
                <motion.ul {...orchestrate} className="space-y-2.5">
                  {subs.map((s) => (
                    <SubscriptionRow
                      key={s.id}
                      sub={s}
                      isOpen={open === s.id}
                      onToggle={() => setOpen(open === s.id ? null : s.id)}
                      onChange={updateSub}
                      itemProps={riseItem}
                      reduce={!!reduce}
                    />
                  ))}
                </motion.ul>
              )
            ) : grouped.length === 0 && !(filter === "all" && subs.length > 0) ? (
              <EmptyMini text={`No ${filter === "all" ? "" : filter + " "}orders to show.`} />
            ) : (
              <div className="space-y-7">
                {filter === "all" && subs.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">
                      Subscriptions
                    </p>
                    <motion.ul {...orchestrate} className="space-y-2.5">
                      {subs.map((s) => (
                        <SubscriptionRow
                          key={s.id}
                          sub={s}
                          isOpen={open === s.id}
                          onToggle={() => setOpen(open === s.id ? null : s.id)}
                          onChange={updateSub}
                          itemProps={riseItem}
                          reduce={!!reduce}
                        />
                      ))}
                    </motion.ul>
                  </div>
                )}
                {grouped.map(({ date, list }) => (
                  <div key={date}>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">
                      {dayGroupLabel(date)}
                    </p>
                    <motion.ul {...orchestrate} className="space-y-2.5">
                      {list.map((o) => (
                        <OrderRow
                          key={o.id}
                          order={o}
                          isOpen={open === o.id}
                          onToggle={() => setOpen(open === o.id ? null : o.id)}
                          onOrderChange={updateOrder}
                          itemProps={riseItem}
                          reduce={!!reduce}
                        />
                      ))}
                    </motion.ul>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

/* ============================== Upcoming card ============================== */

function UpcomingCard({
  order,
  itemProps,
  reduce,
}: {
  order: ConsultOrder | TestOrder;
  itemProps: object;
  reduce: boolean;
}) {
  const isConsult = order.kind === "consult";
  const rel = relativeTime(order.schedule.date);
  const soon = rel === "Today" || rel === "Tomorrow";
  return (
    <motion.article
      {...itemProps}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="rounded-2xl bg-white p-4 ring-1 ring-[#006E42]/15"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]">
          {isConsult ? <Stethoscope className="h-5 w-5" /> : <TestTube className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[13.5px] font-bold text-[#0f3a26]">
              {isConsult ? (order as ConsultOrder).doctor.name : (order as TestOrder).vendorName}
            </p>
            <motion.span
              animate={soon && !reduce ? { scale: [1, 1.06, 1] } : undefined}
              transition={soon && !reduce ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                soon ? "bg-[#006E42] text-white" : "bg-[#006E42]/10 text-[#006E42]"
              }`}
            >
              <Bell className="h-2.5 w-2.5" />
              {rel}
            </motion.span>
          </div>
          <p className="text-[11.5px] text-[#0f3a26]/60">
            {isConsult
              ? (order as ConsultOrder).doctor.specialtyLabel
              : (order as TestOrder).tests.map((t) => t.name).join(", ")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#0f3a26]/65">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(order.schedule.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {order.schedule.slotLabel}
            </span>
            {isConsult && (
              <span className="inline-flex items-center gap-1">
                {(order as ConsultOrder).mode === "video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {(order as ConsultOrder).mode === "video" ? "Video" : "In-clinic"}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {order.patient.fullName}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================== Order row ============================== */

function OrderRow({
  order,
  isOpen,
  onToggle,
  onOrderChange,
  itemProps,
  reduce,
}: {
  order: OrderRecord;
  isOpen: boolean;
  onToggle: () => void;
  onOrderChange: (o: OrderRecord) => void;
  itemProps: object;
  reduce: boolean;
}) {
  const meta = rowMeta(order);

  return (
    <motion.li
      {...itemProps}
      whileHover={reduce || isOpen ? undefined : { y: -1 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-[#0f3a26]/[0.012]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#006E42]/8 text-[#006E42]">
          {meta.thumb ? (
            <Image src={meta.thumb} alt="" width={44} height={44} className="h-full w-full object-cover" />
          ) : (
            meta.icon
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-[#0f3a26]">{meta.title}</p>
          <p className="text-[11.5px] text-[#0f3a26]/55">{order.reference} · {meta.subtitle}</p>
        </div>
        <span className="hidden text-[12.5px] font-semibold tabular-nums text-[#0f3a26] sm:block">
          ₹{order.total.toLocaleString()}
        </span>
        <StatusPill tone={meta.tone} label={meta.statusLabel} />
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }}>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#0f3a26]/40" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#0f3a26]/8 px-4 py-5">
              <OrderDetail order={order} reduce={reduce} onOrderChange={onOrderChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/* ============================== Detail per kind ============================== */

function OrderDetail({
  order,
  reduce,
  onOrderChange,
}: {
  order: OrderRecord;
  reduce: boolean;
  onOrderChange: (o: OrderRecord) => void;
}) {
  switch (order.kind) {
    case "product":
      return <ProductDetail order={order} reduce={reduce} onOrderChange={onOrderChange} />;
    case "test":
      return <TestDetail order={order} reduce={reduce} onOrderChange={onOrderChange} />;
    case "consult":
      return <ConsultDetail order={order} onOrderChange={onOrderChange} />;
    case "insurance":
      return <InsuranceDetail order={order} />;
  }
}

function ProductDetail({
  order,
  reduce,
  onOrderChange,
}: {
  order: ProductOrder;
  reduce: boolean;
  onOrderChange: (o: OrderRecord) => void;
}) {
  const steps = buildSteps(PRODUCT_STEPS, order.status, order.placedAt);
  const [busy, setBusy] = useState<string | null>(null);
  const preShip = order.status === "placed" || order.status === "packed";
  const delivered = order.status === "delivered";

  async function resolve(res: "cancelled" | "return_requested") {
    setBusy(res);
    const updated = await setProductResolution(order.id, res);
    setBusy(null);
    if (updated) onOrderChange(updated);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <Timeline steps={steps} reduce={reduce} />
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0f3a26]/[0.03] px-3 py-2 text-[11.5px] text-[#0f3a26]/65">
          <MapPin className="h-3.5 w-3.5 text-[#006E42]" />
          {order.address}
        </p>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Items</p>
        <ul className="space-y-2">
          {order.lines.map((l, i) => (
            <li key={i} className="flex items-center gap-3">
              <Image src={l.image} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover ring-1 ring-inset ring-[#0f3a26]/8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-[#0f3a26]">{l.name}</p>
                <p className="text-[10.5px] text-[#0f3a26]/55">
                  {l.brand} · Qty {l.qty}
                  {l.subscription ? ` · every ${l.subscription.frequencyWeeks} wks` : ""}
                </p>
              </div>
              <p className="text-[12px] font-semibold tabular-nums text-[#0f3a26]">₹{l.price.toLocaleString()}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-[#0f3a26]/8 pt-3 text-[13px]">
          <span className="font-semibold text-[#0f3a26]/65">Total paid</span>
          <span className="font-bold tabular-nums text-[#0f3a26]">₹{order.total.toLocaleString()}</span>
        </div>

        {/* Actions */}
        {order.resolution ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0f3a26]/[0.04] px-3 py-2 text-[11.5px] font-medium text-[#0f3a26]/65">
            {order.resolution === "cancelled" ? <Ban className="h-3.5 w-3.5" /> : <Undo2 className="h-3.5 w-3.5" />}
            {order.resolution === "cancelled" ? "Order cancelled. Refund initiated to source." : "Return requested. Pickup will be scheduled."}
          </p>
        ) : (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-[#0f3a26]/6 pt-3">
            {preShip && (
              <ActionBtn icon={Ban} label="Cancel order" busy={busy === "cancelled"} onClick={() => resolve("cancelled")} danger />
            )}
            {delivered && (
              <ActionBtn icon={Undo2} label="Return" busy={busy === "return_requested"} onClick={() => resolve("return_requested")} />
            )}
            <Link
              href="/dashboard/shop"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-[#0f3a26]/65 transition hover:bg-[#0f3a26]/[0.04] hover:text-[#006E42]"
            >
              <Replace className="h-3.5 w-3.5" />
              Buy again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  busy,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition disabled:opacity-60 ${
        danger
          ? "text-[#0f3a26]/65 hover:bg-[#c14040]/10 hover:text-[#c14040]"
          : "text-[#0f3a26]/65 hover:bg-[#0f3a26]/[0.04] hover:text-[#006E42]"
      }`}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function TestDetail({
  order,
  reduce,
  onOrderChange,
}: {
  order: TestOrder;
  reduce: boolean;
  onOrderChange: (o: OrderRecord) => void;
}) {
  const steps = buildSteps(TEST_STEPS, order.status, order.placedAt);
  const published = order.status === "result_published";
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      <Timeline steps={steps} reduce={reduce} />
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Booking</p>
        <dl className="space-y-2 text-[12.5px]">
          <Row label="Lab" value={order.vendorName} />
          <Row label="Tests" value={order.tests.map((t) => t.name).join(", ")} />
          <Row label="Patient" value={order.patient.fullName} />
          <Row label="Slot" value={`${new Date(order.schedule.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${order.schedule.slotLabel}`} />
        </dl>
        {published ? (
          <motion.a
            whileTap={reduce ? undefined : { scale: 0.97 }}
            href={`/report/test/${order.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
          >
            <Download className="h-3.5 w-3.5" />
            Download report
          </motion.a>
        ) : (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#c79a3d]/12 px-3 py-2 text-[11.5px] font-medium text-[#9c7426]">
            <Clock className="h-3.5 w-3.5" />
            Report will be available once processing completes.
          </p>
        )}
        {order.status === "confirmed" && (
          <RescheduleControl order={order} onChange={onOrderChange} label="Reschedule collection" />
        )}
      </div>
    </div>
  );
}

function ConsultDetail({
  order,
  onOrderChange,
}: {
  order: ConsultOrder;
  onOrderChange: (o: OrderRecord) => void;
}) {
  const when = `${new Date(order.schedule.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${order.schedule.slotLabel}`;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <InfoTile icon={Calendar} label="Appointment" value={when} />
        <InfoTile
          icon={order.mode === "video" ? Video : MapPin}
          label="Mode"
          value={order.mode === "video" ? "Video consult" : "In-clinic"}
        />
        <InfoTile icon={User} label="Patient" value={order.patient.fullName} />
        <InfoTile icon={Wallet} label="Paid" value={`₹${order.total.toLocaleString()}`} />
      </div>

      {order.status === "upcoming" ? (
        <>
          <StatusStrip
            tone="good"
            icon={Bell}
            text={`${relativeTime(order.schedule.date)}. We'll remind you before it starts; the join link opens 10 minutes prior.`}
          />
          <RescheduleControl order={order} onChange={onOrderChange} />
        </>
      ) : order.status === "completed" ? (
        <StatusStrip tone="muted" icon={Check} text="This consultation is complete." />
      ) : (
        <StatusStrip tone="muted" icon={X} text="This appointment was cancelled." />
      )}
    </div>
  );
}

function InsuranceDetail({ order }: { order: InsuranceOrder }) {
  const active = order.status === "active";
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <InfoTile icon={ShieldCheck} label="Cover" value={`₹${(order.cover / 100000).toFixed(0)} Lakh`} />
        <InfoTile icon={Users} label="Members" value={String(order.members)} />
        <InfoTile icon={Calendar} label="Term" value={`${order.termYears} year${order.termYears === 1 ? "" : "s"}`} />
        <InfoTile icon={Wallet} label="Premium" value={`₹${order.total.toLocaleString()} / yr`} />
      </div>

      {active ? (
        <StatusStrip tone="good" icon={ShieldCheck} text="Policy active. Your cover is live and documents are in your email." />
      ) : (
        <StatusStrip tone="warn" icon={Clock} text="Awaiting activation. The insurer is verifying your details, this usually takes 1 to 2 working days." />
      )}
    </div>
  );
}

/* ============================== Detail primitives ============================== */

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#0f3a26]/[0.025] px-3.5 py-3">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">
        <Icon className="h-3 w-3 text-[#006E42]" />
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold leading-snug text-[#0f3a26]">{value}</p>
    </div>
  );
}

function StatusStrip({
  tone,
  icon: Icon,
  text,
}: {
  tone: "good" | "warn" | "muted";
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  const cls =
    tone === "good"
      ? "bg-[#006E42]/[0.06] text-[#006E42]"
      : tone === "warn"
        ? "bg-[#c79a3d]/12 text-[#9c7426]"
        : "bg-[#0f3a26]/[0.04] text-[#0f3a26]/65";
  return (
    <div className={`mt-3 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[12px] font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

const RESCHEDULE_SLOTS = [
  "07:00 - 07:30",
  "08:00 - 08:30",
  "09:00 - 09:30",
  "10:00 - 10:30",
  "11:00 - 11:30",
  "16:00 - 16:30",
  "17:00 - 17:30",
  "18:00 - 18:30",
];

function RescheduleControl({
  order,
  onChange,
  label = "Reschedule",
}: {
  order: ConsultOrder | TestOrder;
  onChange: (o: OrderRecord) => void;
  label?: string;
}) {
  const allowed = canReschedule(order.schedule);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Date options: next 7 days from tomorrow (always beyond the cutoff).
  const dates = useMemo(() => {
    const out: string[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, []);

  const [date, setDate] = useState(dates[0]);
  const [slot, setSlot] = useState(RESCHEDULE_SLOTS[0]);

  const reduce = useReducedMotion();

  if (!allowed) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#c79a3d]/10 px-3.5 py-2.5 text-[11.5px] font-medium text-[#9c7426]">
        <Clock className="mt-px h-3.5 w-3.5 shrink-0" />
        <span>
          Rescheduling has closed. Changes are allowed until {RESCHEDULE_CUTOFF_HOURS} hours before your slot.
        </span>
      </div>
    );
  }

  async function save() {
    setBusy(true);
    const updated = await rescheduleOrder(order.id, {
      date,
      slotId: `slot-${date}-${slot}`,
      slotLabel: slot,
    });
    setBusy(false);
    setOpen(false);
    if (updated) onChange(updated);
  }

  const currentSummary = `${new Date(order.schedule.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${order.schedule.slotLabel}`;
  const newSummary = `${new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}, ${slot.split(" - ")[0]}`;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!open ? (
        <motion.button
          key="trigger"
          onClick={() => setOpen(true)}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="group mt-3 flex w-full items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 text-left ring-1 ring-[#0f3a26]/10 transition hover:ring-[#006E42]/35"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
            <CalendarClock className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-[#0f3a26]">{label}</p>
            <p className="truncate text-[11px] text-[#0f3a26]/55">Currently {currentSummary}</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-[#006E42]">
            Change
            <ChevronDown className="h-3.5 w-3.5 -rotate-90 transition group-hover:translate-x-0.5" />
          </span>
        </motion.button>
      ) : (
        <motion.div
          key="panel"
          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-[#0f3a26]/10"
        >
          <div className="flex items-center justify-between border-b border-[#0f3a26]/8 px-4 py-2.5">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0f3a26]">
              <CalendarClock className="h-3.5 w-3.5 text-[#006E42]" />
              {label}
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/45 transition hover:bg-[#0f3a26]/5 hover:text-[#0f3a26]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Date</p>
            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {dates.map((d) => {
                const active = d === date;
                const dt = new Date(d);
                return (
                  <button
                    key={d}
                    onClick={() => setDate(d)}
                    className={`shrink-0 rounded-xl px-3 py-2 text-center leading-none transition ${
                      active
                        ? "bg-[#006E42] text-white shadow-[0_6px_14px_-8px_rgba(0,110,66,0.7)]"
                        : "bg-white text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/35"
                    }`}
                  >
                    <span className={`block text-[9px] font-semibold uppercase tracking-wide ${active ? "text-white/75" : "text-[#0f3a26]/45"}`}>
                      {dt.toLocaleDateString("en-IN", { weekday: "short" })}
                    </span>
                    <span className="mt-1 block text-[15px] font-bold tabular-nums">{dt.getDate()}</span>
                    <span className={`mt-0.5 block text-[9px] uppercase ${active ? "text-white/75" : "text-[#0f3a26]/45"}`}>
                      {dt.toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Time</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {RESCHEDULE_SLOTS.map((s) => {
                const active = s === slot;
                return (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`rounded-lg py-2 text-center text-[12px] font-semibold tabular-nums transition ${
                      active
                        ? "bg-[#006E42] text-white shadow-[0_6px_14px_-8px_rgba(0,110,66,0.7)]"
                        : "bg-white text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/35"
                    }`}
                  >
                    {s.split(" - ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#0f3a26]/8 bg-[#0f3a26]/[0.02] px-4 py-3">
            <p className="min-w-0 text-[11px] text-[#0f3a26]/55">
              New slot:{" "}
              <span className="font-semibold text-[#0f3a26]">{newSummary}</span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-[12px] font-medium text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Confirm
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================== Timeline ============================== */

function Timeline({ steps, reduce }: { steps: TimelineStep[]; reduce: boolean }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span aria-hidden className="absolute left-[9px] top-5 h-[calc(100%-8px)] w-px bg-[#0f3a26]/12">
                {s.state === "done" && (
                  <motion.span
                    className="absolute inset-0 block origin-top bg-[#006E42]"
                    initial={reduce ? { scaleY: 1 } : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.1 + i * 0.09 }}
                  />
                )}
              </span>
            )}
            <motion.span
              initial={reduce ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.32, ease: EASE, delay: reduce ? 0 : i * 0.09 }}
              className={`relative z-10 mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ${
                s.state === "done"
                  ? "bg-[#006E42] text-white"
                  : s.state === "current"
                    ? "bg-white ring-2 ring-[#006E42]"
                    : "bg-white ring-2 ring-[#0f3a26]/15"
              }`}
            >
              {s.state === "done" && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              {s.state === "current" && (
                <motion.span
                  className="h-2 w-2 rounded-full bg-[#006E42]"
                  animate={reduce ? undefined : { scale: [1, 0.7, 1], opacity: [1, 0.7, 1] }}
                  transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.span>
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: reduce ? 0 : 0.05 + i * 0.09 }}
              className="min-w-0 flex-1 pt-px"
            >
              <p className={`text-[12.5px] font-semibold ${s.state === "todo" ? "text-[#0f3a26]/40" : "text-[#0f3a26]"}`}>
                {s.label}
              </p>
              {s.at && (
                <p className="text-[10.5px] text-[#0f3a26]/45">
                  {new Date(s.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {s.state === "current" ? " · in progress" : ""}
                </p>
              )}
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================== Bits ============================== */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[#0f3a26]/45">{label}</dt>
      <dd className="text-right font-medium text-[#0f3a26]">{value}</dd>
    </div>
  );
}

function StatusPill({ tone, label }: { tone: "good" | "info" | "warn" | "muted"; label: string }) {
  const cls =
    tone === "good"
      ? "bg-[#006E42]/10 text-[#006E42]"
      : tone === "info"
        ? "bg-[#3a72c1]/12 text-[#2a578f]"
        : tone === "warn"
          ? "bg-[#c79a3d]/15 text-[#9c7426]"
          : "bg-[#0f3a26]/8 text-[#0f3a26]/55";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

type RowMeta = {
  title: string;
  subtitle: string;
  thumb?: string;
  icon: React.ReactNode;
  statusLabel: string;
  tone: "good" | "info" | "warn" | "muted";
};

function rowMeta(order: OrderRecord): RowMeta {
  switch (order.kind) {
    case "product": {
      const first = order.lines[0];
      const more = order.lines.length - 1;
      const resolved =
        order.resolution === "cancelled"
          ? { statusLabel: "Cancelled", tone: "muted" as const }
          : order.resolution === "return_requested"
            ? { statusLabel: "Return requested", tone: "warn" as const }
            : {
                statusLabel: PRODUCT_STATUS_LABEL[order.status],
                tone: (order.status === "delivered" ? "good" : "info") as "good" | "info",
              };
      return {
        title: more > 0 ? `${first.name} +${more} more` : first.name,
        subtitle: `${order.lines.length} item${order.lines.length === 1 ? "" : "s"}`,
        thumb: first.image,
        icon: <Package className="h-5 w-5" />,
        ...resolved,
      };
    }
    case "test":
      return {
        title: order.tests.map((t) => t.name).join(", "),
        subtitle: order.vendorName,
        icon: <TestTube className="h-5 w-5" />,
        statusLabel: TEST_STATUS_LABEL[order.status],
        tone: order.status === "result_published" ? "good" : "info",
      };
    case "consult":
      return {
        title: order.doctor.name,
        subtitle: order.doctor.specialtyLabel,
        icon: <Stethoscope className="h-5 w-5" />,
        statusLabel:
          order.status === "upcoming" ? "Upcoming" : order.status === "completed" ? "Completed" : "Cancelled",
        tone: order.status === "upcoming" ? "info" : order.status === "completed" ? "good" : "muted",
      };
    case "insurance":
      return {
        title: `${order.insurer} health cover`,
        subtitle: `₹${(order.cover / 100000).toFixed(0)} Lakh · ${order.members} members`,
        icon: <ShieldCheck className="h-5 w-5" />,
        statusLabel: order.status === "active" ? "Active" : "Pending",
        tone: order.status === "active" ? "good" : "warn",
      };
  }
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-[#0f3a26]/8">
      <p className="text-[13px] font-semibold text-[#0f3a26]">Nothing here yet.</p>
      <p className="mt-1 text-[12px] text-[#0f3a26]/55">{text}</p>
    </div>
  );
}

/* ============================== Subscription row ============================== */

function SubscriptionRow({
  sub,
  isOpen,
  onToggle,
  onChange,
  itemProps,
  reduce,
}: {
  sub: Subscription;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (s: Subscription) => void;
  itemProps: object;
  reduce: boolean;
}) {
  const paused = sub.status === "paused";
  return (
    <motion.li
      {...itemProps}
      whileHover={reduce || isOpen ? undefined : { y: -1 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-[#0f3a26]/[0.012]"
      >
        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#006E42]/8">
          <Image src={sub.image} alt="" width={44} height={44} className={`h-full w-full object-cover ${paused ? "opacity-60 saturate-50" : ""}`} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-[#0f3a26]">{sub.name}</p>
          <p className="text-[11.5px] text-[#0f3a26]/55">
            {frequencyLabel(sub.frequencyWeeks)}
            {" · "}
            {paused ? "Paused" : `Next ${new Date(sub.nextDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
          </p>
        </div>
        <span className="hidden text-[12.5px] font-semibold tabular-nums text-[#0f3a26] sm:block">
          ₹{sub.unitPrice.toLocaleString()}
        </span>
        <StatusPill tone={paused ? "muted" : "good"} label={paused ? "Paused" : "Active"} />
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }}>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#0f3a26]/40" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#0f3a26]/8 px-4 py-5">
              <SubscriptionDetail sub={sub} onChange={onChange} reduce={reduce} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function SubscriptionDetail({
  sub,
  onChange,
  reduce,
}: {
  sub: Subscription;
  onChange: (s: Subscription) => void;
  reduce: boolean;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [freqOpen, setFreqOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const paused = sub.status === "paused";

  async function run(key: string, fn: () => Promise<Subscription | null>) {
    setBusy(key);
    const updated = await fn();
    setBusy(null);
    setFreqOpen(false);
    setConfirmCancel(false);
    if (updated) onChange(updated);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <InfoTile icon={Repeat} label="Frequency" value={frequencyLabel(sub.frequencyWeeks)} />
        <InfoTile
          icon={CalendarClock}
          label="Next delivery"
          value={paused ? "Paused" : new Date(sub.nextDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        />
        <InfoTile icon={Truck} label="Delivered" value={`${sub.deliveredCount} times`} />
        <InfoTile icon={Wallet} label="Per cycle" value={`₹${sub.unitPrice.toLocaleString()}`} />
      </div>

      {/* Manage */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {paused ? (
          <ActionBtn icon={Play} label="Resume" busy={busy === "resume"} onClick={() => run("resume", () => resumeSub(sub.id))} />
        ) : (
          <>
            <ActionBtn icon={SkipForward} label="Skip next" busy={busy === "skip"} onClick={() => run("skip", () => skipNext(sub.id))} />
            <ActionBtn icon={Pause} label="Pause" busy={busy === "pause"} onClick={() => run("pause", () => pauseSub(sub.id))} />
          </>
        )}

        <div className="relative">
          <ActionBtn icon={Repeat} label="Change frequency" onClick={() => setFreqOpen((v) => !v)} />
          <AnimatePresence>
            {freqOpen && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="absolute bottom-full left-0 z-20 mb-2 w-44 overflow-hidden rounded-xl bg-white p-1 shadow-[0_18px_40px_-16px_rgba(0,30,18,0.35)] ring-1 ring-[#0f3a26]/10"
              >
                {FREQUENCY_OPTIONS.map((f) => {
                  const active = f.weeks === sub.frequencyWeeks;
                  return (
                    <button
                      key={f.weeks}
                      onClick={() => run("freq", () => changeFrequency(sub.id, f.weeks))}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition ${
                        active ? "bg-[#006E42]/8 text-[#006E42]" : "text-[#0f3a26]/75 hover:bg-[#0f3a26]/[0.04]"
                      }`}
                    >
                      {f.label}
                      {active && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/dashboard/shop"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-[#0f3a26]/65 transition hover:bg-[#0f3a26]/[0.04] hover:text-[#006E42]"
        >
          <Replace className="h-3.5 w-3.5" />
          Replace item
        </Link>

        <div className="ml-auto">
          {confirmCancel ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#0f3a26]/55">Cancel subscription?</span>
              <button
                onClick={() => run("cancel", () => cancelSub(sub.id))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#c14040] px-2.5 py-1.5 text-[11.5px] font-semibold text-white transition hover:brightness-95"
              >
                {busy === "cancel" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Confirm
              </button>
              <button onClick={() => setConfirmCancel(false)} className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/45 transition hover:bg-[#0f3a26]/5">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCancel(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-[#0f3a26]/55 transition hover:bg-[#c14040]/10 hover:text-[#c14040]"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Empty ============================== */

function EmptyState() {
  const tiles = [
    { href: "/dashboard/shop", label: "Shop supplements", icon: ShoppingBag },
    { href: "/dashboard/get-healthy", label: "Book a doctor", icon: Stethoscope },
    { href: "/dashboard/diagnose", label: "Book a test", icon: TestTube },
    { href: "/dashboard/plans", label: "Explore insurance", icon: ShieldCheck },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="mx-auto max-w-2xl px-6 py-16 md:px-10"
    >
      <div className="flex items-start gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#006E42]/10 text-[#006E42]">
          <Box className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-[#0f3a26]">Nothing to track yet.</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#0f3a26]/60">
            Once you order a product, book a test or consult, or take a policy, you&apos;ll follow it here from start to finish.
          </p>
        </div>
      </div>
      <ul className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="group flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#0f3a26]/8 transition hover:ring-[#006E42]/35"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]">
                <t.icon className="h-4 w-4" />
              </span>
              <span className="text-[13px] font-semibold text-[#0f3a26]">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
