"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Heart, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { ShopProduct } from "@/lib/shop/types";

import { ProductVisual } from "./Packshot";
import { percentOff, useProductActions } from "./useProductActions";

type Props = {
  product: ShopProduct;
  delay?: number;
};

const badgeStyle: Record<NonNullable<ShopProduct["badge"]>, string> = {
  Bestseller: "bg-[#0f3a26] text-[#9af2c4]",
  "Editor's pick": "bg-[#f5ecd6] text-[#7a5a1e]",
  New: "bg-[#006E42] text-white",
};

const EASE_OUT_QUART = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product: p, delay = 0 }: Props) {
  const off = percentOff(p);
  const reduceMotion = useReducedMotion();
  const { add, justAdded, inCart, wished, toggleWish: toggle } = useProductActions(p);
  const [popKey, setPopKey] = useState(0);
  const href = `/dashboard/shop/${p.categoryId}/${p.id}`;

  function toggleWish() {
    toggle();
    setPopKey((k) => k + 1);
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE_OUT_QUART }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_-1px_rgba(15,58,38,0.05)] ring-1 ring-inset ring-[#0f3a26]/8 transition-shadow duration-300 ease-out focus-within:ring-2 focus-within:ring-[#006E42]/40 hover:shadow-[0_2px_4px_-2px_rgba(15,58,38,0.06),0_18px_36px_-22px_rgba(0,110,66,0.25)]"
    >
      {/* Visual */}
      <div className="relative">
        <ProductVisual product={p} image={p.image} className="aspect-square w-full" />

        {p.badge && (
          <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:left-3 sm:top-3 sm:text-[9.5px] ${badgeStyle[p.badge]}`}>
            {p.badge}
          </span>
        )}

        <motion.button
          type="button"
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
          transition={{ duration: 0.12, ease: EASE_OUT_QUART }}
          onClick={toggleWish}
          aria-label={wished ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
          aria-pressed={wished}
          className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#0f3a26]/55 shadow-[0_6px_14px_-8px_rgba(15,58,38,0.4)] ring-1 ring-[#0f3a26]/8 transition-colors duration-200 hover:text-[#c14040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c14040]/40 sm:right-2.5 sm:top-2.5"
        >
          <motion.span
            key={popKey}
            initial={popKey === 0 || reduceMotion ? false : { scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.22, ease: EASE_OUT_QUART }}
            className="grid place-items-center"
          >
            <Heart className={`h-4 w-4 transition-colors duration-200 ${wished ? "fill-[#c14040] text-[#c14040]" : ""}`} />
          </motion.span>
        </motion.button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45 sm:text-[10.5px]">
            {p.brand}
          </p>
          <span className="hidden shrink-0 items-center gap-1 text-[11px] text-[#0f3a26]/55 sm:inline-flex">
            <Star className="h-3 w-3 fill-[#c79a3d] text-[#c79a3d]" />
            <span className="font-semibold tabular-nums text-[#0f3a26]">{p.rating}</span>
            <span className="tabular-nums">({(p.reviews / 1000).toFixed(1)}k)</span>
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-[#0f3a26] sm:text-[14.5px]">
          {/* stretched link: the whole card opens the product, buttons stay separate */}
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {p.name}
          </Link>
        </h3>

        <span className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-[#0f3a26]/55 sm:hidden">
          <Star className="h-3 w-3 fill-[#c79a3d] text-[#c79a3d]" />
          <span className="font-semibold tabular-nums text-[#0f3a26]">{p.rating}</span>
          <span className="tabular-nums">· {(p.reviews / 1000).toFixed(1)}k</span>
        </span>

        {p.tags.length > 0 && (
          <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
            {p.tags.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-[#006E42]/[0.07] px-2 py-0.5 text-[10.5px] font-medium text-[#006E42]">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-[16px] font-bold leading-none tabular-nums text-[#0f3a26] sm:text-[19px]">
                ₹{p.price.toLocaleString("en-IN")}
              </span>
              {off > 0 && (
                <span className="text-[11px] tabular-nums text-[#0f3a26]/40 line-through">
                  ₹{p.mrp.toLocaleString("en-IN")}
                </span>
              )}
            </p>
            {off > 0 && (
              <p className="mt-1 text-[10.5px] font-semibold tabular-nums text-[#9c7426] sm:text-[11px]">
                {off}% off
              </p>
            )}
          </div>

          <motion.button
            type="button"
            onClick={add}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            transition={{ duration: 0.12, ease: EASE_OUT_QUART }}
            aria-label={`Add ${p.name} to cart`}
            className={`relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40 focus-visible:ring-offset-2 sm:w-auto sm:px-3.5 ${
              justAdded
                ? "bg-[#9af2c4] text-[#0f3a26]"
                : "bg-[#006E42] text-white shadow-[0_8px_18px_-10px_rgba(0,110,66,0.55)] hover:bg-[#005634]"
            }`}
          >
            {justAdded ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
            <span className="hidden sm:inline">{justAdded ? "Added" : inCart ? "Add more" : "Add"}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
