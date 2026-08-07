"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowRight, Flame, Plus, Trash2, Utensils, X } from "lucide-react";
import { useEffect, useState } from "react";

import { FOODS, findFood } from "@/lib/gethealthy/foods";

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD = "rounded-3xl bg-white shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10";

type Tool = "bmi" | "bmr" | "food";

const TOOLS: { key: Tool; title: string; body: string; icon: React.ComponentType<{ className?: string }>; tint: string }[] = [
  { key: "bmi", title: "BMI calculator", body: "Check your body mass index and category.", icon: Activity, tint: "bg-[#006E42]/10 text-[#006E42]" },
  { key: "bmr", title: "BMR & calories", body: "Daily calories your body burns to maintain.", icon: Flame, tint: "bg-[#c79a3d]/16 text-[#9c7426]" },
  { key: "food", title: "Food calories", body: "Add foods by weight and total the calories.", icon: Utensils, tint: "bg-[#7c6bd6]/14 text-[#5f52ad]" },
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <button key={t.key} onClick={() => setOpen(t.key)} className={`group ${CARD} flex flex-col items-start p-5 text-left transition hover:ring-[#006E42]/30`}>
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${t.tint}`}><t.icon className="h-5 w-5" /></span>
            <p className="mt-3.5 text-[14.5px] font-bold text-[#0f3a26]">{t.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#0f3a26]/60">{t.body}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#006E42]">Open<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
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

function Result({ value, label, note, tone = "ok" }: { value: string; label: string; note?: string; tone?: "ok" | "warn" | "bad" }) {
  const cls = tone === "warn" ? "bg-[#c79a3d]/[0.10] text-[#9c7426] ring-[#c79a3d]/20" : tone === "bad" ? "bg-[#c14040]/[0.08] text-[#c14040] ring-[#c14040]/20" : "bg-[#006E42]/[0.07] text-[#006E42] ring-[#006E42]/15";
  return (
    <div className={`mt-5 rounded-2xl px-4 py-4 text-center ring-1 ring-inset ${cls}`}>
      <p className="text-[30px] font-bold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] font-semibold">{label}</p>
      {note && <p className="mt-0.5 text-[11px] opacity-80">{note}</p>}
    </div>
  );
}

/* ------------------------------ BMI ------------------------------ */

function BmiCalc() {
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const hn = Number(h), wn = Number(w);
  const bmi = hn > 0 && wn > 0 ? wn / Math.pow(hn / 100, 2) : 0;
  const cat = bmi === 0 ? null : bmi < 18.5 ? { label: "Underweight", tone: "warn" as const } : bmi < 25 ? { label: "Healthy weight", tone: "ok" as const } : bmi < 30 ? { label: "Overweight", tone: "warn" as const } : { label: "Obese", tone: "bad" as const };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Num label="Height" value={h} onChange={setH} suffix="cm" placeholder="170" />
        <Num label="Weight" value={w} onChange={setW} suffix="kg" placeholder="65" />
      </div>
      {cat ? (
        <Result value={bmi.toFixed(1)} label={cat.label} note="BMI = weight ÷ height²" tone={cat.tone} />
      ) : (
        <p className="mt-5 rounded-2xl bg-[#f1f7f3] px-4 py-4 text-center text-[12.5px] text-[#0f3a26]/55 ring-1 ring-inset ring-[#0f3a26]/[0.08]">Enter your height and weight.</p>
      )}
    </div>
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
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const [act, setAct] = useState(1.375);

  const an = Number(age), hn = Number(h), wn = Number(w);
  const ready = an > 0 && hn > 0 && wn > 0;
  const bmr = ready ? Math.round(10 * wn + 6.25 * hn - 5 * an + (gender === "male" ? 5 : -161)) : 0;
  const tdee = Math.round(bmr * act);

  return (
    <div>
      <div className="mb-3">
        <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Gender</span>
        <div className="inline-flex rounded-xl bg-[#f1f7f3] p-1 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
          {(["male", "female"] as const).map((g) => (
            <button key={g} onClick={() => setGender(g)} className={`rounded-lg px-4 py-1.5 text-[12.5px] font-semibold capitalize transition ${gender === g ? "bg-white text-[#0f3a26] shadow-sm ring-1 ring-[#0f3a26]/8" : "text-[#0f3a26]/55"}`}>{g}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Num label="Age" value={age} onChange={setAge} suffix="yr" placeholder="28" />
        <Num label="Height" value={h} onChange={setH} suffix="cm" placeholder="170" />
        <Num label="Weight" value={w} onChange={setW} suffix="kg" placeholder="65" />
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
      {ready ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f1f7f3] px-4 py-4 text-center ring-1 ring-inset ring-[#0f3a26]/[0.08]">
            <p className="text-[24px] font-bold tabular-nums text-[#0f3a26]">{bmr.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-[#0f3a26]/55">BMR (kcal/day)</p>
          </div>
          <div className="rounded-2xl bg-[#006E42]/[0.07] px-4 py-4 text-center ring-1 ring-inset ring-[#006E42]/15">
            <p className="text-[24px] font-bold tabular-nums text-[#006E42]">{tdee.toLocaleString()}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#006E42]">Maintenance kcal</p>
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-[#f1f7f3] px-4 py-4 text-center text-[12.5px] text-[#0f3a26]/55 ring-1 ring-inset ring-[#0f3a26]/[0.08]">Fill in age, height and weight.</p>
      )}
      {ready && <p className="mt-2 text-center text-[10.5px] text-[#0f3a26]/40">Eat below maintenance to lose weight, above to gain.</p>}
    </div>
  );
}

/* ------------------------------ Food calories ------------------------------ */

type FoodRow = { id: number; name: string; grams: number; kcal: number };

function FoodCalc() {
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("");
  const [rows, setRows] = useState<FoodRow[]>([]);
  const [nextId, setNextId] = useState(1);

  const matched = findFood(name);
  const g = Number(grams);
  const preview = matched && g > 0 ? Math.round((matched.kcal * g) / 100) : 0;
  const canAdd = !!matched && g > 0;
  const total = rows.reduce((s, r) => s + r.kcal, 0);

  function add() {
    if (!canAdd || !matched) return;
    setRows((r) => [...r, { id: nextId, name: matched.name, grams: g, kcal: preview }]);
    setNextId((n) => n + 1);
    setName("");
    setGrams("");
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_92px_auto] items-end gap-2">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Food</span>
          <input list="food-list" value={name} onChange={(e) => setName(e.target.value)} placeholder="Start typing…" className="w-full rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
          <datalist id="food-list">{FOODS.map((f) => <option key={f.name} value={f.name} />)}</datalist>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Grams</span>
          <input value={grams} onChange={(e) => setGrams(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="100" className="w-full rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
        </label>
        <button onClick={add} disabled={!canAdd} className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-[#006E42] text-white transition hover:bg-[#005634] disabled:opacity-40" aria-label="Add food"><Plus className="h-4 w-4" /></button>
      </div>
      <p className="mt-1.5 text-[11px] text-[#0f3a26]/45">
        {name && !matched ? "Pick a food from the list." : preview > 0 ? `${matched?.name}: ~${preview} kcal for ${g} g` : "Choose a food and enter grams."}
      </p>

      {rows.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl bg-[#f1f7f3] px-3.5 py-2.5 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-[#0f3a26]">{r.name}</p>
                <p className="text-[10.5px] text-[#0f3a26]/50">{r.grams} g</p>
              </div>
              <span className="text-[13px] font-bold tabular-nums text-[#0f3a26]">{r.kcal} kcal</span>
              <button onClick={() => setRows((x) => x.filter((y) => y.id !== r.id))} aria-label="Remove" className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/35 transition hover:bg-[#c14040]/8 hover:text-[#c14040]"><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#006E42]/[0.07] px-4 py-3 ring-1 ring-inset ring-[#006E42]/15">
        <span className="text-[12.5px] font-semibold text-[#0f3a26]">Total</span>
        <span className="text-[18px] font-bold tabular-nums text-[#006E42]">{total.toLocaleString()} kcal</span>
      </div>
    </div>
  );
}
