"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck, ChefHat, ChevronDown, Clock, Download, Flame, Loader2, RefreshCw,
  Repeat, ShoppingBasket, Sparkles, Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchProfile } from "@/lib/account/service";
import {
  ACTIVITY_LEVELS, DIET_TYPES, GENDERS, generateMealPlan, mealPlanPdfUrl, parseCalories,
  type ActivityLevel, type ApiGender, type DietType, type MealPlanResult, type PlanType,
} from "@/lib/api/meals";
import { ensureApiUser } from "@/lib/api/user";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { markScheduled, readSavedPlan, savePlan, type PlanInputs } from "@/lib/meals/generated-plan";
import {
  dayCalories, parseMealPlan,
  type ParsedPlan, type PlanSection, type PlannedDay, type PlannedMeal,
} from "@/lib/meals/plan-text";

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD = "rounded-3xl bg-white shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10";

const GOALS = ["Weight loss", "Muscle gain", "More energy", "Heart health", "Blood sugar control", "General fitness"];

const DEFAULT_INPUTS: PlanInputs = {
  planType: "1 day",
  age: "",
  gender: "Female",
  height: "",
  weight: "",
  diet: "Vegetarian",
  activity: "Exercise 2-3 times a week",
  goals: [],
  allergies: "",
};

type Props = {
  /** Puts one day of the plan on today's schedule. */
  onUseDay?: (day: PlannedDay, sections: PlanSection[]) => Promise<void> | void;
};

export function MealPlanBuilder({ onUseDay }: Props) {
  const [inputs, setInputs] = useState<PlanInputs>(DEFAULT_INPUTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealPlanResult | null>(null);
  const [scheduledDay, setScheduledDay] = useState<string | null>(null);
  const [apiTotals, setApiTotals] = useState<{ plan: string; totals: Record<string, number> } | null>(null);

  // Bring back the last plan once we are on the client (storage is not there during prerender).
  const hydrated = useHydrated();
  const [restored, setRestored] = useState(false);
  if (hydrated && !restored) {
    setRestored(true);
    const saved = readSavedPlan();
    if (saved) {
      setInputs({ ...DEFAULT_INPUTS, ...saved.inputs });
      setResult(saved.result);
      setScheduledDay(saved.scheduledDay ?? null);
    }
  }

  const set = <K extends keyof PlanInputs>(key: K) => (value: PlanInputs[K]) => setInputs((cur) => ({ ...cur, [key]: value }));

  const ageN = Number(inputs.age), heightN = Number(inputs.height), weightN = Number(inputs.weight);
  const ready = ageN >= 1 && ageN <= 120 && heightN >= 50 && heightN <= 260 && weightN >= 20 && weightN <= 400;

  const parsed: ParsedPlan | null = useMemo(() => (result ? parseMealPlan(result.meal_plan) : null), [result]);

  // Totals from the API match its own maths; fetched for whichever plan is showing.
  useEffect(() => {
    if (!result) return;
    let cancelled = false;
    parseCalories(result.meal_plan)
      .then((b) => { if (!cancelled) setApiTotals({ plan: result.meal_plan, totals: b.daily_totals }); })
      .catch(() => { /* fall back to adding up the meals */ });
    return () => { cancelled = true; };
  }, [result]);
  const totals = result && apiTotals?.plan === result.meal_plan ? apiTotals.totals : null;

  async function schedule(day: PlannedDay, sections: PlanSection[]) {
    if (!onUseDay) return;
    await onUseDay(day, sections);
    setScheduledDay(day.label);
    markScheduled(day.label);
  }

  async function build() {
    if (!ready || loading) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await fetchProfile();
      const user = await ensureApiUser(profile.name, profile.email);
      const plan = await generateMealPlan(
        {
          user_id: user.userId,
          name: profile.name,
          age: Math.round(ageN),
          gender: inputs.gender,
          height: heightN,
          weight: weightN,
          diet: inputs.diet,
          activity_level: inputs.activity,
          food_allergies: inputs.allergies.split(",").map((a) => a.trim()).filter(Boolean),
          health_goals: inputs.goals,
          disease: [],
          supplement_preferences: [],
        },
        inputs.planType,
      );
      savePlan(plan, inputs);
      setResult(plan);
      setScheduledDay(null);

      // A new plan goes straight onto today's schedule: the first day, in short form.
      const fresh = parseMealPlan(plan.meal_plan);
      if (fresh.days[0]) await schedule(fresh.days[0], fresh.sections);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const showResult = result && parsed;

  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-3 border-b border-[#0f3a26]/8 p-5 md:p-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]"><ChefHat className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold tracking-tight text-[#0f3a26]">{showResult ? "Your meal plan" : "Build a meal plan"}</h2>
          <p className="text-[12px] text-[#0f3a26]/55">
            {showResult ? "Recipes, the grocery list and the PDF. The meals themselves are on your schedule." : "Meals, portions and calories worked out for your body and your diet."}
          </p>
        </div>
        {showResult && (
          <button
            onClick={() => { setResult(null); setError(null); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[12.5px] font-medium text-[#0f3a26]/65 ring-1 ring-inset ring-[#0f3a26]/10 transition hover:text-[#0f3a26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40"
          >
            <RefreshCw className="h-3.5 w-3.5" />New plan
          </button>
        )}
      </div>

      <div className="p-5 md:p-6">
        {showResult ? (
          <PlanResult
            result={result}
            parsed={parsed}
            apiTotals={totals}
            scheduledDay={scheduledDay}
            onSchedule={onUseDay ? schedule : undefined}
          />
        ) : (
          <>
            <PlanForm inputs={inputs} set={set} />
            {error && <p className="mt-4 rounded-xl bg-[#c14040]/8 px-3.5 py-2.5 text-[12px] font-medium text-[#c14040] ring-1 ring-inset ring-[#c14040]/15">{error}</p>}
            <button
              onClick={build}
              disabled={!ready || loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006E42] px-4 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 focus-visible:ring-offset-2 sm:w-auto sm:px-6"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Writing your plan</> : <><Sparkles className="h-4 w-4" />Build my plan</>}
            </button>
            <p className="mt-2.5 text-[11.5px] text-[#0f3a26]/45">
              {loading ? "This takes a few seconds." : ready ? "The meals go straight onto today's schedule." : "Fill in age, height and weight to start."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ form ------------------------------ */

function PlanForm({ inputs, set }: { inputs: PlanInputs; set: <K extends keyof PlanInputs>(key: K) => (value: PlanInputs[K]) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Plan length</span>
        <div className="inline-flex rounded-xl bg-[#f1f7f3] p-1 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
          {(["1 day", "7 day"] as PlanType[]).map((t) => (
            <button
              key={t}
              onClick={() => set("planType")(t)}
              aria-pressed={inputs.planType === t}
              className={`rounded-lg px-4 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 ${inputs.planType === t ? "bg-white text-[#006E42] shadow-[0_1px_2px_rgba(15,58,38,0.08)]" : "text-[#0f3a26]/55 hover:text-[#0f3a26]"}`}
            >
              {t === "1 day" ? "One day" : "Full week"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Num label="Age" value={inputs.age} onChange={set("age")} suffix="yrs" placeholder="30" />
        <Pick label="Gender" value={inputs.gender} onChange={(v) => set("gender")(v as ApiGender)} options={GENDERS} />
        <Num label="Height" value={inputs.height} onChange={set("height")} suffix="cm" placeholder="170" />
        <Num label="Weight" value={inputs.weight} onChange={set("weight")} suffix="kg" placeholder="65" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Pick label="Diet" value={inputs.diet} onChange={(v) => set("diet")(v as DietType)} options={DIET_TYPES} />
        <Pick label="Activity" value={inputs.activity} onChange={(v) => set("activity")(v as ActivityLevel)} options={ACTIVITY_LEVELS} />
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Goals</span>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const on = inputs.goals.includes(g);
            return (
              <button
                key={g}
                onClick={() => set("goals")(on ? inputs.goals.filter((x) => x !== g) : [...inputs.goals, g])}
                aria-pressed={on}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 ${on ? "bg-[#0f3a26] text-[#f6faf7]" : "bg-white text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/30"}`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">Foods to avoid</span>
        <input
          value={inputs.allergies}
          onChange={(e) => set("allergies")(e.target.value)}
          placeholder="peanuts, shellfish"
          className="w-full rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        />
      </label>
    </div>
  );
}

function Num({ label, value, onChange, suffix, placeholder }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">{label}</span>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          inputMode="decimal"
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#0f3a26]/40">{suffix}</span>}
      </div>
    </label>
  );
}

function Pick({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#0f3a26]/60">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#0f3a26]/12 bg-[#f6faf7] px-3.5 py-2.5 pr-9 text-[14px] text-[#0f3a26] focus:border-[#006E42]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0f3a26]/40" />
      </div>
    </label>
  );
}

/* ------------------------------ result ------------------------------ */

function PlanResult({ result, parsed, apiTotals, scheduledDay, onSchedule }: {
  result: MealPlanResult;
  parsed: ParsedPlan;
  apiTotals: Record<string, number> | null;
  scheduledDay: string | null;
  onSchedule?: (day: PlannedDay, sections: PlanSection[]) => Promise<void>;
}) {
  const [dayIndex, setDayIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const reduce = useReducedMotion();
  const day: PlannedDay | undefined = parsed.days[dayIndex];

  if (!day) {
    return (
      <div className="rounded-2xl bg-[#f1f7f3] p-5 text-[12.5px] leading-relaxed text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
        <p className="whitespace-pre-wrap">{result.meal_plan}</p>
      </div>
    );
  }

  const total = apiTotals?.[day.label.split(" (")[0]] ?? dayCalories(day);
  const isScheduled = scheduledDay === day.label;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label="BMI" value={result.bmi.toFixed(1)} />
        <Stat label="BMR" value={`${Math.round(result.bmr)}`} unit="kcal" />
        <Stat label="Calorie range" value={result.calorie_range} />
        <Stat label="Daily goal" value={result.daily_goal.toLowerCase()} />
      </div>

      {parsed.days.length > 1 && (
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {parsed.days.map((d, i) => (
            <button
              key={d.label}
              onClick={() => setDayIndex(i)}
              aria-pressed={i === dayIndex}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 ${i === dayIndex ? "bg-[#006E42] text-white" : "bg-[#f1f7f3] text-[#0f3a26]/65 ring-1 ring-inset ring-[#0f3a26]/[0.08] hover:text-[#0f3a26]"}`}
            >
              {d.label}
              {scheduledDay === d.label && <CalendarCheck className="h-3.5 w-3.5" aria-label="on today's schedule" />}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0f3a26]">
          <Flame className="h-4 w-4 text-[#c79a3d]" />
          {total} kcal
          <span className="font-medium text-[#0f3a26]/45">across {day.meals.length} meals</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onSchedule && (
            isScheduled ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42]/8 px-3.5 py-2 text-[12.5px] font-semibold text-[#006E42]">
                <CalendarCheck className="h-3.5 w-3.5" />On today&apos;s schedule
              </span>
            ) : (
              <button
                onClick={async () => { setBusy(true); try { await onSchedule(day, parsed.sections); } finally { setBusy(false); } }}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarCheck className="h-3.5 w-3.5" />}
                Use {parsed.days.length > 1 ? day.label : "this plan"} today
              </button>
            )
          )}
          {result.download_url && (
            <a
              href={mealPlanPdfUrl(result.download_url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[12.5px] font-medium text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/10 transition hover:text-[#006E42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40"
            >
              <Download className="h-3.5 w-3.5" />PDF
            </a>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={day.label}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="space-y-2"
        >
          {day.meals.map((m) => <MealRow key={`${day.label}-${m.slot}-${m.title}`} meal={m} />)}
        </motion.ul>
      </AnimatePresence>

      {parsed.sections.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {parsed.sections.map((s) => (
            <div key={s.title} className="rounded-2xl bg-[#f1f7f3] p-4 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
              <p className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0f3a26]">
                {/^smart grocery/i.test(s.title) ? <ShoppingBasket className="h-3.5 w-3.5 text-[#006E42]" /> : <Repeat className="h-3.5 w-3.5 text-[#006E42]" />}
                {s.title}
              </p>
              <ul className="mt-2 space-y-1.5">
                {s.notes.map((n) => (
                  <li key={n.label} className="text-[12px] leading-relaxed text-[#0f3a26]/65">
                    <span className="font-semibold text-[#0f3a26]">{n.label}:</span> {n.value}
                  </li>
                ))}
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-1.5 text-[12px] leading-relaxed text-[#0f3a26]/65">
                    <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#006E42]/50" />{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl bg-[#f1f7f3] px-3.5 py-3 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">{label}</p>
      <p className="mt-1 text-[15px] font-bold leading-tight text-[#0f3a26]">
        {value}{unit && <span className="ml-1 text-[11px] font-semibold text-[#0f3a26]/45">{unit}</span>}
      </p>
    </div>
  );
}

/* One compact line per meal; the recipe opens on demand. */
function MealRow({ meal }: { meal: PlannedMeal }) {
  const [open, setOpen] = useState(false);
  const hasDetail = meal.ingredients.length > 0 || Boolean(meal.cook || meal.swap);
  const macros = [
    meal.protein !== null ? `${meal.protein}g protein` : "",
    meal.carbs !== null ? `${meal.carbs}g carbs` : "",
    meal.fat !== null ? `${meal.fat}g fat` : "",
  ].filter(Boolean).join(" · ");

  return (
    <li className="rounded-2xl bg-white ring-1 ring-inset ring-[#0f3a26]/[0.08]">
      <button
        onClick={() => hasDetail && setOpen((v) => !v)}
        aria-expanded={hasDetail ? open : undefined}
        className={`flex w-full items-start gap-3 p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 rounded-2xl ${hasDetail ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[11px]">
            <span className="font-semibold uppercase tracking-[0.1em] text-[#006E42]/75">{meal.slot}</span>
            {meal.time && <span className="inline-flex items-center gap-1 text-[#0f3a26]/45"><Clock className="h-3 w-3" />{meal.time}</span>}
          </p>
          <p className="mt-0.5 text-[13.5px] font-semibold leading-snug text-[#0f3a26]">{meal.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-[#0f3a26]/60">
            {meal.kcal !== null && <span className="font-bold text-[#0f3a26]">{meal.kcal} kcal</span>}
            {macros && <span>{macros}</span>}
            {meal.prep && <span>{meal.prep}</span>}
            {meal.cost && <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" />{meal.cost}</span>}
          </p>
        </div>
        {hasDetail && <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-[#0f3a26]/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />}
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-[#0f3a26]/6 px-3.5 pb-3.5 pt-3 text-[12px] leading-relaxed text-[#0f3a26]/70">
          {meal.why && <p>{meal.why}</p>}
          {meal.portion && <p><span className="font-semibold text-[#0f3a26]">Portion:</span> {meal.portion}</p>}
          {meal.ingredients.length > 0 && <p><span className="font-semibold text-[#0f3a26]">Ingredients:</span> {meal.ingredients.join(", ")}</p>}
          {meal.cook && <p><span className="font-semibold text-[#0f3a26]">Method:</span> {meal.cook}</p>}
          {meal.swap && <p><span className="font-semibold text-[#0f3a26]">Swap:</span> {meal.swap}</p>}
          {meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {meal.tags.map((t) => <span key={t} className="rounded-full bg-[#006E42]/[0.07] px-2 py-0.5 text-[10.5px] font-medium text-[#006E42]">{t}</span>)}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
