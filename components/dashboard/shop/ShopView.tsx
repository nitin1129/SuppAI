"use client";

import {
  ArrowRight,
  Bone,
  Brain,
  Check,
  ChevronRight,
  Dumbbell,
  Leaf,
  Moon,
  PackageCheck,
  Plus,
  ShieldPlus,
  Tag,
  Waves,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { useHydrated } from "@/lib/hooks/useHydrated";
import { categories, products } from "@/lib/shop/data";
import type { ShopCategory, ShopProduct } from "@/lib/shop/types";

import { useBooking } from "../booking/BookingContext";
import { Packshot, ProductVisual } from "./Packshot";
import { ProductCard } from "./ProductCard";
import { EmptyResults, SearchField, SortMenu, matchesQuery, sortProducts, type SortKey } from "./ShopControls";
import { inr, percentOff, useProductActions } from "./useProductActions";

/* ------------------------------------------------------------------ */
/* Catalogue facts, derived once                                       */
/* ------------------------------------------------------------------ */

const byReviews = (a: ShopProduct, b: ShopProduct) => b.reviews - a.reviews;

const SHORT_NAME: Record<string, string> = {
  vitamins: "Vitamins",
  performance: "Sports",
  ayurveda: "Ayurveda",
  omega: "Omega",
  plant: "Plant & tea",
  equipment: "Equipment",
  wearables: "Wearables",
  recovery: "Recovery",
};

const CATEGORY_NAME = Object.fromEntries(categories.map((c) => [c.id, c.name]));

const SHELVES = categories
  .map((c) => ({ category: c, items: products.filter((p) => p.categoryId === c.id).sort(byReviews) }))
  .filter((s) => s.items.length > 0);

const BESTSELLERS = [...products].sort(byReviews).slice(0, 8);

const SUPPLEMENTS = new Set(["vitamins", "performance", "ayurveda", "omega", "plant"]);
const DEAL = products
  .filter((p) => SUPPLEMENTS.has(p.categoryId))
  .sort((a, b) => percentOff(b) - percentOff(a) || b.reviews - a.reviews)[0];

type Goal = { id: string; label: string; icon: LucideIcon; tags: string[] };

const GOALS: Goal[] = [
  { id: "sleep", label: "Sleep", icon: Moon, tags: ["Sleep", "Stress"] },
  { id: "energy", label: "Energy", icon: Zap, tags: ["Energy"] },
  { id: "immunity", label: "Immunity", icon: ShieldPlus, tags: ["Immunity"] },
  { id: "bones", label: "Bones & joints", icon: Bone, tags: ["Bones", "Joints"] },
  { id: "strength", label: "Strength", icon: Dumbbell, tags: ["Strength", "27g protein", "Bulk"] },
  { id: "focus", label: "Focus", icon: Brain, tags: ["Focus", "Brain"] },
  { id: "recovery", label: "Recovery", icon: Waves, tags: ["Recovery", "Stretch", "Support"] },
  { id: "vegan", label: "Vegan", icon: Leaf, tags: ["Vegan"] },
].filter((g) => products.some((p) => p.tags.some((t) => g.tags.includes(t))));

const PAD = "px-4 md:px-10";

const WEEKLY_PERKS = ["20% off labs too", "Doctor consult included", "One free home lab pickup"];

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export function ShopView() {
  const [query, setQuery] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("popular");
  const top = useRef<HTMLDivElement>(null);

  const goal = GOALS.find((g) => g.id === goalId) ?? null;
  const filtering = query.trim() !== "" || goal !== null;

  const results = useMemo(() => {
    if (!filtering) return [];
    const list = products.filter(
      (p) =>
        matchesQuery(p, query, [CATEGORY_NAME[p.categoryId] ?? ""]) &&
        (!goal || p.tags.some((t) => goal.tags.includes(t))),
    );
    return sortProducts(list, sort);
  }, [filtering, query, goal, sort]);

  /** Results replace the browse shelves, so bring the top of the shop back into view. */
  function jumpToTop() {
    top.current?.scrollIntoView({ block: "start" });
  }

  function changeQuery(v: string) {
    if (!filtering && v.trim()) jumpToTop();
    setQuery(v);
  }

  function pickGoal(id: string) {
    setGoalId((cur) => (cur === id ? null : id));
    jumpToTop();
  }

  function clearAll() {
    setQuery("");
    setGoalId(null);
  }

  return (
    <div ref={top} className="@container scroll-mt-0 pb-12 md:pb-14">
      {/* Search stays in reach while browsing */}
      <div className={`sticky top-0 z-20 bg-[#f6faf7] pb-3 pt-2 md:pt-4 ${PAD}`}>
        <SearchField
          value={query}
          onChange={changeQuery}
          placeholder="Search the shop: vitamins, protein, brands"
          className="w-full @4xl:max-w-xl"
        />
      </div>

      {/* Shop by goal */}
      <div className={`no-scrollbar flex gap-2 overflow-x-auto scroll-px-4 md:scroll-px-10 ${PAD}`} role="group" aria-label="Shop by goal">
        {GOALS.map((g) => {
          const on = goalId === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => pickGoal(g.id)}
              aria-pressed={on}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/45 ${
                on
                  ? "bg-[#0f3a26] text-[#f6faf7]"
                  : "bg-white text-[#0f3a26]/80 ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/35"
              }`}
            >
              <g.icon className={`h-3.5 w-3.5 ${on ? "text-[#9af2c4]" : "text-[#0f3a26]/45"}`} aria-hidden />
              {g.label}
              {on && <X className="-mr-1 h-3.5 w-3.5 text-[#f6faf7]/70" aria-hidden />}
            </button>
          );
        })}
      </div>

      {filtering ? (
        <Results
          results={results}
          query={query}
          goal={goal}
          sort={sort}
          onSort={setSort}
          onClear={clearAll}
        />
      ) : (
        <>
          <CategoryStrip />
          <PromoRow />
          <Shelf title="Bestsellers" items={BESTSELLERS} />
          {SHELVES.map(({ category, items }) => (
            <Shelf
              key={category.id}
              title={category.name}
              items={items}
              href={`/dashboard/shop/${category.slug}`}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Categories: the pack each aisle sells, not an icon                  */
/* ------------------------------------------------------------------ */

function CategoryStrip() {
  return (
    <nav aria-label="Categories" className="mt-5 @4xl:mt-7">
      <ul
        className={`no-scrollbar flex gap-3 overflow-x-auto scroll-px-4 md:scroll-px-10 @xl:grid @xl:grid-cols-4 @xl:gap-4 @xl:overflow-visible @4xl:grid-cols-8 ${PAD}`}
      >
        {SHELVES.map(({ category, items }) => (
          <li key={category.id} className="w-[76px] shrink-0 @xl:w-auto">
            <CategoryTile category={category} lead={items[0]} count={items.length} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CategoryTile({ category: c, lead, count }: { category: ShopCategory; lead: ShopProduct; count: number }) {
  return (
    <Link
      href={`/dashboard/shop/${c.slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6faf7]"
    >
      <span
        aria-hidden
        className="block aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-inset ring-[#0f3a26]/6 transition-shadow duration-200 group-hover:shadow-[0_14px_28px_-18px_rgba(15,58,38,0.35)]"
      >
        <Packshot product={lead} className="h-full w-full" />
      </span>
      <span className="mt-2 block text-center text-[11.5px] font-medium leading-tight text-[#0f3a26] group-hover:text-[#006E42] @4xl:text-[13px]">
        {SHORT_NAME[c.id] ?? c.name}
      </span>
      <span className="mt-0.5 hidden text-center text-[11px] tabular-nums text-[#0f3a26]/45 @xl:block">
        {count} {count === 1 ? "item" : "items"}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Deal of the week + member savings                                   */
/* ------------------------------------------------------------------ */

function PromoRow() {
  return (
    <ul
      className={`no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 md:scroll-px-10 @4xl:mt-9 @4xl:grid @4xl:grid-cols-3 @4xl:gap-4 @4xl:overflow-visible ${PAD}`}
      aria-label="Offers"
    >
      {DEAL && (
        <li className="w-[88%] shrink-0 snap-start @xl:w-[66%] @4xl:col-span-2 @4xl:w-auto">
          <DealCard product={DEAL} />
        </li>
      )}
      <li className="w-[88%] shrink-0 snap-start @xl:w-[66%] @4xl:w-auto">
        <MemberTile />
      </li>
    </ul>
  );
}

function DealCard({ product: p }: { product: ShopProduct }) {
  const { add, justAdded } = useProductActions(p);
  const href = `/dashboard/shop/${p.categoryId}/${p.id}`;
  const off = percentOff(p);

  return (
    <article className="group relative flex h-full items-center gap-4 overflow-hidden rounded-3xl bg-[#0f3a26] p-4 text-[#f6faf7] @xl:gap-6 @xl:p-6">
      <div className="min-w-0 flex-1">
        <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9af2c4]">
          <Tag className="h-3 w-3" aria-hidden />
          Deal of the week
        </p>
        <h2 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight @xl:text-[22px] @6xl:text-[26px]">
          <Link href={href} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9af2c4]/60">
            {p.name}
          </Link>
        </h2>
        <p className="mt-1 truncate text-[12px] text-[#f6faf7]/60 @xl:text-[13px]">
          {p.brand}
          <span className="hidden @xl:inline"> · {p.description}</span>
        </p>

        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[22px] font-bold leading-none tabular-nums @xl:text-[28px]">{inr(p.price)}</span>
          <span className="text-[12px] tabular-nums text-[#f6faf7]/45 line-through">{inr(p.mrp)}</span>
          {off > 0 && (
            <span className="rounded-full bg-[#c79a3d] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[#0f3a26]">
              {off}% off
            </span>
          )}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={add}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#9af2c4] px-4 text-[13px] font-semibold text-[#0f3a26] transition-colors duration-200 hover:bg-[#b5f6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9af2c4]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f3a26]"
          >
            {justAdded ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
            {justAdded ? "Added" : "Add to cart"}
          </button>
          <Link
            href={href}
            className="hidden h-10 items-center rounded-xl px-3.5 text-[13px] font-medium text-[#f6faf7]/80 ring-1 ring-inset ring-[#f6faf7]/15 transition-colors hover:bg-[#f6faf7]/5 hover:text-[#f6faf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9af2c4]/60 @xl:inline-flex"
          >
            View details
          </Link>
        </div>
      </div>

      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="block w-[108px] shrink-0 overflow-hidden rounded-2xl @xl:w-[168px] @6xl:w-[210px]"
      >
        <ProductVisual product={p} image={p.image} className="aspect-square w-full" />
      </Link>
    </article>
  );
}

function MemberTile() {
  const hydrated = useHydrated();
  const { currentTier } = useBooking();
  const base =
    "flex h-full flex-col rounded-3xl bg-white p-4 ring-1 ring-inset ring-[#0f3a26]/8 shadow-[0_10px_30px_-20px_rgba(15,58,38,0.22)] @xl:p-6";

  if (!hydrated) return <div className={`${base} min-h-[180px]`} aria-hidden />;

  if (currentTier === "weekly") {
    return (
      <Link href="/dashboard/track#orders" className={`${base} group transition-shadow hover:shadow-[0_18px_36px_-20px_rgba(0,110,66,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/45`}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]">
          <PackageCheck className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-4 text-[17px] font-semibold tracking-tight text-[#0f3a26] @xl:text-[19px]">Track your orders</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#0f3a26]/60">
          Delivery status for everything you have bought.
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-[#006E42]">
          Open orders
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
    );
  }

  return (
    <Link href="/dashboard/plans" className={`${base} group transition-shadow hover:shadow-[0_18px_36px_-20px_rgba(0,110,66,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/45`}>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9c7426]">
        Weekly plan · ₹99 a week
      </p>
      <p className="mt-2 text-[17px] font-semibold leading-snug tracking-tight text-[#0f3a26] @xl:text-[21px]">
        Save 20% on supplements
      </p>
      <ul className="mt-3 space-y-2">
        {WEEKLY_PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-2 text-[13px] text-[#0f3a26]/70">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            </span>
            {perk}
          </li>
        ))}
      </ul>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-[#006E42]">
        See the Weekly plan
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Shelves: swipe rails on phones, grids once there is room            */
/* ------------------------------------------------------------------ */

/** Rails show every item; grids show exactly one full row (3, then 4, then 5 up). */
function gridVisibility(i: number): string {
  if (i >= 5) return "@xl:hidden";
  if (i === 4) return "@xl:hidden @6xl:block";
  if (i === 3) return "@xl:hidden @4xl:block";
  return "";
}

function Shelf({ title, items, href }: { title: string; items: ShopProduct[]; href?: string }) {
  const id = `shelf-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="mt-8 @4xl:mt-11">
      <div className={`flex items-baseline justify-between gap-3 ${PAD}`}>
        <h2 id={id} className="truncate text-[17px] font-semibold tracking-tight text-[#0f3a26] @4xl:text-[20px]">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-0.5 rounded-md text-[13px] font-semibold text-[#006E42] transition-colors hover:text-[#005634] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/45"
          >
            See all {items.length}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>

      <ul
        className={`no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 pb-1 md:scroll-px-10 @xl:mt-4 @xl:grid @xl:grid-cols-3 @xl:gap-4 @xl:overflow-visible @xl:pb-0 @4xl:grid-cols-4 @6xl:grid-cols-5 ${PAD}`}
      >
        {items.map((p, i) => (
          <li key={p.id} className={`w-[44%] shrink-0 snap-start @xl:w-auto ${gridVisibility(i)}`}>
            <ProductCard product={p} />
          </li>
        ))}
        {href && (
          // Ends the rail on phones; on a 5-up grid it completes a 4-item row.
          <li className={`w-[44%] shrink-0 snap-start @xl:hidden ${items.length === 4 ? "@6xl:block" : ""}`}>
            <Link
              href={href}
              className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#006E42]/[0.05] p-4 text-center text-[13px] font-semibold text-[#006E42] ring-1 ring-inset ring-[#006E42]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/45"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#006E42] ring-1 ring-[#006E42]/15">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
              See all {items.length}
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Search and goal results                                             */
/* ------------------------------------------------------------------ */

function Results({
  results,
  query,
  goal,
  sort,
  onSort,
  onClear,
}: {
  results: ShopProduct[];
  query: string;
  goal: Goal | null;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  onClear: () => void;
}) {
  const q = query.trim();
  return (
    <section aria-label="Results" className={`mt-5 ${PAD}`}>
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="min-w-0 text-[13px] text-[#0f3a26]/60">
          <span className="font-semibold tabular-nums text-[#0f3a26]">{results.length}</span>{" "}
          {results.length === 1 ? "product" : "products"}
          {goal && <> for {goal.label.toLowerCase()}</>}
          {q && <> matching &ldquo;{q}&rdquo;</>}
        </p>
        {results.length > 1 && <SortMenu value={sort} onChange={onSort} />}
      </div>

      {results.length === 0 ? (
        <EmptyResults query={query} onClear={onClear} />
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 @xl:grid-cols-3 @xl:gap-4 @4xl:grid-cols-4 @6xl:grid-cols-5">
          {results.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
