"use client";

import { motion } from "framer-motion";
import { Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { categories, products } from "@/lib/shop/data";

import { CategoryCarousel } from "./CategoryCarousel";

export function ShopView() {
  return (
    <div className="relative px-10 pb-14 pt-2">
      {/* Top soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[280px]"
        style={{
          background:
            "radial-gradient(900px 280px at 50% -30%, rgba(0,110,66,0.10), transparent 70%)",
        }}
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#006E42]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
            <ShoppingBag className="h-3 w-3" />
            SuppAI Shop
          </div>
          <h2 className="mt-4 text-[34px] font-semibold leading-[1.05] tracking-tight text-[#0f3a26]">
            Everything you need,{" "}
            <span className="text-[#006E42]">curated.</span>
          </h2>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#0f3a26]/60">
            Vetted supplements, training gear, recovery tools, and apparel.
            One place, fair prices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#006E42]/12 transition focus-within:ring-[#006E42]/40 md:flex md:w-72">
            <Search className="h-4 w-4 text-[#006E42]/50" />
            <input
              placeholder="Search supplements, gear…"
              className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
            />
          </div>
          <div className="hidden rounded-xl bg-white px-4 py-2 text-center ring-1 ring-[#006E42]/12 sm:block">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
              Catalog
            </p>
            <p className="text-[15px] font-semibold tabular-nums text-[#0f3a26]">
              {products.length}+ items
            </p>
          </div>
        </div>
      </motion.div>

      {/* Categories — all visible, jump to a row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8"
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
          Browse {categories.length} categories
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`#cat-${c.id}`}
              className="group flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-[#0f3a26]/8 transition-shadow duration-200 ease-out hover:shadow-[0_2px_4px_-2px_rgba(15,58,38,0.06),0_12px_24px_-18px_rgba(0,110,66,0.2)] hover:ring-[#006E42]/30"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.15)]"
                style={{
                  background: `linear-gradient(135deg, ${c.accent} 0%, ${c.accent}cc 100%)`,
                }}
              >
                <c.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <p className="truncate text-[13px] font-bold leading-tight text-[#0f3a26] group-hover:text-[#006E42]">
                  {c.name}
                </p>
                <p className="text-[10.5px] text-[#0f3a26]/50">
                  {c.productCount} products
                </p>
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Category carousels */}
      <div className="mt-12 space-y-14">
        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            id={`cat-${c.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="scroll-mt-24"
          >
            <CategoryCarousel category={c} />
          </motion.div>
        ))}
      </div>

      {/* Footer prompt */}
      <div className="mt-14 rounded-3xl bg-gradient-to-br from-[#006E42] to-[#00532f] p-7 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
              Pro perks
            </p>
            <h3 className="mt-1 text-[20px] font-semibold tracking-tight">
              Members get 20% off and free home pickups.
            </h3>
            <p className="mt-1.5 text-[12.5px] text-white/75">
              Available on Weekly Pro and above.
            </p>
          </div>
          <Link
            href="/dashboard/plans"
            className="rounded-full bg-white px-5 py-2 text-[12.5px] font-semibold text-[#006E42] transition hover:bg-white/90"
          >
            See plans
          </Link>
        </div>
      </div>
    </div>
  );
}
