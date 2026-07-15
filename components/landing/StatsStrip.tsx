"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "12K+", label: "Members" },
  { value: "100+", label: "Markers analyzed" },
  { value: "4.9", label: "Average rating" },
  { value: "24/7", label: "AI support" },
];

export function StatsStrip() {
  return (
    <section className="border-y border-[#006E42]/10 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[#006E42]/10 px-6 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="px-2 py-8 text-center"
          >
            <p className="text-[34px] font-semibold tracking-tight text-[#006E42]">
              {s.value}
            </p>
            <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/55">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
