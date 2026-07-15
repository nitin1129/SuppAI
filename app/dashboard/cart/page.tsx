"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Loader2,
  Minus,
  Plus,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Trash2,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/lib/cart/CartContext";
import { createOrdersFromCart } from "@/lib/orders/service";
import type {
  CartConsult,
  CartInsurance,
  CartItem,
  CartProductOneTime,
  CartProductSubscription,
  CartTest,
} from "@/lib/cart/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CartPage() {
  const router = useRouter();
  const { items, oneTime, subscriptions, totals, hydrated, clear } = useCart();
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePay() {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1100));
    // Persist the paid cart as order/booking records for Track & manage.
    createOrdersFromCart(items);
    setPaying(false);
    setPaid(true);
    setTimeout(() => {
      clear();
      router.push("/dashboard/track");
    }, 1400);
  }

  if (!hydrated) {
    return (
      <div className="px-10 py-8">
        <div className="h-72 animate-pulse rounded-3xl bg-white ring-1 ring-[#0f3a26]/8" />
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid grid-cols-1 gap-10 px-10 py-8 lg:grid-cols-[1fr_360px]">
      {/* Left: cart contents */}
      <div className="min-w-0 space-y-9">
        {oneTime.length > 0 && (
          <Section
            label="Pay today"
            count={oneTime.length}
            hint="One-time purchases, consults, tests, and policy premiums"
          >
            <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
              {oneTime.map((item, i) => (
                <li
                  key={item.id}
                  className={`${
                    i === oneTime.length - 1 ? "" : "border-b border-[#0f3a26]/8"
                  }`}
                >
                  <CartRow item={item} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {subscriptions.length > 0 && (
          <Section
            label="Subscriptions"
            count={subscriptions.length}
            hint="First cycle charged today, recurring on schedule"
            accent
          >
            <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#006E42]/15">
              {subscriptions.map((item, i) => (
                <li
                  key={item.id}
                  className={`${
                    i === subscriptions.length - 1
                      ? ""
                      : "border-b border-[#006E42]/10"
                  }`}
                >
                  <CartRow item={item} />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Right: sticky summary */}
      <aside>
        <div className="lg:sticky lg:top-8 lg:space-y-5">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
              Order summary
            </p>

            <dl className="mt-4 space-y-2.5 text-[13px]">
              {totals.oneTimeSubtotal > 0 && (
                <Row
                  label={`One-time (${oneTime.length})`}
                  value={`₹${totals.oneTimeSubtotal.toLocaleString()}`}
                />
              )}
              {totals.subscriptionSubtotal > 0 && (
                <Row
                  label={`Subscriptions (${subscriptions.length})`}
                  value={`₹${totals.subscriptionSubtotal.toLocaleString()}`}
                  hint="first cycle"
                />
              )}
              {totals.oneTimeSavings > 0 && (
                <Row
                  label="You save"
                  value={`-₹${totals.oneTimeSavings.toLocaleString()}`}
                  tone="good"
                />
              )}
              {totals.oneTimeTax > 0 && (
                <Row
                  label="GST &amp; fees"
                  value={`₹${totals.oneTimeTax.toLocaleString()}`}
                />
              )}
              <div className="!mt-4 border-t border-[#0f3a26]/8 pt-4" />
              <Row
                label="Pay today"
                value={`₹${totals.total.toLocaleString()}`}
                strong
              />
            </dl>

            <button
              onClick={handlePay}
              disabled={paying || paid}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006E42] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(0,110,66,0.6)] transition hover:bg-[#005634] disabled:cursor-not-allowed"
            >
              {paid ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Paid · redirecting
                </>
              ) : paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing payment
                </>
              ) : (
                <>
                  Pay ₹{totals.total.toLocaleString()}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[10.5px] text-[#0f3a26]/45">
              Demo build · no real charges
            </p>
          </div>

          <div className="rounded-2xl bg-[#006E42]/[0.04] p-4 ring-1 ring-inset ring-[#006E42]/15">
            <p className="text-[11.5px] font-semibold text-[#006E42]">
              <ShieldCheck className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
              Money-back if you cancel within 24 h
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-[#0f3a26]/65">
              Subscriptions can be paused or cancelled anytime from Account → Subscriptions.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ============================== Empty state ============================== */

function EmptyCart() {
  const tiles = [
    {
      href: "/dashboard/shop",
      title: "Shop supplements",
      body: "Daily essentials, performance, recovery.",
      icon: ShoppingBag,
    },
    {
      href: "/dashboard/get-healthy",
      title: "Book a doctor",
      body: "Video or in-clinic consults with specialists.",
      icon: Stethoscope,
    },
    {
      href: "/dashboard/diagnose",
      title: "Book a test",
      body: "Lab tests with home sample collection.",
      icon: CalendarCheck2,
    },
    {
      href: "/dashboard/plans",
      title: "Compare insurance",
      body: "Family cover that fits your budget.",
      icon: ShieldCheck,
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="mx-auto max-w-3xl px-10 py-16"
    >
      <div className="flex items-start gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#006E42]/10 text-[#006E42]">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-[#0f3a26]">
            Your cart is empty.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/60">
            Everything you book — products, consults, tests, insurance — collects here for a single payment.
          </p>
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="group flex h-full items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8 transition hover:ring-[#006E42]/35"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]">
                <t.icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#0f3a26]">
                  {t.title}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#0f3a26]/60">
                  {t.body}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-[#0f3a26]/40 transition group-hover:translate-x-0.5 group-hover:text-[#006E42]" />
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ============================== Section ============================== */

function Section({
  label,
  count,
  hint,
  accent,
  children,
}: {
  label: string;
  count: number;
  hint: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold tracking-tight text-[#0f3a26]">
            {label}
            <span
              className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                accent ? "bg-[#006E42]/12 text-[#006E42]" : "bg-[#0f3a26]/8 text-[#0f3a26]/70"
              }`}
            >
              {count}
            </span>
          </h2>
          <p className="mt-1 text-[12px] text-[#0f3a26]/55">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/* ============================== Rows ============================== */

function CartRow({ item }: { item: CartItem }) {
  switch (item.kind) {
    case "product-onetime":
      return <ProductOneTimeRow item={item} />;
    case "product-subscription":
      return <ProductSubscriptionRow item={item} />;
    case "consult":
      return <ConsultRow item={item} />;
    case "test":
      return <TestRow item={item} />;
    case "insurance":
      return <InsuranceRow item={item} />;
  }
}

function RemoveBtn({ id }: { id: string }) {
  const { removeItem } = useCart();
  return (
    <button
      onClick={() => removeItem(id)}
      aria-label="Remove from cart"
      className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/45 transition hover:bg-[#c14040]/10 hover:text-[#c14040]"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function ProductOneTimeRow({ item }: { item: CartProductOneTime }) {
  const { updateQty } = useCart();
  const lineTotal = item.unitPrice * item.qty;
  return (
    <div className="flex items-start gap-5 px-5 py-5">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
          {item.brand}
        </p>
        <p className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
          {item.name}
        </p>
        {item.packLabel && (
          <p className="mt-1 text-[11.5px] text-[#0f3a26]/60">{item.packLabel}</p>
        )}

        <div className="mt-3 inline-flex items-center gap-0.5 rounded-lg bg-[#0f3a26]/[0.04] p-0.5">
          <button
            onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
            aria-label="Decrease quantity"
            className="grid h-7 w-7 place-items-center rounded-md text-[#0f3a26]/65 transition hover:bg-white hover:text-[#006E42]"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[28px] text-center text-[12.5px] font-bold tabular-nums text-[#0f3a26]">
            {item.qty}
          </span>
          <button
            onClick={() => updateQty(item.id, item.qty + 1)}
            aria-label="Increase quantity"
            className="grid h-7 w-7 place-items-center rounded-md text-[#0f3a26]/65 transition hover:bg-white hover:text-[#006E42]"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
          ₹{lineTotal.toLocaleString()}
        </p>
        {item.unitMrp > item.unitPrice && (
          <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/45 line-through tabular-nums">
            ₹{(item.unitMrp * item.qty).toLocaleString()}
          </p>
        )}
        <div className="mt-2">
          <RemoveBtn id={item.id} />
        </div>
      </div>
    </div>
  );
}

function ProductSubscriptionRow({ item }: { item: CartProductSubscription }) {
  return (
    <div className="flex items-start gap-5 px-5 py-5">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#006E42]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#006E42]">
          <Repeat className="h-2.5 w-2.5" />
          Renews every {item.frequencyWeeks} weeks
        </span>
        <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
          {item.brand}
        </p>
        <p className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
          {item.name}
        </p>
        <p className="mt-1 text-[11.5px] text-[#0f3a26]/60">{item.packLabel}</p>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
          ₹{item.unitPrice.toLocaleString()}
        </p>
        {item.unitMrp > item.unitPrice && (
          <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/45 line-through tabular-nums">
            ₹{item.unitMrp.toLocaleString()}
          </p>
        )}
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#0f3a26]/45">
          / cycle
        </p>
        <div className="mt-2">
          <RemoveBtn id={item.id} />
        </div>
      </div>
    </div>
  );
}

function ConsultRow({ item }: { item: CartConsult }) {
  const total = item.fee + item.platformFee;
  return (
    <div className="flex items-start gap-5 px-5 py-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
        <Stethoscope className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
          Consultation
        </p>
        <p className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
          {item.doctor.name}
        </p>
        <p className="text-[12px] text-[#0f3a26]/60">
          {item.doctor.specialtyLabel}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[#0f3a26]/65">
          <span className="inline-flex items-center gap-1">
            {item.mode === "video" ? (
              <Video className="h-3 w-3" />
            ) : (
              <CalendarCheck2 className="h-3 w-3" />
            )}
            {item.mode === "video" ? "Video consult" : "In-clinic"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatScheduleShort(item.schedule)}
          </span>
          <span>{item.patient.fullName}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
          ₹{total.toLocaleString()}
        </p>
        <p className="text-[10px] text-[#0f3a26]/45">includes platform fee</p>
        <div className="mt-2">
          <RemoveBtn id={item.id} />
        </div>
      </div>
    </div>
  );
}

function TestRow({ item }: { item: CartTest }) {
  const total = item.subtotal + item.collectionFee;
  return (
    <div className="flex items-start gap-5 px-5 py-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
        <CalendarCheck2 className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
          Lab test · {item.vendorName}
        </p>
        <p className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
          {item.tests.map((t) => t.name).join(" + ")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[#0f3a26]/65">
          <span>{item.patient.fullName}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatScheduleShort(item.schedule)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
          ₹{total.toLocaleString()}
        </p>
        {item.collectionFee > 0 && (
          <p className="text-[10px] text-[#0f3a26]/45">
            includes ₹{item.collectionFee} collection
          </p>
        )}
        <div className="mt-2">
          <RemoveBtn id={item.id} />
        </div>
      </div>
    </div>
  );
}

function InsuranceRow({ item }: { item: CartInsurance }) {
  return (
    <div className="flex items-start gap-5 px-5 py-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
          Health insurance
        </p>
        <p className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
          {item.insurer}
        </p>
        <p className="text-[12px] text-[#0f3a26]/60">
          ₹{(item.cover / 100000).toFixed(0)} L cover · {item.termYears}-year
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[#0f3a26]/65">
          <span>Cover ₹{(item.cover / 100000).toFixed(0)} L</span>
          <span>{item.members} member{item.members === 1 ? "" : "s"}</span>
          <span>{item.termYears}-year term</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
          ₹{item.premium.toLocaleString()}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-[#0f3a26]/45">
          annual premium
        </p>
        <div className="mt-2">
          <RemoveBtn id={item.id} />
        </div>
      </div>
    </div>
  );
}

/* ============================== Helpers ============================== */

function Row({
  label,
  value,
  hint,
  strong,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
  tone?: "default" | "good";
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-[#0f3a26]/65">
        {label}
        {hint && (
          <span className="ml-1 text-[10.5px] text-[#0f3a26]/45">{hint}</span>
        )}
      </dt>
      <dd
        className={`tabular-nums ${tone === "good" ? "text-[#006E42]" : "text-[#0f3a26]"} ${
          strong ? "text-[18px] font-bold" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatScheduleShort(s: {
  date: string;
  slotLabel: string;
}): string {
  try {
    const d = new Date(s.date);
    const day = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${day} · ${s.slotLabel}`;
  } catch {
    return s.slotLabel;
  }
}
