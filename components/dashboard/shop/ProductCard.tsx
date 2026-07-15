"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ShopProduct } from "@/lib/shop/types";

type Props = {
  product: ShopProduct;
  delay?: number;
};

const badgeStyle: Record<
  NonNullable<ShopProduct["badge"]>,
  { bg: string; fg: string }
> = {
  Bestseller: { bg: "#F1623A", fg: "#ffffff" },
  "Editor's pick": { bg: "#0f3a26", fg: "#ffffff" },
  New: { bg: "#006E42", fg: "#ffffff" },
};

const EASE_OUT_QUART = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product: p, delay = 0 }: Props) {
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const save = p.mrp - p.price;
  const badge = p.badge ? badgeStyle[p.badge] : null;
  const reduceMotion = useReducedMotion();
  const [wished, setWished] = useState(false);
  const [popKey, setPopKey] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE_OUT_QUART }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={{ y: 0 }}
      style={{ willChange: "transform" }}
      className="group h-full"
    >
      <Link
        href={`/dashboard/shop/${p.categoryId}/${p.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-inset ring-[#0f3a26]/8 shadow-[0_1px_2px_-1px_rgba(15,58,38,0.04)] transition-shadow duration-300 ease-out hover:shadow-[0_2px_4px_-2px_rgba(15,58,38,0.06),0_18px_36px_-22px_rgba(0,110,66,0.22)]"
      >
      {/* Image */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: p.swatch }}
      >
        {p.image && (
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 280px"
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          />
        )}

        {badge && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: delay + 0.1, ease: EASE_OUT_QUART }}
            className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider shadow-[0_4px_10px_-4px_rgba(0,0,0,0.25)]"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {p.badge}
          </motion.span>
        )}

        {off > 0 && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: delay + 0.14, ease: EASE_OUT_QUART }}
            className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#0f3a26] ring-1 ring-[#0f3a26]/8 backdrop-blur-sm"
          >
            {off}% off
          </motion.span>
        )}

        {/* Wishlist: press feedback + scale pop on toggle */}
        <motion.button
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
          transition={{ duration: 0.12, ease: EASE_OUT_QUART }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWished((v) => !v);
            setPopKey((k) => k + 1);
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-[#0f3a26]/55 shadow-[0_6px_14px_-8px_rgba(15,58,38,0.4)] ring-1 ring-[#0f3a26]/8 backdrop-blur-sm transition-colors duration-200 ease-out hover:text-[#F1623A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1623A]/40"
        >
          <motion.span
            key={popKey}
            initial={popKey === 0 || reduceMotion ? false : { scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.22, ease: EASE_OUT_QUART }}
            className="grid place-items-center"
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-200 ${
                wished ? "fill-[#F1623A] text-[#F1623A]" : ""
              }`}
            />
          </motion.span>
        </motion.button>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
            {p.brand}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#0f3a26]/55">
            <Star className="h-3 w-3 fill-[#F1623A] text-[#F1623A]" />
            <span className="font-semibold text-[#0f3a26]">{p.rating}</span>
            <span>({(p.reviews / 1000).toFixed(1)}k)</span>
          </span>
        </div>

        <h4 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug text-[#0f3a26]">
          {p.name}
        </h4>

        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.55] text-[#0f3a26]/55">
          {p.description}
        </p>

        {p.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-[#006E42]/[0.07] px-2 py-0.5 text-[10.5px] font-medium text-[#006E42]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#0f3a26]/8 pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-[20px] font-bold leading-none tabular-nums text-[#0f3a26]">
                ₹{p.price.toLocaleString()}
              </p>
              {off > 0 && (
                <p className="text-[11.5px] tabular-nums text-[#0f3a26]/40 line-through">
                  ₹{p.mrp.toLocaleString()}
                </p>
              )}
            </div>
            {off > 0 && (
              <p className="mt-1 text-[11px] font-semibold tabular-nums text-[#006E42]">
                Save ₹{save.toLocaleString()}
              </p>
            )}
          </div>
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.12, ease: EASE_OUT_QUART }}
            aria-label={`Add ${p.name} to cart`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(0,110,66,0.55)] transition-colors duration-200 ease-out hover:bg-[#005634] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            Add
          </motion.button>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
