"use client";

import { Heart, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { NotificationsMenu } from "@/components/shell/NotificationsMenu";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/cart/WishlistContext";

type Props = {
  title: string;
  subtitle?: string;
  user?: { name: string; initials: string; plan?: string };
};

export function Topbar({
  title,
  subtitle,
  user = { name: "Jane Sharma", initials: "JS", plan: "Pro plan" },
}: Props) {
  const { totals, hydrated: cartHydrated } = useCart();
  const { items: wishItems, hydrated: wishHydrated } = useWishlist();
  const cartCount = cartHydrated ? totals.itemCount : 0;
  const wishCount = wishHydrated ? wishItems.length : 0;

  return (
    <header className="sticky top-0 z-30 bg-[#f6faf7]/85 backdrop-blur-xl">
      <div className="flex items-center justify-between px-10 py-5">
        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-semibold tracking-tight text-[#0f3a26]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-[12.5px] text-[#0f3a26]/55">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#006E42]/12 transition focus-within:ring-[#006E42]/40 md:flex md:w-64">
            <Search className="h-4 w-4 text-[#0f3a26]/40" />
            <input
              placeholder="Search anything"
              className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
            />
          </div>

          <IconButton
            href="/dashboard/wishlist"
            label="Wishlist"
            icon={Heart}
            count={wishCount}
          />
          <IconButton
            href="/dashboard/cart"
            label="Cart"
            icon={ShoppingBag}
            count={cartCount}
          />

          <NotificationsMenu />

          <Link
            href="/dashboard/account"
            className="flex items-center gap-2.5 rounded-xl bg-white py-1.5 pl-1.5 pr-3.5 ring-1 ring-[#006E42]/12 transition hover:ring-[#006E42]/25"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#006E42] text-[12.5px] font-semibold text-white">
              {user.initials}
            </span>
            <div className="hidden text-left lg:block">
              <p className="text-[12.5px] font-semibold leading-tight text-[#0f3a26]">
                {user.name}
              </p>
              {user.plan && (
                <p className="text-[10.5px] text-[#0f3a26]/50">{user.plan}</p>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  href,
  label,
  icon: Icon,
  count,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-label={`${label}${count ? ` (${count})` : ""}`}
      className="relative grid h-10 w-10 place-items-center rounded-xl bg-white text-[#0f3a26]/65 ring-1 ring-[#006E42]/12 transition hover:text-[#006E42]"
    >
      <Icon className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#006E42] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#f6faf7] tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
