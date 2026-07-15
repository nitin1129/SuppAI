"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, FileText, Pill, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const cyclingWords = ["supplements", "meal plans", "lab reports", "energy", "sleep"];

const tabs = [
  {
    id: "report",
    label: "Report",
    icon: FileText,
    content: (
      <div className="space-y-3">
        <Row label="Vitamin D" value="18 ng/mL" status="low" />
        <Row label="Vitamin B12" value="220 pg/mL" status="borderline" />
        <Row label="Iron (Ferritin)" value="92 ng/mL" status="ok" />
        <Row label="HbA1c" value="5.4%" status="ok" />
        <Row label="ALT" value="62 U/L" status="low" />
      </div>
    ),
  },
  {
    id: "plan",
    label: "Plan",
    icon: Pill,
    content: (
      <div className="space-y-2.5">
        <Stack name="Vitamin D3 + K2" dose="2000 IU · morning" />
        <Stack name="Methylcobalamin (B12)" dose="500 mcg · with breakfast" />
        <Stack name="Magnesium Glycinate" dose="300 mg · before bed" />
        <Stack name="Omega-3 (EPA/DHA)" dose="1g · with meal" />
      </div>
    ),
  },
  {
    id: "meal",
    label: "Meals",
    icon: UtensilsCrossed,
    content: (
      <div className="space-y-2.5">
        <Meal slot="Breakfast" body="Oats · berries · walnuts · greek yogurt" kcal="420" />
        <Meal slot="Lunch" body="Grilled salmon · quinoa · greens" kcal="560" />
        <Meal slot="Snack" body="Apple · almond butter" kcal="220" />
        <Meal slot="Dinner" body="Lentil curry · brown rice · spinach" kcal="540" />
      </div>
    ),
  },
];

export function HeroInteractive() {
  const [word, setWord] = useState(0);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWord((w) => (w + 1) % cyclingWords.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const glowX = useTransform(sx, [0, 1], ["10%", "90%"]);
  const glowY = useTransform(sy, [0, 1], ["10%", "90%"]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }

  return (
    <section
      id="home"
      onMouseMove={handleMove}
      className="relative flex min-h-[760px] flex-col justify-center overflow-hidden bg-gradient-to-br from-[#004d2f] via-[#006E42] to-[#008a53] pb-24 pt-32 text-white"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[28rem] w-[28rem] rounded-full bg-[#4ade80]/30 blur-[120px]"
        style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/85 ring-1 ring-white/15 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            AI-powered wellness
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-[56px] font-semibold leading-[1.05] tracking-tight sm:text-[68px]"
          >
            Smarter{" "}
            <span className="relative inline-grid align-baseline">
              {/* Invisible sizer: always the widest word so layout doesn't reflow */}
              <span aria-hidden className="col-start-1 row-start-1 invisible whitespace-nowrap">
                {cyclingWords.reduce((a, b) => (b.length > a.length ? b : a))}
              </span>
              <span className="col-start-1 row-start-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cyclingWords[word]}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block whitespace-nowrap bg-gradient-to-r from-[#4ade80] to-white bg-clip-text text-transparent"
                  >
                    {cyclingWords[word]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
            <br />
            built around your body.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-md text-[16px] leading-[1.6] text-white/75"
          >
            Upload any blood test. SuppAI turns raw lab data into a clear plan —
            supplements, meals, and follow-ups tuned to you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[#006E42] transition hover:bg-white/90"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#product"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-white/10"
            >
              See it in action
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          id="product"
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-2xl bg-white text-[#0f3a26] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] ring-1 ring-white/40">
            <div className="flex items-center gap-1.5 border-b border-[#006E42]/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F1623A]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#006E42]/70" />
              <span className="ml-3 text-[11px] text-[#0f3a26]/45">
                suppai.health/dashboard
              </span>
            </div>

            <div className="flex gap-1 border-b border-[#006E42]/10 bg-[#f6faf7] px-4 py-2">
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setTab(i)}
                  className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
                    tab === i
                      ? "bg-white text-[#006E42] shadow-sm ring-1 ring-[#006E42]/15"
                      : "text-[#0f3a26]/55 hover:text-[#006E42]"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="min-h-[260px] p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tabs[tab].id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {tabs[tab].content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute -bottom-6 -left-6 hidden rounded-xl bg-white px-4 py-3 text-[#0f3a26] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] ring-1 ring-[#006E42]/15 sm:block"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#006E42]/70">
              New insight
            </p>
            <p className="mt-0.5 text-[12px] font-medium">
              Low B12 detected · 2h ago
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "ok" | "low" | "borderline";
}) {
  const dot = {
    ok: "bg-[#006E42]",
    low: "bg-[#F1623A]",
    borderline: "bg-[#eab308]",
  }[status];
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#f6faf7] px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-[12px] font-medium text-[#0f3a26]">{label}</span>
      </div>
      <span className="text-[12px] tabular-nums text-[#0f3a26]/65">{value}</span>
    </div>
  );
}

function Stack({ name, dose }: { name: string; dose: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#f6faf7] px-3 py-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
        <Pill className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1">
        <p className="text-[12px] font-semibold text-[#0f3a26]">{name}</p>
        <p className="text-[11px] text-[#0f3a26]/60">{dose}</p>
      </div>
    </div>
  );
}

function Meal({ slot, body, kcal }: { slot: string; body: string; kcal: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#f6faf7] px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#006E42]/70">
          {slot}
        </p>
        <p className="truncate text-[12px] text-[#0f3a26]">{body}</p>
      </div>
      <span className="ml-3 shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#006E42] ring-1 ring-[#006E42]/15">
        {kcal} kcal
      </span>
    </div>
  );
}
