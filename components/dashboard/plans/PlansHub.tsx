"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Crown,
  FileText,
  Plus,
  RefreshCw,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useBooking, type TierId } from "../booking/BookingContext";
import { fetchProPlans } from "@/lib/plans/service";
import { fetchOrders } from "@/lib/orders/service";
import { ActivityBlock, SectionHead } from "@/components/dashboard/HubBlocks";
import type { OrderRecord } from "@/lib/orders/types";
import type { ProPlan } from "@/lib/plans/types";
import { isRazorpayConfigured, openRazorpay } from "@/lib/payments/razorpay";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Props = {
  onStartInsurance: () => void;
};

const FREE_FEATURES = [
  "Limited AI report analysis",
  "Basic supplement suggestions",
  "View one meal plan per week",
];

export function PlansHub({ onStartInsurance }: Props) {
  const { currentTier, activeInsurance, setActiveInsurance, setCurrentTier } =
    useBooking();
  const [plans, setPlans] = useState<ProPlan[] | null>(null);
  const [activeId, setActiveId] = useState<ProPlan["id"]>("weekly");
  const [buyPlan, setBuyPlan] = useState<ProPlan | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState<{ plan: ProPlan; paymentId: string } | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchProPlans().then((p) => alive && setPlans(p));
    fetchOrders().then((o) => alive && setOrders(o));
    return () => {
      alive = false;
    };
  }, []);

  // Counts for the activity blocks, mirroring how Track groups them.
  const activity = useMemo(() => {
    if (!orders) return null;
    const todayISO = new Date().toISOString().slice(0, 10);
    type Sched = Extract<OrderRecord, { schedule: { date: string; slotLabel: string } }>;
    const appts = (orders.filter(
      (o) =>
        (o.kind === "consult" && o.status === "upcoming" && o.schedule.date >= todayISO) ||
        (o.kind === "test" && o.status !== "result_published" && o.schedule.date >= todayISO),
    ) as Sched[]).sort((a, b) => a.schedule.date.localeCompare(b.schedule.date));
    const next = appts[0];
    const open = orders.filter(
      (o) =>
        (o.kind === "product" && o.status !== "delivered") ||
        (o.kind === "test" && o.status !== "result_published"),
    ).length;
    return {
      total: orders.length,
      open,
      appts: appts.length,
      nextDate: next
        ? new Date(next.schedule.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })
        : null,
      nextSlot: next ? next.schedule.slotLabel : null,
    };
  }, [orders]);

  async function payNow(plan: ProPlan) {
    setPaying(true);
    const onOk = (paymentId: string) => {
      setCurrentTier(plan.id);
      setBuyPlan(null);
      setPaying(false);
      setPaid({ plan, paymentId });
    };
    // Demo mode until a real Razorpay Key ID is set: skip the popup, simulate success.
    if (!isRazorpayConfigured()) {
      await wait(700);
      onOk(`demo_${Date.now()}`);
      return;
    }
    try {
      await openRazorpay({
        amountPaise: plan.price * 100,
        name: "SuppAI",
        description: `SuppAI Pro, ${plan.label}`,
        notes: { plan: plan.id },
        onSuccess: (id) => onOk(id),
        onDismiss: () => setPaying(false),
      });
    } catch {
      setPaying(false);
    }
  }

  const tierMeta: Record<
    TierId,
    { label: string; badge: string; line: string }
  > = {
    free: {
      label: "Free",
      badge: "Free tier",
      line: "Basic features. Upgrade to unlock the full SuppAI experience.",
    },
    daily: { label: "Daily Pro", badge: "Pro · Daily", line: "Renews every day." },
    weekly: { label: "Weekly Pro", badge: "Pro · Weekly", line: "Renews every 7 days." },
  };
  const current = tierMeta[currentTier];
  const currentPlan = plans ? plans.find((p) => p.id === currentTier) ?? null : null;
  const isFree = currentTier === "free";
  // Only a cadence that costs less per day counts as an upgrade.
  const upsell =
    !isFree && plans
      ? plans.find((p) => p.id !== currentTier && p.perDay < (plans.find((c) => c.id === currentTier)?.perDay ?? Infinity)) ?? null
      : null;

  return (
    <div className="relative px-4 pb-12 pt-2 md:px-10 md:pb-14">
      {/* Soft top glow, no grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] opacity-90"
        style={{
          background:
            "radial-gradient(900px 360px at 50% -40%, rgba(0,110,66,0.10), transparent 70%)",
        }}
      />

      {/* Membership: one card carrying status, what is included, and the upgrade path */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`relative overflow-hidden rounded-2xl ${
          isFree
            ? "bg-white shadow-[0_2px_4px_-2px_rgba(15,58,38,0.04),0_18px_36px_-22px_rgba(15,58,38,0.18)] ring-1 ring-[#006E42]/12"
            : "bg-gradient-to-br from-[#0a8551] to-[#006E42] text-white shadow-[0_18px_45px_-22px_rgba(0,110,66,0.5)] ring-1 ring-[#0f3a26]/10"
        }`}
      >
        {!isFree && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.14] via-white/0 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          </>
        )}

        {/* identity + actions */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                isFree ? "bg-[#006E42]/10 text-[#006E42]" : "bg-white/15 text-white ring-1 ring-white/20"
              }`}
            >
              <Crown className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className={`text-[10.5px] font-semibold uppercase tracking-[0.16em] ${isFree ? "text-[#006E42]/70" : "text-[#9af2c4]"}`}>
                Current plan
              </p>
              <p className={`mt-0.5 text-[19px] font-bold leading-tight tracking-tight ${isFree ? "text-[#0f3a26]" : "text-white"}`}>
                {current.label}
              </p>
              <p className={`mt-0.5 text-[12.5px] ${isFree ? "text-[#0f3a26]/55" : "text-white/70"}`}>
                {currentPlan ? `₹${currentPlan.price} ${currentPlan.period} · ${current.line}` : current.line}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isFree ? (
              <a
                href="#pro-plans"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
              >
                See plans
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button
                onClick={() => setShowPlans((v) => !v)}
                className="rounded-xl bg-white/15 px-4 py-2.5 text-[12.5px] font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/25"
              >
                {showPlans ? "Hide plans" : "Change plan"}
              </button>
            )}
          </div>
        </div>

        {/* what the plan actually gives you, filling the row instead of dead space */}
        <div className={`relative flex flex-wrap gap-x-5 gap-y-2 border-t px-5 py-3 ${isFree ? "border-[#0f3a26]/8" : "border-white/15"}`}>
          {(isFree ? FREE_FEATURES : (currentPlan ? currentPlan.features.slice(0, 5) : [])).map((f) => (
            <span
              key={f}
              className={`inline-flex items-center gap-1.5 text-[12px] ${isFree ? "text-[#0f3a26]/65" : "text-white/85"}`}
            >
              <Check className={`h-3.5 w-3.5 shrink-0 ${isFree ? "text-[#006E42]" : "text-[#9af2c4]"}`} strokeWidth={3} />
              {f}
            </span>
          ))}
        </div>

        {/* the upgrade nudge lives here, not in a second bar */}
        {upsell && (
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/15 bg-white/[0.08] px-5 py-3">
            <p className="text-[12.5px] text-white/85">
              Switch to {upsell.label} and pay about ₹{upsell.perDay} a day.
            </p>
            <button
              onClick={() => setBuyPlan(upsell)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#006E42] transition hover:bg-white/90"
            >
              Upgrade
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Pro pricing: the pitch while on Free, on demand once subscribed */}
      {isFree && (
        <div id="pro-plans" className="mt-9">
          <SectionHead label="SuppAI Pro" title="Choose a cadence" />
          <p className="text-[12.5px] leading-relaxed text-[#0f3a26]/55">
            Cancel anytime. Pro powers AI report analysis, personalised plans, and priority care.
          </p>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-5 lg:grid-cols-2 ${isFree ? "mt-8" : showPlans ? "mt-6" : "hidden"}`}>
        {(plans ?? Array.from({ length: 2 }).map(() => null)).map((plan, i) =>
          plan ? (
            <PlanCard
              key={plan.id}
              plan={plan}
              active={activeId === plan.id}
              isCurrent={currentTier === plan.id}
              onSelect={() => {
                setActiveId(plan.id);
                setBuyPlan(plan);
              }}
              delay={i * 0.06}
            />
          ) : (
            <div
              key={i}
              className="h-[340px] animate-pulse rounded-3xl bg-white shadow-[0_1px_2px_-1px_rgba(15,58,38,0.04),0_10px_24px_-18px_rgba(15,58,38,0.15)] ring-1 ring-[#006E42]/8"
            />
          ),
        )}
      </div>

      {/* Insurance */}
      <div className="mt-9">
        <SectionHead label="Insurance" title={activeInsurance ? "Your active policy" : "Health cover"} />
      </div>

      {activeInsurance ? (
        <ActiveInsuranceCard
          insurance={activeInsurance}
          onBuyNew={onStartInsurance}
          onRemove={() => setActiveInsurance(null)}
        />
      ) : (
        <motion.button
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={onStartInsurance}
          className="group flex w-full flex-col items-start gap-4 rounded-2xl bg-white p-5 text-left shadow-[0_1px_2px_-1px_rgba(15,58,38,0.04),0_12px_28px_-20px_rgba(15,58,38,0.18)] ring-1 ring-[#006E42]/12 transition hover:ring-[#006E42]/30 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
            <ShieldCheck className="h-6 w-6" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#006E42]/70">
              Get covered
            </p>
            <h3 className="mt-0.5 text-[16px] font-semibold tracking-tight text-[#0f3a26]">
              Personalised health insurance
            </h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#0f3a26]/60">
              Add your family, share medical history, and we&apos;ll match you with the right cover from leading insurers.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge>Cover up to ₹25L</Badge>
              <Badge>Cashless network</Badge>
              <Badge>80D tax savings</Badge>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#006E42] px-4 py-2.5 text-[12.5px] font-semibold text-white transition group-hover:bg-[#005634]">
            Get covered
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </motion.button>
      )}

      {/* Orders and appointments, folded in from Track & Manage */}
      <div className="mt-9">
        <SectionHead label="Your activity" title="Orders and appointments" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <ActivityBlock
          href="/dashboard/track#orders"
          icon={Receipt}
          label="Orders"
          value={activity ? String(activity.total) : null}
          unit={activity && activity.total === 1 ? "order" : "orders"}
          detail={activity ? (activity.open > 0 ? activity.open + " still in progress" : "All caught up, nothing pending") : ""}
          cta="Track orders"
        />
        <ActivityBlock
          href="/dashboard/track#appointments"
          icon={CalendarDays}
          label="Appointments"
          value={activity ? String(activity.appts) : null}
          unit="upcoming"
          detail={activity ? (activity.nextDate ? "Next on " + activity.nextDate + (activity.nextSlot ? ", " + activity.nextSlot : "") : "Nothing booked yet") : ""}
          cta="View appointments"
        />
      </div>

      <ProPayModal plan={buyPlan} paying={paying} onClose={() => { if (!paying) setBuyPlan(null); }} onConfirm={payNow} />
      <ProPaidModal info={paid} onClose={() => setPaid(null)} />
    </div>
  );
}

function ProPayModal({ plan, paying, onClose, onConfirm }: { plan: ProPlan | null; paying: boolean; onClose: () => void; onConfirm: (p: ProPlan) => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!plan) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !paying) onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [plan, paying, onClose]);

  const demo = !isRazorpayConfigured();

  return (
    <AnimatePresence>
      {plan && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[#0f3a26]/50" onClick={() => !paying && onClose()} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-label="Confirm plan" className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_2px_4px_-2px_rgba(15,58,38,0.06),0_16px_36px_-20px_rgba(15,58,38,0.28)] ring-1 ring-[#0f3a26]/10" initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-1.5 text-[#006E42]"><ShieldCheck className="h-4 w-4" /><span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Secure checkout</span></div>
            <h2 className="mt-2 text-[18px] font-bold tracking-tight text-[#0f3a26]">Confirm your plan</h2>
            <p className="text-[12.5px] text-[#0f3a26]/60">Continue to payment. No cart, no extra steps.</p>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f1f7f3] p-4 ring-1 ring-inset ring-[#0f3a26]/[0.06]">
              <div>
                <p className="text-[13.5px] font-bold text-[#0f3a26]">SuppAI Pro, {plan.label}</p>
                <p className="text-[11.5px] text-[#0f3a26]/55">{plan.blurb}</p>
              </div>
              <p className="text-[22px] font-bold tabular-nums text-[#0f3a26]">₹{plan.price}</p>
            </div>

            {demo && <p className="mt-3 rounded-xl bg-[#c79a3d]/12 px-3 py-2 text-[11px] font-medium leading-snug text-[#9c7426]">Demo mode: no real charge. Add your Razorpay Key ID in lib/payments/razorpay.ts to take live payments.</p>}

            <div className="mt-5 flex items-center gap-2">
              <button onClick={() => !paying && onClose()} disabled={paying} className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-[#0f3a26]/60 transition hover:text-[#0f3a26] disabled:opacity-40">Cancel</button>
              <button onClick={() => onConfirm(plan)} disabled={paying} className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#006E42] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-60">
                {paying ? <><RefreshCw className="h-4 w-4 animate-spin" />Processing</> : <>Confirm and pay ₹{plan.price}</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProPaidModal({ info, onClose }: { info: { plan: ProPlan; paymentId: string } | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!info) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [info, onClose]);

  return (
    <AnimatePresence>
      {info && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[#0f3a26]/50" onClick={onClose} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-label="Payment successful" className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[0_2px_4px_-2px_rgba(15,58,38,0.06),0_16px_36px_-20px_rgba(15,58,38,0.28)] ring-1 ring-[#0f3a26]/10" initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <motion.span initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#006E42]/12 text-[#006E42]"><CheckCircle2 className="h-9 w-9" /></motion.span>
            <h2 className="mt-4 text-[19px] font-bold tracking-tight text-[#0f3a26]">Payment successful</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#0f3a26]/65">You paid <span className="font-semibold text-[#0f3a26]">₹{info.plan.price}</span> and you&apos;re now on the {info.plan.label} Pro plan.</p>
            <p className="mx-auto mt-3 inline-block rounded-lg bg-[#f1f7f3] px-3 py-1.5 text-[10.5px] font-medium text-[#0f3a26]/50 ring-1 ring-inset ring-[#0f3a26]/[0.06]">Payment ID: {info.paymentId}</p>
            <button onClick={onClose} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006E42] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#005634]">Done</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006E42]/8 px-2.5 py-1 text-[11px] font-medium text-[#006E42] ring-1 ring-inset ring-[#006E42]/12">
      <Sparkles className="h-3 w-3" />
      {children}
    </span>
  );
}

function ActiveInsuranceCard({
  insurance,
  onBuyNew,
  onRemove,
}: {
  insurance: import("../booking/BookingContext").ActiveInsurance;
  onBuyNew: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white p-7 shadow-[0_2px_4px_-2px_rgba(15,58,38,0.05),0_18px_36px_-22px_rgba(15,58,38,0.18)] ring-1 ring-[#006E42]/15">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#006E42]/8 blur-3xl"
        />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
                Active policy
              </p>
              <p className="text-[18px] font-semibold text-[#0f3a26]">
                {insurance.insurer}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#006E42] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Active
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[#006E42]/10 pt-4">
          <Stat label="Cover" value={`₹${(insurance.cover / 100000).toFixed(0)}L`} />
          <Stat
            label="Members"
            value={`${insurance.members} ${insurance.members === 1 ? "person" : "people"}`}
          />
          <Stat label="Term" value={`${insurance.termYears} yr`} />
        </div>

        <ul className="mt-5 space-y-1.5">
          {insurance.policy.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-[12.5px] text-[#0f3a26]/70"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006E42]" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-4 py-2 text-[12.5px] font-medium text-white transition hover:bg-[#005634]">
            <FileText className="h-3.5 w-3.5" />
            View policy
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[12.5px] font-medium text-[#0f3a26] ring-1 ring-[#006E42]/15 transition hover:ring-[#006E42]/35">
            File a claim
          </button>
          <button
            onClick={onRemove}
            className="rounded-lg px-3 py-2 text-[12px] font-medium text-[#0f3a26]/45 transition hover:text-[#a82929]"
          >
            Cancel policy
          </button>
        </div>
      </div>

      <button
        onClick={onBuyNew}
        className="group flex flex-col rounded-3xl border-2 border-dashed border-[#006E42]/25 bg-[#006E42]/[0.03] p-7 text-left transition hover:border-[#006E42]/50 hover:bg-[#006E42]/[0.06]"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white ring-1 ring-[#006E42]/15 text-[#006E42]">
          <Plus className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
          Need more?
        </p>
        <h4 className="mt-1 text-[18px] font-semibold tracking-tight text-[#0f3a26]">
          Buy an additional policy
        </h4>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#0f3a26]/55">
          Add a top-up, a critical-illness rider, or cover for another set of
          family members.
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[12.5px] font-semibold text-[#006E42]">
          Start a new policy
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </button>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-semibold text-[#0f3a26]">{value}</p>
    </div>
  );
}

function PlanCard({
  plan,
  active,
  isCurrent,
  onSelect,
  delay,
}: {
  plan: ProPlan;
  active: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const isHighlight = !!plan.highlight;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl p-6 transition-shadow duration-300 ease-out ${
        isHighlight
          ? "bg-gradient-to-br from-[#0a8551] via-[#007a4a] to-[#006E42] text-white shadow-[0_2px_4px_-2px_rgba(0,110,66,0.4),0_24px_50px_-22px_rgba(0,110,66,0.45)] ring-1 ring-[#0f3a26]/10 hover:shadow-[0_4px_8px_-3px_rgba(0,110,66,0.45),0_30px_55px_-22px_rgba(0,110,66,0.55)]"
          : "bg-white text-[#0f3a26] shadow-[0_1px_2px_-1px_rgba(15,58,38,0.04),0_12px_28px_-18px_rgba(15,58,38,0.18)] ring-1 ring-[#006E42]/12 hover:shadow-[0_2px_4px_-2px_rgba(15,58,38,0.06),0_22px_40px_-22px_rgba(0,110,66,0.22)] hover:ring-[#006E42]/25"
      }`}
    >
      {isHighlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-20 h-56 w-56 rounded-full bg-white/12 blur-3xl"
        />
      )}

      {plan.highlight && (
        <span className="absolute right-5 top-5 z-10 rounded-full bg-white/18 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur-sm">
          {plan.highlight}
        </span>
      )}

      <div className="relative z-10 flex flex-1 flex-col">
      <p
        className={`text-[12px] font-medium uppercase tracking-[0.14em] ${
          isHighlight ? "text-[#9af2c4]" : "text-[#006E42]/70"
        }`}
      >
        {plan.label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[36px] font-semibold leading-none">
          ₹{plan.price}
        </span>
        <span
          className={`text-[14px] ${
            isHighlight ? "text-white/65" : "text-[#0f3a26]/55"
          }`}
        >
          {plan.period}
        </span>
      </div>
      <p
        className={`mt-1 text-[11.5px] ${
          isHighlight ? "text-white/55" : "text-[#0f3a26]/50"
        }`}
      >
        Around ₹{plan.perDay}/day
      </p>

      <p
        className={`mt-4 text-[13px] leading-relaxed ${
          isHighlight ? "text-white/75" : "text-[#0f3a26]/65"
        }`}
      >
        {plan.blurb}
      </p>

      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 text-[13px] ${
              isHighlight ? "text-white/85" : "text-[#0f3a26]/75"
            }`}
          >
            <span
              className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                isHighlight ? "bg-[#9af2c4] text-[#0f3a26]" : "bg-[#006E42] text-white"
              }`}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors duration-200 ease-out ${
          isCurrent
            ? isHighlight
              ? "bg-white/15 text-white ring-1 ring-white/25"
              : "bg-[#006E42]/10 text-[#006E42] ring-1 ring-[#006E42]/20"
            : isHighlight
              ? "bg-white text-[#0f3a26] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.35)] hover:bg-white/90"
              : "bg-[#006E42] text-white shadow-[0_8px_18px_-10px_rgba(0,110,66,0.6)] hover:bg-[#005634]"
        } ${active && !isCurrent ? "ring-2 ring-offset-2 ring-[#006E42]/40" : ""}`}
      >
        {isCurrent ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Current plan
          </>
        ) : (
          <>
            {active ? "Selected" : "Choose plan"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      </div>
    </motion.div>
  );
}
