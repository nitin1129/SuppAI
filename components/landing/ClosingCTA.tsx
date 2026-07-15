"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ClosingCTA() {
  return (
    <section className="bg-white px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-[44px] font-semibold leading-[1.05] tracking-tight text-[#0f3a26] sm:text-[56px]">
          Ready when you are.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-[#0f3a26]/60">
          One report. One plan. One login away.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-[#006E42] px-7 py-3.5 text-[15px] font-medium text-white shadow-[0_15px_30px_-12px_rgba(0,110,66,0.5)] transition hover:bg-[#005634]"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
