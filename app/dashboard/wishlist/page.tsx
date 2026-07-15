"use client";

import {
  ArrowRight,
  CalendarCheck2,
  Heart,
  Star,
  Stethoscope,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/cart/WishlistContext";
import type { WishlistItem } from "@/lib/cart/types";

type Tab = "all" | "product" | "doctor" | "test";

export default function WishlistPage() {
  const { items, remove, countByKind, hydrated } = useWishlist();
  const [tab, setTab] = useState<Tab>("all");

  const visible = items.filter((i) => tab === "all" || i.kind === tab);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: items.length },
    { id: "product", label: "Products", count: countByKind.product },
    { id: "doctor", label: "Doctors", count: countByKind.doctor },
    { id: "test", label: "Tests", count: countByKind.test },
  ];

  if (!hydrated) {
    return (
      <div className="px-10 py-8">
        <div className="h-72 animate-pulse rounded-3xl bg-white ring-1 ring-[#0f3a26]/8" />
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <div className="mx-auto max-w-5xl px-10 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
            Saved for later
          </p>
          <h2 className="mt-1 text-[22px] font-bold tracking-tight text-[#0f3a26]">
            Your wishlist
          </h2>
          <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">
            {items.length} item{items.length === 1 ? "" : "s"} across products,
            doctors and tests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              disabled={t.count === 0 && t.id !== "all"}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition disabled:opacity-40 ${
                tab === t.id
                  ? "bg-[#006E42] text-white"
                  : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                  tab === t.id ? "bg-white/15" : "bg-[#0f3a26]/8"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {visible.map((item) => (
          <WishRow key={item.id} item={item} onRemove={() => remove(item.id)} />
        ))}
      </ul>
    </div>
  );
}

function WishRow({
  item,
  onRemove,
}: {
  item: WishlistItem;
  onRemove: () => void;
}) {
  const { addItem } = useCart();
  const [moved, setMoved] = useState(false);

  function moveToCart() {
    switch (item.kind) {
      case "product":
        addItem({
          kind: "product-onetime",
          productId: item.productId,
          name: item.name,
          brand: item.brand,
          categoryId: item.categoryId,
          image: item.image,
          unitPrice: item.price,
          unitMrp: item.mrp,
          qty: 1,
        });
        setMoved(true);
        setTimeout(onRemove, 600);
        break;
      case "doctor":
      case "test":
        // Doctors and tests need slot picking; bounce to the relevant flow.
        return;
    }
  }

  if (item.kind === "product") {
    return (
      <li className="flex items-start gap-5 rounded-2xl bg-white p-4 ring-1 ring-[#0f3a26]/8">
        <Link
          href={`/dashboard/shop/${item.categoryId}/${item.productId}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8"
        >
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
            {item.brand}
          </p>
          <Link
            href={`/dashboard/shop/${item.categoryId}/${item.productId}`}
            className="mt-0.5 block truncate text-[14px] font-bold text-[#0f3a26] hover:underline"
          >
            {item.name}
          </Link>
          <p className="mt-1.5 text-[14px] font-bold tabular-nums text-[#0f3a26]">
            ₹{item.price.toLocaleString()}
            {item.mrp > item.price && (
              <span className="ml-2 text-[11px] font-medium text-[#0f3a26]/45 line-through">
                ₹{item.mrp.toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={moveToCart}
            disabled={moved}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-[#005634] disabled:bg-[#006E42]/60"
          >
            {moved ? "Added" : "Move to cart"}
            {!moved && <ArrowRight className="h-3 w-3" />}
          </button>
          <RemoveBtn onClick={onRemove} />
        </div>
      </li>
    );
  }

  if (item.kind === "doctor") {
    return (
      <li className="flex items-start gap-5 rounded-2xl bg-white p-4 ring-1 ring-[#0f3a26]/8">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
          <Stethoscope className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
            {item.doctor.specialtyLabel}
          </p>
          <p className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
            {item.doctor.name}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[#0f3a26]/65">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-[#c79a3d]" />
              {item.doctor.rating.toFixed(1)}
            </span>
            <span>{item.doctor.experienceYears} yrs experience</span>
            <span>From ₹{item.doctor.fee.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/get-healthy"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-[#005634]"
          >
            Book a slot
            <ArrowRight className="h-3 w-3" />
          </Link>
          <RemoveBtn onClick={onRemove} />
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-5 rounded-2xl bg-white p-4 ring-1 ring-[#0f3a26]/8">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
        <CalendarCheck2 className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
          Lab test
        </p>
        <p className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
          {item.name}
        </p>
        <p className="text-[11.5px] text-[#0f3a26]/65">{item.vendor}</p>
        <p className="mt-1.5 text-[14px] font-bold tabular-nums text-[#0f3a26]">
          ₹{item.price.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/diagnose"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-[#005634]"
        >
          Schedule
          <ArrowRight className="h-3 w-3" />
        </Link>
        <RemoveBtn onClick={onRemove} />
      </div>
    </li>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Remove from wishlist"
      className="grid h-9 w-9 place-items-center rounded-lg text-[#0f3a26]/45 transition hover:bg-[#c14040]/10 hover:text-[#c14040]"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function EmptyWishlist() {
  return (
    <div className="mx-auto max-w-3xl px-10 py-16">
      <div className="flex items-start gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#006E42]/10 text-[#006E42]">
          <Heart className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-[#0f3a26]">
            Nothing saved yet.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/60">
            Tap the heart on any product, doctor, or test to save it here for later.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/dashboard/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-[#006E42] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#005634]"
        >
          Browse products
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/dashboard/get-healthy"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/35"
        >
          Find a doctor
        </Link>
        <Link
          href="/dashboard/diagnose"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/35"
        >
          Explore tests
        </Link>
      </div>
    </div>
  );
}
