"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useState } from "react";

import { BrandMark } from "@/components/shell/BrandMark";
import { signIn } from "@/lib/admin/auth";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AdminLoginPage() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      // Full navigation so the admin layout re-reads the freshly-written session
      // instead of its stale (pre-login) copy, which would bounce back to login.
      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setBusy(false);
    }
  }

  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE, delay } };

  return (
    <div className="relative grid h-screen w-screen place-items-center overflow-hidden bg-[#006E42] px-5">
      {/* ---------- Ambient canvas ---------- */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
        className="pointer-events-none absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-[#9af2c4]/20 blur-[150px]"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.9, ease: EASE, delay: 0.2 }}
        className="pointer-events-none absolute -bottom-48 -right-40 h-[42rem] w-[42rem] rounded-full bg-[#003f25]/65 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(110% 90% at 50% 40%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(110% 90% at 50% 40%, black 30%, transparent 78%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% 35%, transparent 42%, rgba(0,38,22,0.5) 100%)" }}
      />

      {/* ---------- Console framing ---------- */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 sm:px-7">
        <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-tight text-white/55">
          <span className="text-[#9af2c4]">suppai</span>
          <span className="text-white/30">/</span>
          <span>admin</span>
          <span className="text-white/30">/</span>
          <span className="text-white/80">sign-in</span>
        </p>
        <div className="flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9af2c4] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9af2c4]" />
          </span>
          All systems operational
        </div>
      </header>

      <p className="absolute bottom-4 left-5 hidden font-mono text-[10px] tracking-tight text-white/40 sm:block">build 4.7.0 · region ap-south-1</p>
      <p className="absolute bottom-4 right-5 hidden font-mono text-[10px] tracking-tight text-white/40 sm:block">last deploy 2h ago</p>

      {/* ---------- Two-tone console card ---------- */}
      <motion.div
        {...rise(0.05)}
        className="relative w-full max-w-[540px] overflow-hidden rounded-[26px] bg-[#fbfdfb] shadow-[0_50px_100px_-32px_rgba(0,28,17,0.7)] ring-1 ring-black/[0.06]"
      >
        {/* Header band (branded, dark green) */}
        <div className="relative overflow-hidden bg-[#00341e] px-7 pb-6 pt-7 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#0a5a38]/50 blur-[70px]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative flex items-center justify-between">
            <BrandMark variant="inverse" className="w-[82px]" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.10] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9af2c4] ring-1 ring-inset ring-white/15">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9af2c4] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#9af2c4]" />
              </span>
              Live
            </span>
          </div>
          <motion.p {...rise(0.12)} className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9af2c4]/85">Admin control center</motion.p>
          <motion.h1 {...rise(0.16)} className="relative mt-1 text-[24px] font-bold leading-tight tracking-tight">Welcome back.</motion.h1>
        </div>

        {/* Body */}
        <div className="px-7 pb-7 pt-6">
          <motion.p {...rise(0.2)} className="text-[13px] leading-relaxed text-[#0f3a26]/55">
            Sign in to run the storefront, content, and partner network. Every action is signed and audited.
          </motion.p>

          <motion.form {...rise(0.24)} onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field id="email" label="Work email" icon={Mail} type="text" value={email} onChange={setEmail} placeholder="you@suppai.health" autoComplete="email" />
            <Field id="password" label="Password" icon={Lock} type="text" value={password} onChange={setPassword} placeholder="At least 4 characters" autoComplete="off" />

            {error && (
              <p role="alert" className="rounded-lg bg-[#c14040]/8 px-3 py-2 text-[11.5px] font-medium text-[#c14040] ring-1 ring-[#c14040]/20">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={busy}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006E42] px-5 py-4 text-[15px] font-semibold text-white shadow-[0_16px_30px_-14px_rgba(0,110,66,0.65)] transition-colors hover:bg-[#005634] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfdfb] disabled:opacity-60"
            >
              {busy ? "Opening console…" : "Enter console"}
              {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </motion.button>

            <p className="pt-0.5 text-center text-[11.5px] text-[#0f3a26]/45">Demo access: any work email and a 4+ character password.</p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  id, label, value, onChange, icon: Icon, type = "text", placeholder, autoComplete,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  icon: React.ComponentType<{ className?: string }>; type?: string; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/55">{label}</label>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#0f3a26]/35 transition-colors group-focus-within:text-[#006E42]" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-[#0f3a26]/12 bg-white px-11 py-3.5 text-[14.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 transition focus:border-[#006E42]/45 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        />
      </div>
    </div>
  );
}
