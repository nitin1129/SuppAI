"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { WellnessTip } from "@/lib/wellness-tips";

type Props = {
  headline: string;
  subline: string;
  features?: string[];
  tips?: WellnessTip[];
};

export function BrandSide({ headline, subline, features, tips }: Props) {
  const [tip, setTip] = useState<WellnessTip | null>(null);

  useEffect(() => {
    if (tips && tips.length > 0) {
      setTip(tips[Math.floor(Math.random() * tips.length)]);
    }
  }, [tips]);
  return (
    <div className="relative hidden h-full min-h-screen overflow-hidden bg-gradient-to-br from-[#005634] via-[#006E42] to-[#008a53] lg:flex lg:flex-col">
      <div
        aria-hidden
        className="absolute -left-40 -top-20 h-[34rem] w-[34rem] rounded-full bg-white/[0.07] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -right-40 h-[38rem] w-[38rem] rounded-full bg-[#00d97f]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 flex h-full min-h-screen flex-col items-center justify-center px-14 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="relative h-[150px] w-[240px] overflow-hidden">
            <Image
              src="/logos/supp-ai-bw.png"
              alt="SuppAI"
              width={870}
              height={1230}
              priority
              className="absolute left-0 top-[-20px] h-auto w-[240px]"
            />
          </div>

          <h1 className="mt-10 max-w-[460px] text-[44px] font-medium leading-[1.05] tracking-tight">
            {headline}
          </h1>

          <p className="mt-5 max-w-[360px] text-[15px] leading-[1.6] text-white/75">
            {subline}
          </p>

          {features && features.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-col gap-3 text-left"
            >
              {features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 text-[14px] text-white/90"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden>
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {f}
                </motion.li>
              ))}
            </motion.ul>
          )}

          {tip && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex max-w-[380px] items-start gap-3.5 rounded-2xl bg-white/[0.08] p-4 text-left ring-1 ring-white/15 backdrop-blur-sm"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6V17c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  {tip.label}
                </p>
                <p className="mt-1 text-[13px] leading-[1.5] text-white/90">
                  {tip.body}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute bottom-8 text-[11px] text-white/45"
        >
          © 2026 SuppAI · Your health, intelligently managed.
        </motion.p>
      </div>
    </div>
  );
}
