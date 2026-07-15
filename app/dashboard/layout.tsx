"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  BookingProvider,
  useBooking,
} from "@/components/dashboard/booking/BookingContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Footer } from "@/components/shell/Footer";
import { Topbar } from "@/components/shell/Topbar";
import { sections } from "@/lib/dashboard-data";
import { CartProvider } from "@/lib/cart/CartContext";
import { WishlistProvider } from "@/lib/cart/WishlistContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <WishlistProvider>
        <CartProvider>
          <Shell>{children}</Shell>
        </CartProvider>
      </WishlistProvider>
    </BookingProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { navigateTo, consumeNavigation } = useBooking();

  // Bookings that request a section navigation (e.g. checkout -> plans)
  useEffect(() => {
    if (navigateTo) {
      const target =
        navigateTo === "overview" ? "/dashboard" : `/dashboard/${navigateTo}`;
      router.push(target);
      consumeNavigation();
    }
  }, [navigateTo, consumeNavigation, router]);

  const activeId =
    pathname === "/dashboard"
      ? "get-healthy"
      : pathname.replace("/dashboard/", "").split("/")[0];

  const active = sections.find((s) => s.id === activeId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6faf7]">
      <Sidebar sections={sections} active={activeId} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          title={active?.title ?? "Dashboard"}
          subtitle={
            active?.blurb ?? ""
          }
        />
        <main className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
