"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Check, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ShopProduct } from "@/lib/shop/types";

export type SortKey = "popular" | "price-low" | "price-high" | "rating";

export const sortLabels: Record<SortKey, string> = {
  popular: "Most popular",
  "price-low": "Price: low to high",
  "price-high": "Price: high to low",
  rating: "Highest rated",
};

const sortShort: Record<SortKey, string> = {
  popular: "Popular",
  "price-low": "Price ↑",
  "price-high": "Price ↓",
  rating: "Rating",
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function sortProducts(list: ShopProduct[], sort: SortKey): ShopProduct[] {
  const sorted = [...list];
  switch (sort) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    default:
      return sorted.sort((a, b) => b.reviews - a.reviews);
  }
}

export function matchesQuery(p: ShopProduct, query: string, extra: string[] = []): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [p.name, p.brand, p.description, ...p.tags, ...extra].some((s) => s.toLowerCase().includes(q));
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label
      className={`flex h-10 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-[#0f3a26]/10 transition-shadow focus-within:ring-2 focus-within:ring-[#006E42]/45 ${className}`}
    >
      <Search className="h-4 w-4 shrink-0 text-[#0f3a26]/40" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
          aria-label="Clear search"
          className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#0f3a26]/45 transition-colors hover:bg-[#0f3a26]/5 hover:text-[#0f3a26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  );
}

export function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort: ${sortLabels[value]}`}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-3 text-[13px] font-medium text-[#0f3a26] ring-1 ring-[#0f3a26]/10 transition-shadow hover:ring-[#006E42]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/45"
      >
        <ArrowUpDown className="h-3.5 w-3.5 text-[#0f3a26]/55" />
        <span className="sm:hidden">{sortShort[value]}</span>
        <span className="hidden sm:inline">{sortLabels[value]}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Sort products"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl bg-white p-1 shadow-[0_18px_36px_-18px_rgba(15,58,38,0.3)] ring-1 ring-[#0f3a26]/10"
          >
            {(Object.keys(sortLabels) as SortKey[]).map((k) => (
              <li key={k}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === k}
                  onClick={() => {
                    onChange(k);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition-colors hover:bg-[#006E42]/6 focus-visible:bg-[#006E42]/6 focus-visible:outline-none ${
                    value === k ? "font-semibold text-[#006E42]" : "text-[#0f3a26]/75"
                  }`}
                >
                  {sortLabels[k]}
                  {value === k && <Check className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EmptyResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-[#0f3a26]/8">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#006E42]/8 text-[#006E42]">
        <Search className="h-5 w-5" />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-[#0f3a26]">
        {query.trim() ? `Nothing matches "${query.trim()}"` : "Nothing matches these filters"}
      </p>
      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[#0f3a26]/55">
        Try a brand, an ingredient like magnesium, or a goal like sleep.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-xl bg-[#006E42] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#005634] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 focus-visible:ring-offset-2"
      >
        Show all products
      </button>
    </div>
  );
}
