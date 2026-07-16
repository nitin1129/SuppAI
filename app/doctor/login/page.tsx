"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Lock,
  Sparkles,
  Star,
  Users2,
} from "lucide-react";
import { useState } from "react";

import { BrandMark } from "@/components/shell/BrandMark";
import { doctorSignIn } from "@/lib/partner/auth";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function DoctorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await doctorSignIn(username, password);
      window.location.assign("/doctor");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f6faf7] lg:grid-cols-[1.1fr_1fr]">
      {/* ============================== Brand stage ============================== */}
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-[#006E42] px-12 py-12 text-[#e6efe9] lg:flex">
        {/* Atmosphere */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="pointer-events-none absolute -right-32 top-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[#9af2c4]/25 blur-[120px]"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
          className="pointer-events-none absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-[#004a2c]/55 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <BrandMark variant="inverse" className="w-[56px]" />
          <span className="h-6 w-px bg-white/20" />
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#9af2c4]">
            Clinician portal
          </p>
        </div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="relative max-w-lg"
        >
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#9af2c4] ring-1 ring-white/15">
            <Sparkles className="h-2.5 w-2.5" />
            Doctor portal
          </p>
          <h2 className="mt-5 text-[44px] font-bold leading-[1.04] tracking-tight text-white">
            Today&apos;s clinic.
            <br />
            <span className="text-[#9af2c4]">On your terms.</span>
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-white/75">
            Set your hours, block your days, and review every appointment on
            your books, all in one calm place.
          </p>

          {/* Stat cards */}
          <div className="mt-9 grid grid-cols-3 gap-3">
            {[
              { label: "Avg. bookings / week", value: "26" },
              { label: "Patient rating", value: "4.8" },
              { label: "Late cancellations", value: "< 3%" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.3 + i * 0.06 }}
                className="rounded-xl bg-white/8 p-3 backdrop-blur ring-1 ring-white/10"
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/55">
                  {s.label}
                </p>
                <p className="mt-1 text-[20px] font-bold tabular-nums text-white">
                  {s.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial / footer line */}
        <motion.figure
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
          className="relative max-w-md"
        >
          <div className="mb-3 flex gap-0.5 text-[#9af2c4]">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <blockquote className="text-[14px] leading-relaxed text-white/85">
            &quot;I used to spend an hour every Sunday rearranging my week. Now
            it&apos;s ten minutes here, done.&quot;
          </blockquote>
          <figcaption className="mt-2 text-[11.5px] text-white/55">
            Dr. Leela Menon · Endocrinologist, Bengaluru
          </figcaption>
        </motion.figure>
      </aside>

      {/* ============================== Form ============================== */}
      <main className="flex items-center justify-center px-6 py-14 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark variant="compact" className="w-[56px]" />
            <span className="h-5 w-px bg-[#0f3a26]/15" />
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
              Doctor portal
            </p>
          </div>

          <h1 className="text-[32px] font-bold leading-[1.05] tracking-tight text-[#0f3a26]">
            Welcome back.
          </h1>
          <p className="mt-2.5 text-[14px] text-[#0f3a26]/55">
            Sign in to see today&apos;s patients and adjust your schedule.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field
              id="username"
              label="Your name or username"
              icon={Users2}
              value={username}
              onChange={setUsername}
              placeholder="Dr. Meera Nair"
              autoComplete="username"
            />
            <Field
              id="password"
              label="Password"
              icon={Lock}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Any password works for the demo"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1 text-[11.5px]">
              <label className="inline-flex items-center gap-2 text-[#0f3a26]/65">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-[#0f3a26]/30 text-[#006E42] focus:ring-[#006E42]"
                />
                Keep me signed in
              </label>
              <a
                href="#"
                className="font-medium text-[#006E42] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006E42] px-5 py-3.5 text-[14.5px] font-semibold text-white shadow-[0_18px_36px_-16px_rgba(0,110,66,0.55)] transition hover:bg-[#005634] disabled:opacity-60"
            >
              {busy ? "Opening your day…" : "Sign in"}
              {!busy && (
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          {/* Join CTA */}
          <div className="mt-7 border-t border-[#0f3a26]/8 pt-5">
            <p className="text-[12px] text-[#0f3a26]/55">New to SuppAI?</p>
            <a
              href="/join/doctor"
              className="group mt-2 flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-[#0f3a26]/8 transition hover:ring-[#006E42]/35"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#006E42]/10 text-[#006E42]">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#0f3a26]">
                  Join our clinician network
                </p>
                <p className="text-[11.5px] leading-relaxed text-[#0f3a26]/60">
                  See patients on SuppAI. Apply in a few minutes.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#0f3a26]/40 transition group-hover:translate-x-0.5 group-hover:text-[#006E42]" />
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11.5px] font-semibold text-[#0f3a26]"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f3a26]/35" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-[#0f3a26]/10 bg-white px-11 py-3.5 text-[14.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        />
      </div>
    </div>
  );
}
