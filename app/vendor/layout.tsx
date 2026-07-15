"use client";

import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { BrandMark } from "@/components/shell/BrandMark";
import { useVendorSession, vendorSignOut } from "@/lib/partner/auth";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isLogin = pathname.startsWith("/vendor/login");
  const router = useRouter();
  const { session, hydrated } = useVendorSession();

  useEffect(() => {
    if (isLogin) return;
    if (hydrated && !session) router.replace("/vendor/login");
  }, [hydrated, session, isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (!hydrated || !session) return <div className="min-h-screen bg-[#f8fbf9]" />;

  async function handleSignOut() {
    await vendorSignOut();
    router.push("/vendor/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fbf9]">
      <header className="sticky top-0 z-30 border-b border-[#0f3a26]/8 bg-[#f8fbf9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <BrandMark variant="compact" className="w-[56px]" />
            <span className="h-6 w-px bg-[#0f3a26]/12" />
            <div>
              <p className="text-[12px] font-bold tracking-tight text-[#0f3a26]">Vendor portal</p>
              <p className="text-[10.5px] text-[#0f3a26]/55">{session.vendorName}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#0f3a26]/65 transition hover:bg-[#0f3a26]/5 hover:text-[#c14040]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
