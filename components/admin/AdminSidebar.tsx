"use client";

import {
  Beaker,
  CalendarCheck2,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Newspaper,
  Package,
  Stethoscope,
  Store,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BrandMark } from "@/components/shell/BrandMark";
import { signOut, useAdminSession } from "@/lib/admin/auth";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (path: string) => boolean;
};

const items: Item[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/blogs",
    label: "Blog posts",
    icon: Newspaper,
    match: (p) => p.startsWith("/admin/blogs"),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    match: (p) => p.startsWith("/admin/products"),
  },
  {
    href: "/admin/meals",
    label: "Meals",
    icon: UtensilsCrossed,
    match: (p) => p.startsWith("/admin/meals"),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ClipboardList,
    match: (p) => p.startsWith("/admin/orders"),
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: CalendarCheck2,
    match: (p) => p.startsWith("/admin/bookings"),
  },
  {
    href: "/admin/users",
    label: "Members",
    icon: Users,
    match: (p) => p.startsWith("/admin/users"),
  },
  {
    href: "/admin/vendors",
    label: "Vendor catalogue",
    icon: Store,
    match: (p) => p === "/admin/vendors" || p.startsWith("/admin/vendors/"),
  },
  {
    href: "/admin/support",
    label: "Support",
    icon: LifeBuoy,
    match: (p) => p.startsWith("/admin/support"),
  },
];

const onboardingItems: Item[] = [
  {
    href: "/admin/onboarding/labs",
    label: "Labs",
    icon: Beaker,
    match: (p) => p.startsWith("/admin/onboarding/labs"),
  },
  {
    href: "/admin/onboarding/doctors",
    label: "Doctors",
    icon: Stethoscope,
    match: (p) => p.startsWith("/admin/onboarding/doctors"),
  },
  {
    href: "/admin/onboarding/vendors",
    label: "Vendors",
    icon: Store,
    match: (p) => p.startsWith("/admin/onboarding/vendors"),
  },
];

export function AdminSidebar() {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const { session } = useAdminSession();

  async function handleSignOut() {
    await signOut();
    router.push("/admin/login");
  }

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-[#9af2c4]/8 bg-[#0c1614] text-[#e6efe9]">
      <div className="flex items-center gap-3 px-5 py-5">
        <BrandMark variant="inverse" className="w-[52px]" />
        <span className="h-5 w-px bg-white/15" />
        <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#9af2c4]">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
                    isActive
                      ? "bg-[#006E42]/15 text-[#9af2c4]"
                      : "text-[#e6efe9]/70 hover:bg-white/[0.04] hover:text-[#e6efe9]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Onboarding group */}
        <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9af2c4]/55">
          Onboarding
        </p>
        <ul className="space-y-0.5">
          {onboardingItems.map((item) => {
            const isActive = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
                    isActive
                      ? "bg-[#006E42]/15 text-[#9af2c4]"
                      : "text-[#e6efe9]/70 hover:bg-white/[0.04] hover:text-[#e6efe9]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#9af2c4]/8 p-4">
        {session && (
          <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#006E42] text-[11px] font-semibold text-white">
              {session.user.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-[#e6efe9]">
                {session.user.name}
              </p>
              <p className="truncate text-[10.5px] uppercase tracking-[0.14em] text-[#9af2c4]/70">
                {session.user.role}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium text-[#e6efe9]/70 transition hover:bg-white/[0.04] hover:text-[#ffa3a3]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
