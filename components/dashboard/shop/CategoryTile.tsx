"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { ShopCategory } from "@/lib/shop/types";

type Props = {
  category: ShopCategory;
  size?: "lg" | "md" | "sm";
  delay?: number;
};

export function CategoryTile({ category: c, size = "md", delay = 0 }: Props) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link
        href={`/dashboard/shop/${c.slug}`}
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl text-left shadow-[0_1px_2px_-1px_rgba(15,58,38,0.05),0_18px_36px_-22px_rgba(15,58,38,0.18)] transition-shadow duration-300 ease-out hover:shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_28px_50px_-22px_rgba(0,110,66,0.25)] ${
          isLarge ? "p-7" : isSmall ? "p-5" : "p-6"
        }`}
        style={{
          background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent}cc 100%)`,
        }}
      >
        {/* Soft top sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        {/* Soft corner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/12 blur-3xl transition group-hover:bg-white/18"
        />
        {/* Big emoji decoration */}
        <div
          aria-hidden
          className={`pointer-events-none absolute right-4 ${isLarge ? "bottom-4 text-[140px]" : "bottom-3 text-[88px]"} opacity-[0.18] grayscale transition group-hover:opacity-[0.28]`}
          style={{ filter: "grayscale(0) brightness(2)" }}
        >
          {c.emoji}
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 ring-1 ring-white/20 backdrop-blur-sm">
            <c.icon className="h-3 w-3" />
            {c.productCount} products
          </span>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
            {c.tagline}
          </p>
          <h3
            className={`mt-1 font-semibold tracking-tight text-white ${
              isLarge
                ? "text-[32px] leading-[1.05]"
                : isSmall
                  ? "text-[18px] leading-tight"
                  : "text-[22px] leading-tight"
            }`}
          >
            {c.name}
          </h3>
          {isLarge && (
            <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-white/75">
              {c.blurb}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white">
            Browse
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
