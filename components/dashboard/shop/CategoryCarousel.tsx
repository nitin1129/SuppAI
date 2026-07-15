"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { getProductsByCategory } from "@/lib/shop/data";
import type { ShopCategory } from "@/lib/shop/types";

import { ProductCard } from "./ProductCard";

type Props = {
  category: ShopCategory;
};

export function CategoryCarousel({ category }: Props) {
  const products = getProductsByCategory(category.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function update() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function scrollBy(dir: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section className="group/section">
      {/* Row header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.15),0_8px_20px_-12px_rgba(0,0,0,0.25)]"
            style={{
              background: `linear-gradient(135deg, ${category.accent} 0%, ${category.accent}cc 100%)`,
            }}
          >
            <category.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
              {category.tagline}
            </p>
            <h3 className="text-[20px] font-bold leading-tight tracking-tight text-[#0f3a26]">
              {category.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Inline arrows (md+) */}
          <div className="hidden items-center gap-1 md:flex">
            <ArrowButton
              direction="left"
              disabled={!canLeft}
              onClick={() => scrollBy(-1)}
            />
            <ArrowButton
              direction="right"
              disabled={!canRight}
              onClick={() => scrollBy(1)}
            />
          </div>
          <Link
            href={`/dashboard/shop/${category.slug}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[#006E42] transition-colors duration-200 hover:bg-[#006E42]/8"
          >
            See all {products.length}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Scrollable row */}
      <div className="relative">
        {/* Fading edge masks for visual depth */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-[#f6faf7] to-transparent transition-opacity duration-200 ${
            canLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-[#f6faf7] to-transparent transition-opacity duration-200 ${
            canRight ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          ref={scrollRef}
          onScroll={update}
          className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              className="w-[260px] shrink-0 snap-start sm:w-[280px]"
            >
              <ProductCard product={p} delay={i * 0.03} />
            </div>
          ))}

          {/* Tail card */}
          <Link
            href={`/dashboard/shop/${category.slug}`}
            className="group/tail flex w-[260px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl bg-[#006E42]/5 p-6 text-center text-[#006E42] ring-1 ring-[#006E42]/15 transition-shadow duration-200 ease-out hover:bg-[#006E42]/10 sm:w-[280px]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white ring-1 ring-[#006E42]/15 transition group-hover/tail:scale-105">
              <ArrowRight className="h-5 w-5 transition group-hover/tail:translate-x-0.5" />
            </span>
            <p className="text-[13px] font-semibold">See all in {category.name}</p>
            <p className="text-[11.5px] text-[#0f3a26]/55">
              {products.length} products
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#0f3a26]/70 shadow-[0_1px_2px_-1px_rgba(15,58,38,0.06),0_8px_18px_-10px_rgba(15,58,38,0.25)] ring-1 ring-[#0f3a26]/8 transition-all duration-200 ease-out hover:text-[#006E42] hover:ring-[#006E42]/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:ring-[#0f3a26]/8"
    >
      {direction === "left" ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}
