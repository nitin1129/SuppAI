"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowRight, Flame, Loader2, Search, Utensils, X } from "lucide-react";
import { useEffect, useState } from "react";

import { calculateBmi, calculateBmr, getFoodCalories, type BmiResult, type BmrResult, type FoodResult, type Gender } from "@/lib/api/health";
import { FOODS } from "@/lib/gethealthy/foods";

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD = "rounded-3xl bg-white shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10";

type Tool = "bmi" | "bmr" | "food";

const TOOLS: { key: Tool; title: string; short: string; body: string; icon: React.ComponentType<{ className?: string }>; tint: string }[] = [
  { key: "bmi", title: "BMI calculator", short: "BMI", body: "Check your body mass index and category.", icon: Activity, tint: "bg-[#006E42]/10 text-[#006E42]" },
  { key: "bmr", title: "BMR & calories", short: "BMR", body: "Daily calories your body burns to maintain.", icon: Flame, tint: "bg-[#c79a3d]/16 text-[#9c7426]" },
  { key: "food", title: "Food calories", short: "Food", body: "Search any food to see its calories and macros.", icon: Utensils, tint: "bg-[#7c6bd6]/14 text-[#5f52ad]" },
];

export function HealthTools() {
  const [open, setOpen] = useState<Tool | null>(null);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006E42]/70">For everyone</span>
        <span className="h-px flex-1 bg-[#0f3a26]/10" />
        <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">Health tools</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {TOOLS.map((t) => (
          <button key={t.key} onClick={() => setOpen(t.key)} className={`group ${CARD} flex flex-col items-center gap-2 p-3 text-center transition hover:ring-[#006E42]/30 sm:items-start sm:gap-0 sm:p-5 sm:text-left`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 ${t.tint}`}><t.icon className="h-5 w-5" /></span>
            <p className="text-[12px] font-bold leading-tight text-[#0f3a26] sm:mt-3.5 sm:text-[14.5px]">
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.title}</span>
            </p>
            <p className="mt-1 hidden text-[12px] leading-relaxed text-[#0f3a26]/60 sm:block">{t.body}</p>
            <span className="mt-3 hidden items-center gap-1 text-[12.5px] font-semibold text-[#006E42] sm:inline-flex">Open<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
          </button>
        ))}
      </div>

      <ToolModal tool={open} onClose={() => setOpen(null)} />
    </section>
  );
}

function ToolModal({ tool, onClose }: { tool: Tool | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!tool) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [tool, onClose]);

  const meta = TOOLS.find((t) => t.key === tool);

  return (
    <AnimatePresence>
      {tool && meta && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[#0f3a26]/45" onClick={onClose} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-label={meta.title} className={`relative flex max-h-[88vh] w-full max-w-md flex-col ${CARD} overflow-hidden`} initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.3, ease: EASE }}>
            <div className="flex items-center justify-between gap-3 border-b border-[#0f3a26]/8 p-5">
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${meta.tint}`}><meta.icon className="h-5 w-5" /></span>
                <div>
                  <h2 className="text-[16px] font-bold tracking-tight text-[#0f3a26]">{meta.title}</h2>
                  <p className="text-[11.5px] text-[#0f3a26]/55">{meta.body}</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/6 hover:text-[#0f3a26]"><X className="h-4 w-4" /></button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto p-5">
              {tool === "bmi" && <BmiCalc />}
              {tool === "bmr" && <BmrCalc />}
              {tool === "food" && <FoodCalc />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ inputs ------------------------------ */

function Num({ label, value, onChange, suffix, placeholder }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">{label}</span>
      <div className="relative">
        <input value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder={placeholder} className="w-full rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
        {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11.5px] font-medium text-[#0f3a26]/40">{suffix}</span>}
      </div>
    </label>
  );
}

function CalcButton({ onClick, disabled, loading, label }: { onClick: () => void; disabled: boolean; loading: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006E42] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-45">
      {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Calculating</> : label}
    </button>
  );
}

function ErrorNote({ msg }: { msg: string }) {
  return <p className="mt-3 rounded-xl bg-[#c14040]/8 px-3.5 py-2.5 text-[12px] font-medium text-[#c14040] ring-1 ring-inset ring-[#c14040]/15">{msg}</p>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 rounded-2xl bg-[#f1f7f3] px-4 py-4 text-center text-[12.5px] text-[#0f3a26]/55 ring-1 ring-inset ring-[#0f3a26]/[0.08]">{children}</p>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />{label}</span>;
}

const Reveal = ({ children }: { children: React.ReactNode }) => {
  const reduce = useReducedMotion();
  return <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>{children}</motion.div>;
};

/* ------------------------------ BMI ------------------------------ */

const BMI_MIN = 14, BMI_MAX = 35, BMI_SPAN = BMI_MAX - BMI_MIN;
// Muted, theme-matched shades: soft gold, brand green, soft clay, muted brick.
const BMI_ZONES = [
  { label: "Underweight", short: "Under", max: 18.5, bar: "#d6b465", text: "#9c7426", pill: "bg-[#c79a3d]/14 text-[#9c7426]" },
  { label: "Normal weight", short: "Normal", max: 25, bar: "#3f9a6e", text: "#006E42", pill: "bg-[#006E42]/10 text-[#006E42]" },
  { label: "Overweight", short: "Over", max: 30, bar: "#d18d72", text: "#b06a4e", pill: "bg-[#c98a6a]/16 text-[#a86141]" },
  { label: "Obese", short: "Obese", max: Infinity, bar: "#c07a72", text: "#a4544a", pill: "bg-[#c07a72]/16 text-[#a4544a]" },
];
const bmiZone = (bmi: number) => BMI_ZONES.find((z) => bmi < z.max) ?? BMI_ZONES[BMI_ZONES.length - 1];
const bmiPct = (bmi: number) => Math.max(0, Math.min(1, (bmi - BMI_MIN) / BMI_SPAN)) * 100;

function BmiCalc() {
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const [res, setRes] = useState<BmiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hn = Number(h), wn = Number(w);
  const ready = hn > 0 && wn > 0;
  const reset = () => { setRes(null); setErr(null); };

  async function run() {
    if (!ready) return;
    setLoading(true); setErr(null);
    try { setRes(await calculateBmi(wn, hn)); }
    catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong."); setRes(null); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Num label="Height" value={h} onChange={(v) => { setH(v); reset(); }} suffix="cm" placeholder="170" />
        <Num label="Weight" value={w} onChange={(v) => { setW(v); reset(); }} suffix="kg" placeholder="65" />
      </div>
      <CalcButton onClick={run} disabled={!ready || loading} loading={loading} label="Calculate BMI" />
      {err && <ErrorNote msg={err} />}
      {res ? <BmiScale bmi={res.bmi} category={res.category} heightCm={hn} /> : !err && <Hint>Enter your height and weight, then calculate.</Hint>}
    </div>
  );
}

function BmiScale({ bmi, category, heightCm }: { bmi: number; category: string; heightCm: number }) {
  const zone = bmiZone(bmi);
  const marker = Math.max(3, Math.min(97, bmiPct(bmi)));
  const m = heightCm / 100;
  const healthyLo = Math.round(18.5 * m * m);
  const healthyHi = Math.round(24.9 * m * m);
  const note = zone.label === "Normal weight"
    ? "You are in the healthy range. Keep it steady."
    : bmi < 18.5
      ? "You are below the healthy range. Steady, nutritious gains help."
      : "You are above the healthy range. Small, steady changes add up.";

  return (
    <Reveal>
      <div className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#0f3a26]/40">Your BMI</p>
            <p className="mt-1 text-[36px] font-bold leading-none tabular-nums" style={{ color: zone.text }}>{bmi.toFixed(1)}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${zone.pill}`}>{category || zone.label}</span>
        </div>

        {/* scale */}
        <div className="relative mt-9">
          <div className="absolute -top-[7px] -translate-x-1/2" style={{ left: `${marker}%` }} aria-hidden>
            <div className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent" style={{ borderTopColor: zone.bar }} />
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full">
            {BMI_ZONES.map((z, i) => {
              const lo = i === 0 ? BMI_MIN : BMI_ZONES[i - 1].max;
              const hi = z.max === Infinity ? BMI_MAX : z.max;
              return <div key={z.label} style={{ width: `${((hi - lo) / BMI_SPAN) * 100}%`, backgroundColor: z.bar }} />;
            })}
          </div>
          <div className="relative mt-1.5 h-3">
            {[18.5, 25, 30].map((v) => (
              <span key={v} className="absolute -translate-x-1/2 text-[9.5px] font-medium tabular-nums text-[#0f3a26]/40" style={{ left: `${((v - BMI_MIN) / BMI_SPAN) * 100}%` }}>{v}</span>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-[#0f3a26]/50">
          {BMI_ZONES.map((z) => <Legend key={z.label} color={z.bar} label={z.short} />)}
        </div>

        <div className="mt-4 rounded-xl bg-[#f1f7f3] px-3.5 py-3 ring-1 ring-inset ring-[#0f3a26]/[0.06]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11.5px] text-[#0f3a26]/60">Healthy weight for your height</span>
            <span className="text-[13px] font-bold tabular-nums text-[#0f3a26]">{healthyLo} to {healthyHi} kg</span>
          </div>
          <p className="mt-2 border-t border-[#0f3a26]/[0.06] pt-2 text-[11.5px] leading-relaxed text-[#0f3a26]/60">{note}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------ BMR / TDEE ------------------------------ */

const ACTIVITY = [
  { key: "sedentary", label: "Sedentary", mult: 1.2, hint: "Little or no exercise" },
  { key: "light", label: "Light", mult: 1.375, hint: "1-3 days / week" },
  { key: "moderate", label: "Moderate", mult: 1.55, hint: "3-5 days / week" },
  { key: "active", label: "Active", mult: 1.725, hint: "6-7 days / week" },
];

function BmrCalc() {
  const [gender, setGender] = useState<Gender>("Male");
  const [age, setAge] = useState("");
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const [act, setAct] = useState(1.375);
  const [res, setRes] = useState<BmrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const an = Number(age), hn = Number(h), wn = Number(w);
  const ready = an > 0 && hn > 0 && wn > 0;
  const reset = () => { setRes(null); setErr(null); };

  async function run() {
    if (!ready) return;
    setLoading(true); setErr(null);
    try { setRes(await calculateBmr(wn, hn, an, gender)); }
    catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong."); setRes(null); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-3">
        <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Gender</span>
        <div className="inline-flex rounded-xl bg-[#f1f7f3] p-1 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
          {(["Male", "Female", "Other"] as const).map((g) => (
            <button key={g} onClick={() => { setGender(g); reset(); }} className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition ${gender === g ? "bg-white text-[#0f3a26] shadow-sm ring-1 ring-[#0f3a26]/8" : "text-[#0f3a26]/55"}`}>{g}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Num label="Age" value={age} onChange={(v) => { setAge(v); reset(); }} suffix="yr" placeholder="28" />
        <Num label="Height" value={h} onChange={(v) => { setH(v); reset(); }} suffix="cm" placeholder="170" />
        <Num label="Weight" value={w} onChange={(v) => { setW(v); reset(); }} suffix="kg" placeholder="65" />
      </div>
      <div className="mt-3">
        <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Activity level</span>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITY.map((a) => (
            <button key={a.key} onClick={() => setAct(a.mult)} className={`rounded-xl px-3 py-2 text-left text-[12px] font-semibold ring-1 ring-inset transition ${act === a.mult ? "bg-[#006E42]/8 text-[#006E42] ring-[#006E42]/20" : "bg-white text-[#0f3a26]/65 ring-[#0f3a26]/10 hover:ring-[#006E42]/25"}`}>
              {a.label}<span className="block text-[10px] font-normal text-[#0f3a26]/45">{a.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <CalcButton onClick={run} disabled={!ready || loading} loading={loading} label="Calculate calories" />
      {err && <ErrorNote msg={err} />}
      {res ? <BmrScale bmr={res.bmr} act={act} /> : !err && <Hint>Fill in your details, then calculate.</Hint>}
    </div>
  );
}

function BmrScale({ bmr, act }: { bmr: number; act: number }) {
  const base = Math.round(bmr);
  const maintenance = Math.round(bmr * act);
  const activityKcal = maintenance - base;
  const basePct = Math.max(0, Math.min(100, (base / maintenance) * 100));

  return (
    <Reveal>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#006E42]/60">Maintenance calories</p>
          <p className="text-[34px] font-bold leading-none tabular-nums text-[#006E42]">{maintenance.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-[#0f3a26]/45">kcal per day to stay the same</p>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-bold tabular-nums text-[#0f3a26]">{base.toLocaleString()}</p>
          <p className="text-[10.5px] text-[#0f3a26]/50">BMR, at rest</p>
        </div>
      </div>

      {/* base + activity breakdown */}
      <div className="mt-4">
        <div className="flex h-3 overflow-hidden rounded-full">
          <div style={{ width: `${basePct}%`, backgroundColor: "#3f9a6e" }} />
          <div style={{ width: `${100 - basePct}%`, backgroundColor: "#d6b465" }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10.5px] text-[#0f3a26]/60">
          <Legend color="#3f9a6e" label={`Base burn ${base.toLocaleString()}`} />
          <Legend color="#d6b465" label={`Activity +${activityKcal.toLocaleString()}`} />
        </div>
      </div>

      {/* goals */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Goal label="Lose" sub="~0.5 kg/wk" value={maintenance - 500} />
        <Goal label="Maintain" value={maintenance} highlight />
        <Goal label="Gain" sub="~0.5 kg/wk" value={maintenance + 500} />
      </div>

      <p className="mt-3 rounded-xl bg-[#f1f7f3] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#0f3a26]/65 ring-1 ring-inset ring-[#0f3a26]/[0.06]">Eat below maintenance to lose weight, above to gain. About 500 kcal a day shifts roughly 0.5 kg a week.</p>
    </Reveal>
  );
}

function Goal({ label, sub, value, highlight }: { label: string; sub?: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-2 py-2.5 text-center ring-1 ring-inset ${highlight ? "bg-[#006E42]/8 ring-[#006E42]/20" : "bg-[#f1f7f3] ring-[#0f3a26]/[0.06]"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0f3a26]/50">{label}</p>
      <p className={`mt-0.5 text-[15px] font-bold tabular-nums ${highlight ? "text-[#006E42]" : "text-[#0f3a26]"}`}>{value.toLocaleString()}</p>
      {sub && <p className="text-[9px] text-[#0f3a26]/40">{sub}</p>}
    </div>
  );
}

/* ------------------------------ Food calories ------------------------------ */

// Macro colors: soft green, gold, muted violet (matches the food tool accent).
const MACRO = { protein: "#3f9a6e", carbs: "#d6b465", fat: "#8b7fd0" };
const round1 = (n: number) => Math.round(n * 10) / 10;

function FoodCalc() {
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<{ r: FoodResult; grams: number; typed: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const g = Number(grams);
  const canSearch = name.trim().length > 0 && g > 0 && !loading;
  const q = name.trim().toLowerCase();
  const suggestions = q ? FOODS.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 6) : [];
  const clear = () => { setRes(null); setErr(null); };

  async function search() {
    if (!name.trim() || !(g > 0)) return;
    setLoading(true); setErr(null); setOpen(false);
    try {
      const r = await getFoodCalories(name.trim(), g);
      if (!r.found || r.calories == null) { setErr(`We could not find "${name.trim()}". Try a simpler or more common name.`); setRes(null); }
      else setRes({ r, grams: g, typed: name.trim() });
    }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not look that up."); setRes(null); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_92px] gap-2">
        <div className="relative">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Food</span>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setOpen(true); clear(); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => { if (e.key === "Enter" && canSearch) search(); if (e.key === "Escape") setOpen(false); }}
            placeholder="e.g. rice, egg, banana"
            autoComplete="off"
            className="w-full rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
          />
          {open && suggestions.length > 0 && (
            <ul className="scrollbar-thin absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#0f3a26]/10 bg-white py-1 shadow-[0_16px_36px_-18px_rgba(15,58,38,0.4)]">
              {suggestions.map((f) => (
                <li key={f.name}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setName(f.name); setOpen(false); clear(); }} className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-[13px] text-[#0f3a26] transition hover:bg-[#f1f7f3]">
                    <span className="truncate capitalize">{f.name}</span>
                    <span className="shrink-0 text-[10.5px] text-[#0f3a26]/40">{f.kcal} kcal/100g</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Grams</span>
          <input value={grams} onChange={(e) => { setGrams(e.target.value.replace(/[^0-9]/g, "")); clear(); }} onKeyDown={(e) => { if (e.key === "Enter" && canSearch) search(); }} inputMode="numeric" placeholder="100" className="w-full rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
        </div>
      </div>

      <button onClick={search} disabled={!canSearch} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006E42] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-45">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Searching</> : <><Search className="h-4 w-4" />Search food</>}
      </button>
      {err && <ErrorNote msg={err} />}
      {res ? <FoodResultView r={res.r} grams={res.grams} typed={res.typed} /> : !err && <Hint>Search a food to see its calories and macros for the amount you enter.</Hint>}
    </div>
  );
}

function FoodResultView({ r, grams, typed }: { r: FoodResult; grams: number; typed: string }) {
  const q = r.quantity || grams;
  const s = q / 100; // macros come back per 100g
  const p = round1(r.protein * s), c = round1(r.carbs * s), f = round1(r.fat * s);
  const pCal = p * 4, cCal = c * 4, fCal = f * 9, mTot = pCal + cCal + fCal || 1;

  return (
    <Reveal>
      <div className="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-inset ring-[#006E42]/15">
        {/* calories headline */}
        <div className="flex items-center justify-between gap-3 bg-[#006E42]/[0.06] px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold capitalize text-[#0f3a26]">{r.food_name || typed}</p>
            <p className="mt-0.5 text-[11.5px] font-medium text-[#0f3a26]/55">{q} g serving · {Math.round(r.calories_per_100g)} kcal per 100 g</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[34px] font-bold leading-none tabular-nums text-[#006E42]">{Math.round(r.calories).toLocaleString()}</p>
            <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#006E42]/60">kcal</p>
          </div>
        </div>

        <div className="p-4">
          {/* macro split bar */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">Macros</span>
            <span className="text-[10.5px] text-[#0f3a26]/45">per {q} g</span>
          </div>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-[#eef4f0]">
            <div style={{ width: `${(pCal / mTot) * 100}%`, backgroundColor: MACRO.protein }} />
            <div style={{ width: `${(cCal / mTot) * 100}%`, backgroundColor: MACRO.carbs }} />
            <div style={{ width: `${(fCal / mTot) * 100}%`, backgroundColor: MACRO.fat }} />
          </div>

          {/* macro stat tiles */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MacroTile color={MACRO.protein} label="Protein" grams={p} />
            <MacroTile color={MACRO.carbs} label="Carbs" grams={c} />
            <MacroTile color={MACRO.fat} label="Fat" grams={f} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function MacroTile({ color, label, grams }: { color: string; label: string; grams: number }) {
  return (
    <div className="rounded-xl bg-[#f6faf7] px-2.5 py-2.5 text-center ring-1 ring-inset ring-[#0f3a26]/[0.06]">
      <div className="flex items-center justify-center gap-1.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/55">{label}</span>
      </div>
      <p className="mt-1 text-[18px] font-bold leading-none tabular-nums text-[#0f3a26]">{grams}<span className="ml-0.5 text-[11px] font-medium text-[#0f3a26]/45">g</span></p>
    </div>
  );
}
