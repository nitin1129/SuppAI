"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Droplet,
  Footprints,
  Moon,
  Pill,
  Sparkles,
} from "lucide-react";

import { TrendChart } from "./widgets/TrendChart";

const meals = [
  { name: "Breakfast", body: "Oats, berries, walnuts", kcal: 420, done: true },
  { name: "Lunch", body: "Salmon, quinoa, greens", kcal: 560, done: true },
  { name: "Snack", body: "Apple, almond butter", kcal: 220, done: false },
  { name: "Dinner", body: "Lentil curry, brown rice", kcal: 540, done: false },
];

const stack = [
  { name: "Vitamin D3 + K2", dose: "2000 IU", at: "Morning", taken: true },
  { name: "Methyl B12", dose: "500 mcg", at: "Morning", taken: true },
  { name: "Magnesium Glycinate", dose: "300 mg", at: "Night", taken: false },
  { name: "Omega-3 EPA/DHA", dose: "1 g", at: "Lunch", taken: true },
];

type Status = "ok" | "low" | "attention";

const labs: { label: string; value: string; unit: string; status: Status; trend: number[] }[] = [
  { label: "Vitamin D", value: "18", unit: "ng/mL", status: "low", trend: [21, 19, 18, 17, 16, 17, 18] },
  { label: "Vitamin B12", value: "220", unit: "pg/mL", status: "attention", trend: [240, 235, 228, 225, 220, 222, 220] },
  { label: "Ferritin", value: "92", unit: "ng/mL", status: "ok", trend: [78, 82, 85, 88, 90, 91, 92] },
  { label: "HbA1c", value: "5.4", unit: "%", status: "ok", trend: [5.6, 5.6, 5.5, 5.5, 5.4, 5.4, 5.4] },
];

const appointments = [
  { who: "Dr. Khan", role: "Hepatologist", when: "Fri, 10:30 AM", inDays: 2 },
  { who: "Vitamin Panel", role: "Home collection", when: "Mon, 8:00 AM", inDays: 5 },
];

const habits = [
  { label: "Water", value: "2.5 / 3 L", done: true, icon: Droplet },
  { label: "Sleep", value: "7h 42m", done: true, icon: Moon },
  { label: "Steps", value: "8,412", done: false, icon: Footprints },
];

export function OverviewView() {
  return (
    <div className="px-4 pb-12 pt-2 md:px-10 md:pb-14">
      {/* AI insight: not in a card. Just a strong typographic statement on the page. */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-[#006E42]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
          <Sparkles className="h-3 w-3" />
          Today&rsquo;s insight
        </div>
        <h2 className="mt-4 text-[23px] font-semibold leading-[1.25] tracking-tight text-[#0f3a26] sm:text-[28px] sm:leading-[1.2]">
          Your Vitamin D dipped below range. A short morning walk in sunlight,
          and the D3 + K2 stack with breakfast, gets you back inside one week.
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#005634]">
            Apply to stack
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-[#0f3a26] ring-1 ring-[#006E42]/15 transition hover:ring-[#006E42]/35">
            Open report
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button className="px-2 text-[12.5px] text-[#0f3a26]/45 underline-offset-2 hover:underline">
            Dismiss
          </button>
        </div>
      </motion.section>

      <div className="mt-10 grid grid-cols-12 gap-6">
        {/* Calories ring + habits combined — single composition, not 3 cards */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="col-span-12 overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-[#006E42]/10 lg:col-span-5"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
            Today
          </p>
          <div className="mt-4 flex items-center gap-6">
            <CalorieRing consumed={1200} target={1900} />
            <div className="min-w-0">
              <p className="text-[15.5px] font-semibold text-[#0f3a26]">
                On track
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#0f3a26]/60">
                700 kcal still to go. Macros balanced.
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#006E42]/8 pt-5">
            {habits.map((h) => (
              <div key={h.label}>
                <div className="flex items-center gap-1.5 text-[#0f3a26]/55">
                  <h.icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">
                    {h.label}
                  </span>
                </div>
                <p
                  className={`mt-2 text-[16px] font-semibold ${
                    h.done ? "text-[#006E42]" : "text-[#0f3a26]"
                  }`}
                >
                  {h.value}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Lab markers */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="col-span-12 overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-[#006E42]/10 lg:col-span-7"
        >
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
                Latest report
              </p>
              <p className="mt-1 text-[14px] font-semibold text-[#0f3a26]">
                Blood panel, May 22
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#006E42] hover:underline"
            >
              All markers
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-5 divide-y divide-[#006E42]/8">
            {labs.map((l) => (
              <div
                key={l.label}
                className="grid grid-cols-[1.4fr_1fr_64px_auto] items-center gap-5 py-3"
              >
                <p className="text-[14px] font-medium text-[#0f3a26]">{l.label}</p>
                <p className="text-[13.5px] tabular-nums text-[#0f3a26]/75">
                  {l.value}
                  <span className="ml-1 text-[11.5px] text-[#0f3a26]/45">
                    {l.unit}
                  </span>
                </p>
                <TrendChart
                  points={l.trend}
                  color={l.status === "ok" ? "#006E42" : "#0f3a26"}
                />
                <StatusPill status={l.status} />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Today's meals */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="col-span-12 overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-[#006E42]/10 lg:col-span-7"
        >
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
                Plan
              </p>
              <p className="mt-1 text-[14px] font-semibold text-[#0f3a26]">
                Today&rsquo;s meals
              </p>
            </div>
            <span className="text-[12px] text-[#0f3a26]/55">
              1,200 of 1,900 kcal
            </span>
          </div>
          <ul className="mt-5 divide-y divide-[#006E42]/8">
            {meals.map((m) => (
              <li
                key={m.name}
                className="grid grid-cols-[20px_1fr_auto] items-center gap-4 py-3"
              >
                <span
                  className={
                    m.done
                      ? "grid h-5 w-5 place-items-center rounded-full bg-[#006E42] text-white"
                      : "grid h-5 w-5 place-items-center rounded-full ring-1 ring-[#0f3a26]/15 text-transparent"
                  }
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[#0f3a26]">
                    {m.name}
                  </p>
                  <p className="truncate text-[12px] text-[#0f3a26]/55">
                    {m.body}
                  </p>
                </div>
                <span className="text-[12px] tabular-nums text-[#0f3a26]/65">
                  {m.kcal} kcal
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Supplements + Appointments stacked, denser */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="col-span-12 flex flex-col gap-6 lg:col-span-5"
        >
          <div className="overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-[#006E42]/10">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
                  Stack
                </p>
                <p className="mt-1 text-[14px] font-semibold text-[#0f3a26]">
                  Supplements
                </p>
              </div>
              <span className="text-[12px] text-[#0f3a26]/55">3 of 4 taken</span>
            </div>
            <ul className="mt-5 divide-y divide-[#006E42]/8">
              {stack.map((s) => (
                <li
                  key={s.name}
                  className="grid grid-cols-[18px_1fr_auto_auto] items-center gap-3 py-2.5"
                >
                  <Pill
                    className={`h-3.5 w-3.5 ${
                      s.taken ? "text-[#006E42]" : "text-[#0f3a26]/25"
                    }`}
                  />
                  <p
                    className={`text-[13px] font-medium ${
                      s.taken ? "text-[#0f3a26]" : "text-[#0f3a26]/70"
                    }`}
                  >
                    {s.name}
                  </p>
                  <span className="text-[11.5px] text-[#0f3a26]/55">{s.dose}</span>
                  <span className="text-[11.5px] text-[#0f3a26]/45">{s.at}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white p-7 ring-1 ring-[#006E42]/10">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
              Upcoming
            </p>
            <p className="mt-1 text-[14px] font-semibold text-[#0f3a26]">
              Appointments
            </p>
            <ul className="mt-5 space-y-4">
              {appointments.map((a) => (
                <li key={a.who} className="flex items-center gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#0f3a26]">
                      {a.who}
                    </p>
                    <p className="text-[11.5px] text-[#0f3a26]/55">
                      {a.role} · {a.when}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#006E42]/8 px-2 py-0.5 text-[10.5px] font-medium text-[#006E42]">
                    in {a.inDays}d
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#006E42]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#006E42]" />
        In range
      </span>
    );
  }
  if (status === "attention") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0f3a26]/65">
        <span className="h-1.5 w-1.5 rounded-full bg-[#0f3a26]/45" />
        Watch
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#a82929]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#a82929]" />
      Low
    </span>
  );
}

function CalorieRing({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const pct = Math.min(100, (consumed / target) * 100);
  const r = 50;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-[124px] w-[124px]">
      <svg viewBox="0 0 124 124" className="-rotate-90">
        <circle
          cx="62"
          cy="62"
          r={r}
          stroke="rgba(0,110,66,0.1)"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="62"
          cy="62"
          r={r}
          stroke="#006E42"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeDasharray={c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-semibold leading-none text-[#0f3a26]">
          {consumed.toLocaleString()}
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#0f3a26]/50">
          of {target.toLocaleString()} kcal
        </span>
      </div>
    </div>
  );
}
