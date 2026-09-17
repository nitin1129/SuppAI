"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { useBooking } from "./booking/BookingContext";
import { VendorLogo } from "./booking/VendorLogo";
import { formatBookingDate } from "@/lib/booking/date";
import { InsuranceFlow } from "./plans/InsuranceFlow";
import { PlansHub } from "./plans/PlansHub";

const methods = [
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Card", sub: "Credit / debit", icon: CreditCard },
  { id: "netbanking", label: "Net banking", sub: "All major banks", icon: Landmark },
  { id: "wallet", label: "Wallet", sub: "SuppAI credits", icon: Wallet },
];

export function PlansView() {
  const { pendingOrder } = useBooking();
  const [mode, setMode] = useState<"hub" | "insurance">("hub");

  if (pendingOrder) return <Payment />;
  if (mode === "insurance")
    return <InsuranceFlow onExit={() => setMode("hub")} />;
  return <PlansHub onStartInsurance={() => setMode("insurance")} />;
}

function Payment() {
  const { pendingOrder, clearOrder, setCurrentTier } = useBooking();
  const [method, setMethod] = useState("upi");
  const [status, setStatus] = useState<"idle" | "processing" | "paid">("idle");

  if (!pendingOrder) return null;
  const o = pendingOrder;

  function pay() {
    setStatus("processing");
    setTimeout(() => {
      if (o.kind === "pro-plan") setCurrentTier(o.plan.id);
      setStatus("paid");
    }, 1200);
  }

  const title =
    o.kind === "test"
      ? o.pkg.name
      : o.kind === "consult"
        ? o.doctor.name
        : `SuppAI Pro · ${o.plan.label}`;
  const confirmedLine =
    o.kind === "test"
      ? `${o.pkg.name} with ${o.vendor.name} is booked for ${o.schedule.slotLabel}. A phlebotomist will reach ${o.address.city}.`
      : o.kind === "consult"
        ? `Your ${o.mode === "video" ? "video" : "in-clinic"} consultation with ${o.doctor.name} is booked for ${o.schedule.slotLabel}.`
        : `You're on SuppAI ${o.plan.label} Pro. Premium features unlocked.`;

  if (status === "paid") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-center"
        >
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2 className="mt-6 text-[23px] font-semibold tracking-tight text-[#0f3a26] sm:text-[28px]">
            Booking confirmed
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/60">
            {confirmedLine} Reference{" "}
            <span className="font-semibold text-[#0f3a26]">{o.reference}</span>.
          </p>
          <button
            onClick={clearOrder}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#006E42] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#005634]"
          >
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-2 md:px-10">
      <div className="shrink-0">
        <button
          onClick={clearOrder}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancel payment
        </button>

        <div className="mt-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#006E42]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
            <Lock className="h-3 w-3" />
            Secure checkout
          </div>
          <h2 className="mt-3 text-[26px] font-semibold leading-[1.1] tracking-tight text-[#0f3a26]">
            Complete your payment
          </h2>
        </div>
      </div>

      <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Payment methods */}
        <div className="flex min-h-0 flex-col">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
            Payment method
          </p>
          <div className="grid grid-cols-2 gap-3">
            {methods.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-3 rounded-xl p-4 text-left transition ${
                    active
                      ? "bg-[#006E42]/5 ring-2 ring-[#006E42]/40"
                      : "bg-white ring-1 ring-[#006E42]/12 hover:ring-[#006E42]/30"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                      active
                        ? "bg-[#006E42] text-white"
                        : "bg-[#006E42]/10 text-[#006E42]"
                    }`}
                  >
                    <m.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#0f3a26]">
                      {m.label}
                    </p>
                    <p className="text-[11px] text-[#0f3a26]/55">{m.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl bg-white p-5 ring-1 ring-[#006E42]/12">
            <AnimatePresence mode="wait">
              <motion.div
                key={method}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {method === "upi" && (
                  <Field label="UPI ID" placeholder="yourname@bank" />
                )}
                {method === "card" && (
                  <div className="space-y-3">
                    <Field label="Card number" placeholder="1234 5678 9012 3456" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry" placeholder="MM / YY" />
                      <Field label="CVV" placeholder="123" />
                    </div>
                  </div>
                )}
                {method === "netbanking" && (
                  <Field label="Select bank" placeholder="HDFC, ICICI, SBI…" />
                )}
                {method === "wallet" && (
                  <p className="text-[13px] text-[#0f3a26]/60">
                    SuppAI wallet balance: <span className="font-semibold text-[#0f3a26]">₹0</span>. Add credits to use this method.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Order summary */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#006E42]/12">
          <div className="border-b border-[#006E42]/8 p-5">
            <div className="flex items-center gap-3">
              {o.kind === "test" ? (
                <VendorLogo vendorId={o.vendor.id} name={o.vendor.name} className="h-9 w-9" />
              ) : o.kind === "consult" ? (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42] text-[12px] font-semibold text-white">
                  {o.doctor.name.replace("Dr. ", "").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42] text-[12px] font-semibold text-white">
                  Pro
                </span>
              )}
              <div>
                <p className="text-[14px] font-semibold text-[#0f3a26]">
                  {title}
                </p>
                <p className="mt-0.5 text-[12px] text-[#0f3a26]/55">
                  {o.kind === "test"
                    ? `${o.vendor.name} · ${o.pkg.parameterCount} parameters`
                    : o.kind === "consult"
                      ? `${o.doctor.specialtyLabel} · ${o.mode === "video" ? "Video consult" : "In-clinic"}`
                      : `${o.plan.blurb}`}
                </p>
              </div>
            </div>
            {o.kind !== "pro-plan" && (
              <div className="mt-3 space-y-1.5 text-[12px] text-[#0f3a26]/65">
                <p className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#006E42]" />
                  {formatBookingDate(o.schedule.date)}, {o.schedule.slotLabel}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#006E42]" />
                  {o.kind === "test"
                    ? `${o.address.city} · ${o.address.pincode}`
                    : o.mode === "video"
                      ? "Online · link shared on confirmation"
                      : o.doctor.clinic}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-end p-5">
            {o.kind === "test" ? (
              <>
                <Row label="Test price" value={`₹${o.subtotal}`} />
                <Row label="Home collection" value={`₹${o.homeCollectionFee}`} />
                <Row label="Discount" value={`− ₹${o.discount}`} accent />
              </>
            ) : o.kind === "consult" ? (
              <>
                <Row label="Consultation fee" value={`₹${o.fee}`} />
                <Row label="Platform fee" value={`₹${o.platformFee}`} />
              </>
            ) : (
              <>
                <Row label={`Plan price (${o.plan.label})`} value={`₹${o.subtotal}`} />
                <Row label="GST (18%)" value={`₹${o.gst}`} />
              </>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-[#006E42]/10 pt-3">
              <span className="text-[14px] font-semibold text-[#0f3a26]">
                Total
              </span>
              <span className="text-[22px] font-semibold text-[#0f3a26]">
                ₹{o.total}
              </span>
            </div>

            <button
              onClick={pay}
              disabled={status === "processing"}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#006E42] px-5 py-3 text-[14px] font-medium text-white transition hover:bg-[#005634] disabled:opacity-70"
            >
              {status === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay ₹{o.total}
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-[#0f3a26]/45">
              Payments are encrypted and PCI-DSS compliant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[#006E42]">
        {label}
      </label>
      <input
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#006E42]/15 bg-white px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
      />
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[13px]">
      <span className="text-[#0f3a26]/60">{label}</span>
      <span className={accent ? "font-medium text-[#006E42]" : "text-[#0f3a26]"}>
        {value}
      </span>
    </div>
  );
}
