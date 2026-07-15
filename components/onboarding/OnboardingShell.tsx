"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  stepIndex: number; // zero-based
  totalSteps: number;
  encouragement: string;
  question: string;
  hint?: string;
  canContinue: boolean;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  children: ReactNode;
};

export function OnboardingShell({
  stepIndex,
  totalSteps,
  encouragement,
  question,
  hint,
  canContinue,
  onBack,
  onContinue,
  continueLabel = "Continue",
  children,
}: Props) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const stepsLeft = totalSteps - stepIndex - 1;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#f6faf7]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, #006E42 0%, #5fb389 35%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, #006E42 0%, #b8d8c4 40%, transparent 70%)",
        }}
      />

      <header className="relative z-10 mx-auto w-full max-w-2xl shrink-0 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="relative h-[50px] w-[80px] overflow-hidden">
            <Image
              src="/logos/supp-ai-primary.png"
              alt="SuppAI"
              width={420}
              height={560}
              priority
              className="absolute left-0 top-[-5px] h-auto w-[80px]"
            />
          </div>
          <p className="text-[12px] font-medium text-[#0f3a26]/55">
            <span className="text-[#006E42]">Step {stepIndex + 1}</span> of{" "}
            {totalSteps}
            {stepsLeft > 0 ? ` · ${stepsLeft} left` : " · last one"}
          </p>
        </div>

        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-[#006E42]/10">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#006E42] to-[#008a53]"
          />
        </div>
      </header>

      <main className="no-scrollbar relative z-10 mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#006E42]">
              {encouragement}
            </p>
            <h1 className="mt-1.5 text-[26px] font-semibold leading-[1.15] tracking-tight text-[#0f3a26] sm:text-[30px]">
              {question}
            </h1>
            {hint && (
              <p className="mt-1.5 text-[13px] text-[#0f3a26]/55">{hint}</p>
            )}

            <div className="mt-6">{children}</div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-[#006E42]/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-[#0f3a26]/70 transition hover:bg-[#006E42]/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="group inline-flex items-center gap-2 rounded-full bg-[#006E42] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#005634] disabled:cursor-not-allowed disabled:bg-[#006E42]/30"
          >
            {continueLabel}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
