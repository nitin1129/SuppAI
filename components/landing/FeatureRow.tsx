"use client";

import { motion } from "framer-motion";
import { Brain, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  {
    icon: Brain,
    title: "AI that reads labs.",
    body: "Drop a report — get an instant breakdown of what's low, borderline, and trending in the wrong direction.",
  },
  {
    icon: Sparkles,
    title: "Plans tuned to you.",
    body: "Supplements, doses, timing, and meal swaps designed around your numbers, not a generic chart.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design.",
    body: "Your reports stay encrypted end-to-end. We never train on, sell, or share your health data.",
  },
];

export function FeatureRow() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-xl"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#006E42]">
            Why SuppAI
          </p>
          <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight text-[#0f3a26] sm:text-[42px]">
            Designed to feel like a thoughtful clinician, not a chatbot.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-3">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-[#006E42]/10 text-[#006E42]">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-[20px] font-semibold tracking-tight text-[#0f3a26]">
                {f.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[#0f3a26]/65">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
