"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ChoiceCard } from "@/components/onboarding/ChoiceCard";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import {
  activityLevels,
  allergies,
  conditions,
  dietaryPatterns,
  genderOptions,
  healthGoals,
  initialAnswers,
  supplementPrefs,
  type OnboardingAnswers,
} from "@/lib/onboarding-data";

const TOTAL = 10;

const encouragements = [
  "Let's get to know you",
  "Quick basics",
  "About you",
  "Your body",
  "Your goals",
  "Heads up",
  "Your kitchen",
  "Your health profile",
  "Your lifestyle",
  "Almost done",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [done, setDone] = useState(false);

  function update<K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K],
  ) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggle(key: keyof OnboardingAnswers, id: string) {
    setAnswers((prev) => {
      const cur = prev[key] as string[];
      const next = cur.includes(id)
        ? cur.filter((x) => x !== id)
        : [...cur, id];
      return { ...prev, [key]: next };
    });
  }

  const stepValid: boolean[] = [
    answers.fullName.trim().length > 1,
    answers.age.trim() !== "" && Number(answers.age) > 0,
    answers.gender !== "",
    answers.height.trim() !== "" && answers.weight.trim() !== "",
    answers.goals.length > 0,
    true, // allergies optional
    answers.diet !== "",
    answers.conditions.length > 0,
    answers.activity !== "",
    answers.supplementPrefs.length > 0,
  ];

  function next() {
    if (step < TOTAL - 1) setStep((s) => s + 1);
    else setDone(true);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (done) return <DoneScreen name={answers.fullName} />;

  const isLast = step === TOTAL - 1;

  return (
    <OnboardingShell
      stepIndex={step}
      totalSteps={TOTAL}
      encouragement={encouragements[step]}
      question={questions[step]}
      hint={hints[step]}
      canContinue={stepValid[step]}
      onBack={step > 0 ? back : undefined}
      onContinue={next}
      continueLabel={isLast ? "Finish" : "Continue"}
    >
      {step === 0 && (
        <TextInput
          value={answers.fullName}
          onChange={(v) => update("fullName", v)}
          placeholder="Jane Doe"
          autoFocus
        />
      )}

      {step === 1 && (
        <TextInput
          value={answers.age}
          onChange={(v) => update("age", v.replace(/[^\d]/g, "").slice(0, 3))}
          placeholder="28"
          autoFocus
          suffix="years"
          inputMode="numeric"
        />
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {genderOptions.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              selected={answers.gender === o.id}
              onClick={() => update("gender", o.id)}
            />
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            value={answers.height}
            onChange={(v) => update("height", v.replace(/[^\d.]/g, "").slice(0, 5))}
            placeholder="170"
            label="Height"
            suffix="cm"
            inputMode="decimal"
          />
          <TextInput
            value={answers.weight}
            onChange={(v) => update("weight", v.replace(/[^\d.]/g, "").slice(0, 5))}
            placeholder="65"
            label="Weight"
            suffix="kg"
            inputMode="decimal"
          />
        </div>
      )}

      {step === 4 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {healthGoals.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              multi
              selected={answers.goals.includes(o.id)}
              onClick={() => toggle("goals", o.id)}
            />
          ))}
        </div>
      )}

      {step === 5 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {allergies.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              multi
              selected={answers.allergies.includes(o.id)}
              onClick={() => toggle("allergies", o.id)}
            />
          ))}
        </div>
      )}

      {step === 6 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {dietaryPatterns.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              selected={answers.diet === o.id}
              onClick={() => update("diet", o.id)}
            />
          ))}
        </div>
      )}

      {step === 7 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {conditions.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              multi
              selected={answers.conditions.includes(o.id)}
              onClick={() => toggle("conditions", o.id)}
            />
          ))}
        </div>
      )}

      {step === 8 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {activityLevels.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              selected={answers.activity === o.id}
              onClick={() => update("activity", o.id)}
            />
          ))}
        </div>
      )}

      {step === 9 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {supplementPrefs.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              multi
              selected={answers.supplementPrefs.includes(o.id)}
              onClick={() => toggle("supplementPrefs", o.id)}
            />
          ))}
        </div>
      )}
    </OnboardingShell>
  );
}

const questions = [
  "What's your full name?",
  "How old are you?",
  "How do you identify?",
  "Your height and weight?",
  "What are your primary health goals?",
  "Any food allergies or intolerances?",
  "What's your current dietary pattern?",
  "Any conditions you're managing?",
  "How active are you, day-to-day?",
  "Your supplement preferences?",
];

const hints = [
  "Just your first name works too.",
  "We use this to calibrate nutrient targets.",
  "Helps us tailor recommendations.",
  "Used for calorie and macro calculations.",
  "Pick all that apply.",
  "Skip if none. Pick all that apply.",
  "Pick the one closest to you.",
  "Pick all that apply. Stays private.",
  "Pick the one that best describes you.",
  "We'll match supplements to these.",
];

function TextInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  suffix,
  label,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  suffix?: string;
  label?: string;
  inputMode?: "numeric" | "decimal" | "text";
}) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-[12px] font-medium text-[#006E42]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3.5 text-[16px] text-[#0f3a26] placeholder:text-[#006E42]/30 transition focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#0f3a26]/50">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function DoneScreen({ name }: { name: string }) {
  const first = name.trim().split(" ")[0] || "there";
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#005634] via-[#006E42] to-[#008a53] px-6 text-center text-white">
      <div
        aria-hidden
        className="absolute -left-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-white/[0.07] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -right-40 h-[40rem] w-[40rem] rounded-full bg-[#00d97f]/25 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center"
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-sm">
          <Sparkles className="h-7 w-7" />
        </span>
        <h1 className="mt-7 max-w-xl text-[44px] font-semibold leading-[1.05] tracking-tight sm:text-[52px]">
          You&apos;re all set, {first}.
        </h1>
        <p className="mt-4 max-w-md text-[16px] leading-[1.55] text-white/80">
          Your personalized SuppAI plan is ready. Let&apos;s take a look.
        </p>
        <Link
          href="/dashboard"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-medium text-[#006E42] transition hover:bg-white/90"
        >
          Open my dashboard
        </Link>
      </motion.div>
    </div>
  );
}
