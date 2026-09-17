"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { Section } from "@/lib/dashboard-data";

type Props = {
  section: Section;
};

export function SectionView({ section }: Props) {
  const [hero, ...rest] = section.features;

  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 pb-12 pt-2 md:px-10 md:pb-14"
    >
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#006E42]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
          <section.icon className="h-3 w-3" />
          {section.title}
        </div>
        <h2 className="mt-4 text-[25px] font-semibold leading-[1.15] tracking-tight text-[#0f3a26] sm:text-[34px] sm:leading-[1.1]">
          {section.blurb}
        </h2>
      </div>

      {/* Hero feature gets more breathing room and a different presentation */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="group mt-9 flex w-full items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#006E42] via-[#007a4a] to-[#008a53] p-7 text-left text-white transition hover:brightness-105"
      >
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
          <hero.icon className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
            Featured
          </p>
          <h3 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight">
            {hero.label}
          </h3>
          <p className="mt-1.5 max-w-xl text-[13.5px] leading-[1.55] text-white/75">
            {hero.description}
          </p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-white/70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
      </motion.button>

      {/* Rest as a denser two-column list */}
      <ul className="mt-8 grid grid-cols-1 gap-x-10 lg:grid-cols-2">
        {rest.map((f, i) => (
          <motion.li
            key={f.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 * i }}
            className="border-b border-[#006E42]/10 last:border-b-0"
          >
            <button className="group flex w-full items-start gap-4 py-4 text-left">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42] transition group-hover:bg-[#006E42] group-hover:text-white">
                <f.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14.5px] font-semibold text-[#0f3a26] transition group-hover:text-[#006E42]">
                  {f.label}
                </h3>
                <p className="mt-0.5 text-[12.5px] leading-[1.55] text-[#0f3a26]/60">
                  {f.description}
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#0f3a26]/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#006E42]" />
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
