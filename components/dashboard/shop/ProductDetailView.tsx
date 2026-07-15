"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Heart,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/cart/WishlistContext";
import { getCategory, getProductsByCategory } from "@/lib/shop/data";
import type { ProductDetail } from "@/lib/shop/types";

import { ProductCard } from "./ProductCard";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductDetailView({ product: p }: { product: ProductDetail }) {
  const category = getCategory(p.categoryId);
  const save = p.mrp - p.price;

  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { addItem } = useCart();
  const { isProductWished, togglProduct } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const wished = isProductWished(p.id);
  const [popKey, setPopKey] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [added, setAdded] = useState(false);

  function setWished() {
    togglProduct(p.id, {
      productId: p.id,
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      image: p.image ?? p.gallery[0] ?? "",
      price: p.price,
      mrp: p.mrp,
    });
  }

  function handleAddToCart(goToCart: boolean) {
    if (subscribe) {
      addItem({
        kind: "product-subscription",
        productId: p.id,
        name: p.name,
        brand: p.brand,
        categoryId: p.categoryId,
        image: p.image ?? p.gallery[0] ?? "",
        unitPrice: finalUnit,
        unitMrp: unitMrp,
        packLabel: activePack.label,
        frequencyWeeks: weeksFromPackId(activePack.id),
      });
    } else {
      addItem({
        kind: "product-onetime",
        productId: p.id,
        name: p.name,
        brand: p.brand,
        categoryId: p.categoryId,
        image: p.image ?? p.gallery[0] ?? "",
        unitPrice: finalUnit,
        unitMrp: unitMrp,
        qty,
        packLabel: isSubscribable && activePack ? activePack.label : undefined,
      });
    }
    if (goToCart) {
      router.push("/dashboard/cart");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  // Consumable categories support Subscribe & Save (medicines / supplements).
  // Durable goods do not.
  const SUBSCRIBABLE = new Set([
    "vitamins",
    "performance",
    "ayurveda",
    "omega",
    "plant",
  ]);
  const isSubscribable = SUBSCRIBABLE.has(p.categoryId);

  const packs = packsFor(p);
  const [packIdx, setPackIdx] = useState(0);
  const activePack = packs[packIdx];
  const [subscribe, setSubscribe] = useState(false);
  const subDiscount = 0.15;

  // Top-of-page price is always per-unit (or per-cycle when subscribed).
  // The cart total only appears as an estimate next to the quantity stepper.
  const unitPrice = subscribe
    ? Math.round(p.price * activePack.multiplier)
    : p.price;
  const unitMrp = subscribe
    ? Math.round(p.mrp * activePack.multiplier)
    : p.mrp;
  const finalUnit = subscribe
    ? Math.round(unitPrice * (1 - subDiscount))
    : unitPrice;
  const lineTotal = finalUnit * (subscribe ? 1 : qty);

  const similar = getProductsByCategory(p.categoryId).filter(
    (x) => x.id !== p.id,
  );

  return (
    <div className="px-10 pb-14 pt-2">
      <Link
        href={category ? `/dashboard/shop/${category.slug}` : "/dashboard/shop"}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {category ? category.name : "Shop"}
      </Link>

      {/* TOP: 2-column. Left sticks while right scrolls. */}
      <div className="mt-5 grid grid-cols-1 items-start gap-x-14 gap-y-8 lg:grid-cols-[1fr_1fr]">
        {/* LEFT: sticky visual stack, fits within viewport */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ProductVisuals
            product={p}
            activeImage={activeImage}
            onSelectImage={setActiveImage}
            wished={wished}
            popKey={popKey}
            onToggleWish={() => {
              setWished();
              setPopKey((k) => k + 1);
            }}
            onOpenZoom={() => setZoomOpen(true)}
            reduceMotion={!!reduceMotion}
          />
        </div>

        {/* RIGHT: detail + price + actions + full description */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
          className="flex flex-col"
        >
          {/* Brand eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#006E42]">
            {p.brand}
          </p>

          {/* Title */}
          <h1 className="mt-3 text-[40px] font-bold leading-[1] tracking-[-0.01em] text-[#0f3a26]">
            {p.name}
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-[52ch] text-[14.5px] leading-[1.55] text-[#0f3a26]/60">
            {p.description}
          </p>

          {/* Rating + badge — calm inline row */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[12.5px] text-[#0f3a26]/65">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex gap-0.5 text-[#0f3a26]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    fill={i < Math.round(p.rating) ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </span>
              <span className="font-semibold text-[#0f3a26] tabular-nums">
                {p.rating}
              </span>
            </span>
            <span className="text-[#0f3a26]/25">·</span>
            <a
              href="#reviews"
              className="text-[#0f3a26]/60 underline-offset-2 hover:text-[#006E42] hover:underline"
            >
              {p.reviews.toLocaleString()} reviews
            </a>
            {p.badge && (
              <>
                <span className="text-[#0f3a26]/25">·</span>
                <span className="font-medium text-[#006E42]">{p.badge}</span>
              </>
            )}
          </div>

          {/* Price — typography only, no tinted box */}
          <div className="mt-9">
            <p className="flex items-baseline gap-3">
              <span className="text-[44px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[#0f3a26]">
                ₹{finalUnit.toLocaleString()}
              </span>
              {unitMrp > finalUnit && (
                <span className="text-[15px] tabular-nums text-[#0f3a26]/40 line-through">
                  ₹{unitMrp.toLocaleString()}
                </span>
              )}
            </p>
            <p className="mt-2 text-[12.5px] text-[#0f3a26]/55">
              {unitMrp > finalUnit && (
                <>
                  <span className="font-semibold text-[#006E42]">
                    Save ₹{(unitMrp - finalUnit).toLocaleString()}
                  </span>
                  <span className="mx-2 text-[#0f3a26]/25">·</span>
                </>
              )}
              Inclusive of all taxes
            </p>
            {save > 0 && !subscribe && (
              <p className="mt-1 text-[11.5px] text-[#0f3a26]/45">
                Save up to {Math.round(subDiscount * 100)}% more with Subscribe
              </p>
            )}
          </div>

          {/* Purchase type — supplements only */}
          {isSubscribable && (
            <div className="mt-7 grid grid-cols-1 gap-2">
              <button
                onClick={() => setSubscribe(false)}
                aria-pressed={!subscribe}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  !subscribe
                    ? "bg-[#006E42]/[0.04] ring-2 ring-inset ring-[#006E42]"
                    : "bg-white ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/30"
                }`}
              >
                <div>
                  <p
                    className={`text-[13.5px] font-semibold ${
                      !subscribe ? "text-[#006E42]" : "text-[#0f3a26]"
                    }`}
                  >
                    One-time purchase
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/55">
                    Buy as much or as little as you want.
                  </p>
                </div>
                <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
                  ₹{p.price.toLocaleString()}
                  <span className="ml-1 text-[10.5px] font-normal text-[#0f3a26]/55">
                    each
                  </span>
                </p>
              </button>
              <button
                onClick={() => setSubscribe(true)}
                aria-pressed={subscribe}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  subscribe
                    ? "bg-[#006E42]/[0.04] ring-2 ring-inset ring-[#006E42]"
                    : "bg-white ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/30"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-[13.5px] font-semibold ${
                        subscribe ? "text-[#006E42]" : "text-[#0f3a26]"
                      }`}
                    >
                      Subscribe & save
                    </p>
                    <span className="rounded-full bg-[#006E42] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">
                      -{Math.round(subDiscount * 100)}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/55">
                    Auto-deliver. Skip or cancel anytime.
                  </p>
                </div>
                <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
                  ₹{Math.round(p.price * activePack.multiplier * (1 - subDiscount)).toLocaleString()}
                </p>
              </button>
            </div>
          )}

          {/* Pack size — only when subscribed (medicines) */}
          {isSubscribable && subscribe && packs.length > 1 && (
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
                Delivery cadence
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {packs.map((pk, i) => {
                  const isActive = i === packIdx;
                  const packPrice = Math.round(
                    p.price * pk.multiplier * (1 - subDiscount),
                  );
                  return (
                    <button
                      key={pk.id}
                      onClick={() => setPackIdx(i)}
                      aria-pressed={isActive}
                      className={`relative rounded-xl px-3 py-3 text-left transition ${
                        isActive
                          ? "bg-[#006E42]/[0.04] ring-2 ring-inset ring-[#006E42]"
                          : "bg-white ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/30"
                      }`}
                    >
                      {pk.bestValue && (
                        <span className="absolute -top-2 right-2 rounded-full bg-[#006E42] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">
                          Best
                        </span>
                      )}
                      <p
                        className={`text-[13px] font-bold ${
                          isActive ? "text-[#006E42]" : "text-[#0f3a26]"
                        }`}
                      >
                        Every {pk.label}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/55">
                        {pk.sub}
                      </p>
                      <p
                        className={`mt-2 text-[13px] font-semibold tabular-nums ${
                          isActive ? "text-[#0f3a26]" : "text-[#0f3a26]/75"
                        }`}
                      >
                        ₹{packPrice.toLocaleString()} / cycle
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + wishlist — hidden when Subscribe mode is active */}
          <div className="mt-8 flex items-center gap-3">
            {!subscribe && (
              <>
                <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-inset ring-[#0f3a26]/10">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="grid h-10 w-10 place-items-center rounded-lg text-[#0f3a26]/65 transition hover:bg-[#006E42]/8 hover:text-[#006E42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/35"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="grid h-10 min-w-[48px] place-items-center text-[15px] font-bold tabular-nums text-[#0f3a26]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="grid h-10 w-10 place-items-center rounded-lg text-[#0f3a26]/65 transition hover:bg-[#006E42]/8 hover:text-[#006E42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/35"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {qty > 1 && (
                  <p className="text-[12px] leading-tight text-[#0f3a26]/55">
                    Estimate{" "}
                    <span className="font-semibold tabular-nums text-[#0f3a26]">
                      ₹{lineTotal.toLocaleString()}
                    </span>
                  </p>
                )}
              </>
            )}
            <button
              onClick={() => {
                setWished();
                setPopKey((k) => k + 1);
              }}
              aria-label="Toggle wishlist"
              aria-pressed={wished}
              className={`grid h-12 w-12 place-items-center rounded-xl bg-white ring-1 ring-inset ring-[#0f3a26]/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/35 ${
                wished ? "text-[#006E42]" : "text-[#0f3a26]/55 hover:text-[#006E42]"
              }`}
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-[#006E42]" : ""}`} />
            </button>
          </div>

          {/* Actions: Add to cart + Buy now (both go through cart) */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.button
              onClick={() => handleAddToCart(false)}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.12, ease: EASE }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-[14px] font-semibold text-[#006E42] ring-1 ring-inset ring-[#006E42]/30 transition-colors duration-200 ease-out hover:bg-[#006E42]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/35"
            >
              {added ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Add to cart
                </>
              )}
            </motion.button>
            <motion.button
              onClick={() => handleAddToCart(true)}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.12, ease: EASE }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006E42] px-5 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_24px_-10px_rgba(0,110,66,0.55)] transition-colors duration-200 ease-out hover:bg-[#005634] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6faf7]"
            >
              <CreditCard className="h-4 w-4" />
              Buy now
            </motion.button>
          </div>

          {/* Trust strip */}
          <ul className="mt-6 grid grid-cols-3 gap-3 border-t border-[#0f3a26]/8 pt-5 text-[11.5px] text-[#0f3a26]/65">
            <li className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-[#006E42]" />
              Free shipping over ₹499
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#006E42]" />
              Authentic & lab tested
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#006E42]" />
              7-day easy returns
            </li>
          </ul>

          {/* Full product description, Amazon-style */}
          <div className="mt-10 border-t border-[#0f3a26]/8 pt-7">
            <h2 className="text-[18px] font-bold tracking-tight text-[#0f3a26]">
              About this product
            </h2>
            <p className="mt-3 max-w-prose text-[13.5px] leading-[1.7] text-[#0f3a26]/70">
              {p.longDescription}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Spec label="Recommended dosage" value={p.dosage} />
              <Spec label="Brand" value={p.brand} />
              <Spec label="Category" value={category?.name ?? "—"} />
              <Spec
                label="Form"
                value={p.tags.find((t) => /capsule|tablet|powder|gummies/i.test(t)) ?? "Capsules"}
              />
            </div>
          </div>

          {/* Key benefits — quick scannable card */}
          <div className="mt-8 border-t border-[#0f3a26]/8 pt-7">
            <h2 className="text-[18px] font-bold tracking-tight text-[#0f3a26]">
              Key benefits
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {benefitsFor(p).map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl bg-white p-3.5 ring-1 ring-inset ring-[#0f3a26]/8"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/10 text-[#006E42]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#0f3a26]">
                      {title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-[#0f3a26]/60">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-8 border-t border-[#0f3a26]/8 pt-7">
            <h2 className="text-[18px] font-bold tracking-tight text-[#0f3a26]">
              Ingredients & badges
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#006E42]" />
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Pairs well with — quick bundle */}
          <div className="mt-8 border-t border-[#0f3a26]/8 pt-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[18px] font-bold tracking-tight text-[#0f3a26]">
                Goes well with
              </h2>
              <span className="text-[11px] font-medium text-[#006E42]">
                Bundle saves 12%
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">
              Members often add these alongside {p.name.split(" ")[0]}.
            </p>
            <PairsWithRow currentId={p.id} categoryId={p.categoryId} />
          </div>
        </motion.section>
      </div>

      {/* BELOW: reviews + Q&A + similar products */}
      <ReviewsBlock product={p} />

      <QABlock product={p} />

      {similar.length > 0 && (
        <SimilarProducts categoryName={category?.name ?? "this category"} similar={similar} />
      )}

      {/* Zoomable fullscreen image viewer */}
      {zoomOpen && (
        <Lightbox
          images={p.gallery}
          initial={activeImage}
          alt={p.name}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}

/* --------------------------- LEFT visual stack --------------------------- */

function ProductVisuals({
  product: p,
  activeImage,
  onSelectImage,
  wished,
  popKey,
  onToggleWish,
  onOpenZoom,
  reduceMotion,
}: {
  product: ProductDetail;
  activeImage: number;
  onSelectImage: (n: number) => void;
  wished: boolean;
  popKey: number;
  onToggleWish: () => void;
  onOpenZoom: () => void;
  reduceMotion: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col gap-4"
    >
      {/* Hero image — click anywhere to open full-screen zoom */}
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenZoom}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenZoom();
          }
        }}
        aria-label="Open full-screen view"
        className="group relative aspect-[4/3] max-h-[58vh] cursor-zoom-in overflow-hidden rounded-3xl bg-[#f6faf7] ring-1 ring-inset ring-[#0f3a26]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40"
      >
        <Image
          key={activeImage}
          src={p.gallery[activeImage]}
          alt={`${p.name} view ${activeImage + 1}`}
          fill
          sizes="(max-width: 1024px) 92vw, 600px"
          className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          priority
        />

        {/* Zoom hint */}
        <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <ZoomIn className="h-3 w-3" />
          Click to zoom
        </span>

        {p.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-[#F1623A] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-white">
            {p.badge}
          </span>
        )}

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWish();
          }}
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
          transition={{ duration: 0.12, ease: EASE }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[#0f3a26]/65 shadow-[0_6px_14px_-8px_rgba(15,58,38,0.35)] ring-1 ring-[#0f3a26]/8 transition hover:text-[#F1623A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1623A]/40"
        >
          <motion.span
            key={popKey}
            initial={popKey === 0 || reduceMotion ? false : { scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="grid place-items-center"
          >
            <Heart
              className={`h-4 w-4 ${wished ? "fill-[#F1623A] text-[#F1623A]" : ""}`}
            />
          </motion.span>
        </motion.button>
      </div>

      {/* Thumbnails — selected gets a strong green border + check */}
      <div className="grid grid-cols-4 gap-1.5">
        {p.gallery.map((src, i) => {
          const isActive = i === activeImage;
          return (
            <button
              key={src}
              onClick={() => onSelectImage(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={isActive}
              className={`relative aspect-[6/5] overflow-hidden rounded-lg bg-[#f6faf7] ring-1 ring-inset ring-[#0f3a26]/10 transition-all duration-200 ease-out focus-visible:outline-[#006E42]/35 ${
                isActive
                  ? "outline outline-[3px] outline-[#006E42] outline-offset-2"
                  : "outline-none hover:ring-[#006E42]/35"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1024px) 22vw, 150px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Brand stats — varied tiles */}
      <div className="grid grid-cols-5 gap-2.5">
        <BrandStatTile
          stat={p.brandStats[0]}
          className="col-span-2 bg-[#e9efe9]"
        />
        <BrandStatTile
          stat={p.brandStats[1]}
          className="col-span-3 bg-gradient-to-br from-[#006E42] to-[#005634] text-white"
          accent
        />
      </div>
    </motion.section>
  );
}

function BrandStatTile({
  stat,
  className = "",
  accent = false,
}: {
  stat: { value: string; label: string };
  className?: string;
  accent?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-3 ${className}`}>
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/12 blur-2xl"
        />
      )}
      <p
        className={`text-[22px] font-bold leading-none tabular-nums ${
          accent ? "text-white" : "text-[#0f3a26]"
        }`}
      >
        {stat.value}
      </p>
      <p
        className={`mt-1 text-[10.5px] font-medium ${
          accent ? "text-white/70" : "text-[#0f3a26]/55"
        }`}
      >
        {stat.label}
      </p>
    </div>
  );
}

/* ----------------------------- Helpers + Reviews ----------------------------- */

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
        {label}
      </p>
      <p className="mt-1 text-[13px] text-[#0f3a26]">{value}</p>
    </div>
  );
}

function ReviewsBlock({ product: p }: { product: ProductDetail }) {
  const total = p.ratingBreakdown.reduce((a, b) => a + b, 0) || 1;
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      id="reviews"
      className="mt-14 scroll-mt-24 border-t border-[#0f3a26]/10 pt-10"
    >
      <div className="flex items-baseline justify-between gap-4 pb-4">
        <h2 className="text-[22px] font-bold tracking-tight text-[#0f3a26]">
          Reviews ({p.rating} of 5)
        </h2>
        <a
          href="#"
          className="text-[12.5px] font-medium text-[#006E42] hover:underline"
        >
          Read all {p.reviews.toLocaleString()}
        </a>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="text-[44px] font-bold leading-none tabular-nums text-[#0f3a26]">
            {p.rating.toFixed(1)}
            <span className="ml-1 text-[16px] font-medium text-[#0f3a26]/55">
              /5
            </span>
          </p>
          <div className="mt-2 flex gap-0.5 text-[#F1623A]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4"
                fill={i < Math.round(p.rating) ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-[#0f3a26]/55">
            Based on {p.reviews.toLocaleString()} verified reviews
          </p>

          <ul className="mt-5 space-y-2">
            {p.ratingBreakdown.map((count, i) => {
              const star = 5 - i;
              const pct = Math.round((count / total) * 100);
              return (
                <li key={star} className="flex items-center gap-3 text-[11.5px]">
                  <span className="w-3 text-right tabular-nums text-[#0f3a26]/55">
                    {star}
                  </span>
                  <Star className="h-3 w-3 fill-[#F1623A] text-[#F1623A]" />
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#0f3a26]/8">
                    <motion.span
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className="block h-full rounded-full bg-[#006E42]"
                    />
                  </span>
                  <span className="w-10 text-right tabular-nums text-[#0f3a26]/55">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-5">
          {p.reviewsList.map((r) => (
            <article
              key={r.id}
              className="border-b border-[#0f3a26]/8 pb-5 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#006E42]/10 text-[12px] font-semibold text-[#006E42]">
                  {r.author
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#0f3a26]">
                    {r.author}, {r.age} {r.gender}
                  </p>
                  <p className="text-[10.5px] text-[#0f3a26]/50">{r.date}</p>
                </div>
                <div className="ml-auto flex gap-0.5 text-[#F1623A]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      fill={i < r.rating ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2.5 text-[13px] leading-[1.6] text-[#0f3a26]/70">
                {r.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ---------------------------- Benefits + how-to ---------------------------- */

function benefitsFor(p: ProductDetail) {
  // Derive a sensible set of 4 benefits per category.
  const base = [
    { icon: ShieldCheck, title: "Lab tested", body: "Third-party verified for purity and potency." },
    { icon: Leaf, title: "Clean label", body: "No artificial colours, fillers, or banned substances." },
  ];
  const byCategory: Record<string, { icon: typeof ShieldCheck; title: string; body: string }[]> = {
    vitamins: [
      { icon: Zap, title: "Daily energy", body: "Steady B-vitamin and mineral support across the day." },
      { icon: Award, title: "23+ nutrients", body: "Built around RDA-matched dosing for adults." },
    ],
    performance: [
      { icon: Zap, title: "Faster recovery", body: "Designed to reduce post-workout soreness." },
      { icon: Award, title: "Tested for athletes", body: "Free from banned substances on the WADA list." },
    ],
    ayurveda: [
      { icon: Sparkles, title: "Adaptogenic", body: "Supports the body's response to daily stressors." },
      { icon: Leaf, title: "Traditionally rooted", body: "Classical formulation with modern quality control." },
    ],
    omega: [
      { icon: Sparkles, title: "Brain & heart", body: "High-strength EPA/DHA for cognitive and cardio support." },
      { icon: Award, title: "IFOS rated", body: "Tested for heavy metals and oxidation." },
    ],
    plant: [
      { icon: Leaf, title: "Plant-first", body: "100% vegan formulation with clean ingredients." },
      { icon: Sparkles, title: "Easy on gut", body: "Free from common allergens and dairy." },
    ],
    equipment: [
      { icon: Award, title: "Built to last", body: "Quality-grade materials, tested through 10,000+ reps." },
      { icon: Sparkles, title: "Storage friendly", body: "Compact form factor and easy to clean." },
    ],
    wearables: [
      { icon: Zap, title: "All-day comfort", body: "Designed for long wear without irritation." },
      { icon: Award, title: "Premium build", body: "Quality-grade fabrics and sensors." },
    ],
    recovery: [
      { icon: Zap, title: "Targeted relief", body: "Designed for deep-tissue and trigger-point use." },
      { icon: Sparkles, title: "Effortless setup", body: "Quick to use, easy to maintain." },
    ],
  };
  return [...(byCategory[p.categoryId] ?? []), ...base].slice(0, 4);
}

/* ---------------------------- Pack sizes ---------------------------- */

type Pack = { id: string; label: string; sub: string; multiplier: number; bestValue?: boolean };

function packsFor(p: ProductDetail): Pack[] {
  if (p.categoryId === "equipment" || p.categoryId === "wearables") {
    return [{ id: "single", label: "1 unit", sub: "Standard pack", multiplier: 1 }];
  }
  return [
    { id: "30", label: "30 day", sub: `${p.tags[0] ?? "1 unit"} pack`, multiplier: 1 },
    { id: "60", label: "60 day", sub: "2 month supply", multiplier: 1.88, bestValue: true },
    { id: "90", label: "90 day", sub: "3 month supply", multiplier: 2.6 },
  ];
}

function weeksFromPackId(id: string): number {
  if (id === "60") return 8;
  if (id === "90") return 12;
  return 4;
}

/* ---------------------------- Pairs With row ---------------------------- */

function PairsWithRow({
  currentId,
  categoryId,
}: {
  currentId: string;
  categoryId: string;
}) {
  // Pull a few products from the same category, excluding the current.
  const list = getProductsByCategory(categoryId)
    .filter((x) => x.id !== currentId)
    .slice(0, 3);

  if (list.length === 0) return null;

  return (
    <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
      {list.map((p) => (
        <Link
          key={p.id}
          href={`/dashboard/shop/${p.categoryId}/${p.id}`}
          className="group flex w-[180px] shrink-0 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-[#0f3a26]/8 transition hover:ring-[#006E42]/25"
        >
          <div
            className="relative aspect-square"
            style={{ background: p.swatch }}
          >
            {p.image && (
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="200px"
                className="object-cover transition group-hover:scale-[1.03]"
              />
            )}
          </div>
          <div className="p-3">
            <p className="line-clamp-2 text-[12px] font-semibold leading-tight text-[#0f3a26]">
              {p.name}
            </p>
            <p className="mt-1 text-[13px] font-bold tabular-nums text-[#0f3a26]">
              ₹{p.price.toLocaleString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ---------------------------------- Q&A ---------------------------------- */

function QABlock({ product: p }: { product: ProductDetail }) {
  const qa = qaFor(p);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mt-14 border-t border-[#0f3a26]/10 pt-10"
    >
      <div className="flex items-baseline justify-between gap-4 pb-2">
        <h2 className="text-[22px] font-bold tracking-tight text-[#0f3a26]">
          Questions answered
        </h2>
        <a
          href="#"
          className="text-[12.5px] font-medium text-[#006E42] hover:underline"
        >
          Ask a question
        </a>
      </div>
      <ul className="mt-4 divide-y divide-[#0f3a26]/8">
        {qa.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-[14px] font-semibold text-[#0f3a26]">
                  {item.q}
                </span>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
                  {isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="pb-5 pr-10 text-[13px] leading-[1.65] text-[#0f3a26]/70">
                  {item.a}
                </p>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

function qaFor(p: ProductDetail): { q: string; a: string }[] {
  return [
    {
      q: "Is this product safe for daily use?",
      a: "Yes. The formulation is built around standard adult dosing and is safe for consistent daily use. If you are pregnant, nursing, on medication, or under 18, please consult a clinician first.",
    },
    {
      q: "When should I take it?",
      a: `${p.dosage} Most members notice steadier results when they take it at the same time each day.`,
    },
    {
      q: "How long does one bottle last?",
      a: "At standard dosing, one bottle lasts roughly 30 days. Subscribe and save 15% to get it auto-delivered before you run out.",
    },
    {
      q: "What is the return policy?",
      a: "Unopened items can be returned within 7 days for a full refund. If you receive a damaged item, contact care@suppai.health and we will resolve it within 48 hours.",
    },
  ];
}

/* -------------------------- Similar products row -------------------------- */

function SimilarProducts({
  categoryName,
  similar,
}: {
  categoryName: string;
  similar: ReturnType<typeof getProductsByCategory>;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mt-14 border-t border-[#0f3a26]/10 pt-10"
    >
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-[22px] font-bold tracking-tight text-[#0f3a26]">
          More from {categoryName}
        </h2>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1">
        {similar.map((p, i) => (
          <div
            key={p.id}
            className="w-[240px] shrink-0 snap-start sm:w-[260px]"
          >
            <ProductCard product={p} delay={i * 0.03} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ------------------------------ Lightbox ------------------------------ */

function Lightbox({
  images,
  initial,
  alt,
  onClose,
}: {
  images: string[];
  initial: number;
  alt: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initial);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Keyboard nav: Esc / arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", onKey);
    // Lock page scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [images.length, onClose]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return;
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: EASE }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0f3a26]/96 backdrop-blur-xl"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 text-white/80">
        <p className="text-[12.5px]">
          <span className="font-semibold text-white">{index + 1}</span>
          <span className="mx-1.5 text-white/40">/</span>
          {images.length}
        </p>
        <p className="hidden text-[11.5px] text-white/55 sm:block">
          Click image to {zoomed ? "zoom out" : "zoom in"} · Arrow keys to navigate · Esc to close
        </p>
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center px-2">
        <button
          onClick={() =>
            setIndex((i) => (i - 1 + images.length) % images.length)
          }
          aria-label="Previous image"
          className="absolute left-6 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          onClick={() => setZoomed((v) => !v)}
          onMouseMove={onMove}
          onMouseLeave={() => setZoomed(false)}
          className={`relative h-full max-h-[78vh] w-full max-w-[1100px] ${
            zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
        >
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="relative h-full w-full overflow-hidden"
          >
            <Image
              src={images[index]}
              alt={`${alt} view ${index + 1}`}
              fill
              sizes="100vw"
              className="select-none object-contain transition-transform duration-300 ease-out"
              style={{
                transform: zoomed ? "scale(2.2)" : "scale(1)",
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
              priority
            />
          </motion.div>
        </div>

        <button
          onClick={() => setIndex((i) => (i + 1) % images.length)}
          aria-label="Next image"
          className="absolute right-6 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Thumb strip */}
      <div className="mx-auto mb-6 mt-2 flex max-w-[640px] gap-2 px-6">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/8 ring-1 ring-inset transition ${
              i === index
                ? "ring-2 ring-white"
                : "ring-white/15 hover:ring-white/40"
            }`}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
