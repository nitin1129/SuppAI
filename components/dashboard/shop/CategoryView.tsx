"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { getProductsByCategory } from "@/lib/shop/data";
import type { ShopCategory } from "@/lib/shop/types";

import { ProductCard } from "./ProductCard";

type SortKey = "popular" | "price-low" | "price-high" | "rating";

const sortLabels: Record<SortKey, string> = {
  popular: "Most popular",
  "price-low": "Price: low to high",
  "price-high": "Price: high to low",
  rating: "Highest rated",
};

export function CategoryView({ category }: { category: ShopCategory }) {
  const all = useMemo(() => getProductsByCategory(category.id), [category.id]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [activeTag, setActiveTag] = useState<string>("All");

  const tags = useMemo(() => {
    const set = new Set<string>();
    all.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [all]);

  const visible = useMemo(() => {
    let list = all;
    if (activeTag !== "All")
      list = list.filter((p) => p.tags.includes(activeTag));
    if (query.trim())
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()),
      );
    const sorted = [...list];
    switch (sort) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sorted.sort((a, b) => b.reviews - a.reviews);
    }
    return sorted;
  }, [all, activeTag, query, sort]);

  return (
    <div className="px-4 pb-12 pt-2 md:px-10 md:pb-14">
      <Link
        href="/dashboard/shop"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Shop
      </Link>

      {/* Category hero band */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mt-3 flex items-center justify-between overflow-hidden rounded-3xl p-7 text-white"
        style={{
          background: `linear-gradient(135deg, ${category.accent} 0%, ${category.accent}cc 100%)`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-white/12 blur-3xl"
        />
        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
            {category.tagline}
          </p>
          <h2 className="mt-2 text-[34px] font-semibold leading-[1.05] tracking-tight">
            {category.name}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">
            {category.blurb}
          </p>
        </div>
        <div
          aria-hidden
          className="relative z-10 hidden text-[120px] opacity-30 grayscale md:block"
          style={{ filter: "brightness(2)" }}
        >
          {category.emoji}
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
                activeTag === t
                  ? "bg-[#006E42] text-white"
                  : "bg-white text-[#0f3a26]/75 ring-1 ring-[#0f3a26]/10 hover:ring-[#006E42]/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-[12.5px] text-[#0f3a26]/55 ring-1 ring-[#006E42]/12 focus-within:ring-[#006E42]/40 sm:flex sm:w-60">
            <Search className="h-3.5 w-3.5 text-[#006E42]/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this category"
              className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
            />
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Result count */}
      <p className="mt-5 text-[12px] text-[#0f3a26]/55">
        {visible.length} of {all.length} products
      </p>

      {/* Product grid */}
      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#006E42]/15 p-10 text-center text-[13px] text-[#0f3a26]/55">
          No products match your filters.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 0.03} />
          ))}
        </div>
      )}
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[12.5px] font-medium text-[#0f3a26] ring-1 ring-[#006E42]/12 transition hover:ring-[#006E42]/30"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {sortLabels[value]}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-xl bg-white shadow-[0_18px_36px_-18px_rgba(15,58,38,0.25)] ring-1 ring-[#006E42]/12">
          {(Object.keys(sortLabels) as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                onChange(k);
                setOpen(false);
              }}
              className={`block w-full px-3.5 py-2 text-left text-[12.5px] transition hover:bg-[#006E42]/5 ${
                value === k
                  ? "font-semibold text-[#006E42]"
                  : "text-[#0f3a26]/75"
              }`}
            >
              {sortLabels[k]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
