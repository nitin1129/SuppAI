"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import type { Section } from "@/lib/dashboard-data";

/* Short labels: the bar gives each tab about 48px, so titles are trimmed. */
const SHORT: Record<string, string> = {
  "get-healthy": "Get Healthy",
  diagnose: "Diagnose",
  shop: "Shop",
  plans: "Plans",
  track: "Track",
  account: "Account",
  support: "Support",
};

/** Bottom tab bar, phones only. Get Healthy sits in the middle as a raised
    green heart, the rest are icon + name either side of it. */
export function MobileNav({ sections, active }: { sections: Section[]; active: string }) {
  const visible = sections.filter((s) => !s.navHidden);
  const centre = visible.find((s) => s.id === "get-healthy");
  const rest = visible.filter((s) => s.id !== "get-healthy");
  const half = Math.ceil(rest.length / 2);
  const left = rest.slice(0, half);
  const right = rest.slice(half);

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#0f3a26]/8 bg-white/95 shadow-[0_-10px_28px_-14px_rgba(15,58,38,0.22)] backdrop-blur-xl md:hidden"
    >
      {/* Left and right groups each take half the bar, so the heart stays centred
          even when the two sides hold a different number of tabs. */}
      <div
        className="mx-auto flex max-w-lg items-end px-1 pt-1.5"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-1 justify-around">
          {left.map((s) => <Tab key={s.id} s={s} active={s.id === active} />)}
        </div>

        {centre && (
          <Link
            href={centre.href}
            aria-current={active === centre.id ? "page" : undefined}
            className="flex shrink-0 flex-col items-center gap-1 px-2.5"
          >
            <span
              className={`-mt-7 grid h-[54px] w-[54px] place-items-center rounded-full text-white ring-4 ring-white transition ${
                active === centre.id
                  ? "bg-[#006E42] shadow-[0_12px_24px_-8px_rgba(0,110,66,0.7)]"
                  : "bg-[#0a8551] shadow-[0_10px_20px_-10px_rgba(0,110,66,0.55)]"
              }`}
            >
              <Heart className="h-[23px] w-[23px]" fill="currentColor" />
            </span>
            <span className="whitespace-nowrap text-[9px] font-bold leading-none tracking-tight text-[#006E42]">
              {SHORT["get-healthy"]}
            </span>
          </Link>
        )}

        <div className="flex flex-1 justify-around">
          {right.map((s) => <Tab key={s.id} s={s} active={s.id === active} />)}
        </div>
      </div>
    </nav>
  );
}

function Tab({ s, active }: { s: Section; active: boolean }) {
  const Icon = s.icon;
  return (
    <Link
      href={s.href}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-0.5 py-2 transition ${
        active ? "text-[#006E42]" : "text-[#0f3a26]/55"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.4 : 2} />
      <span className="w-full truncate text-center text-[9px] font-semibold leading-none tracking-tight">
        {SHORT[s.id] ?? s.title}
      </span>
    </Link>
  );
}
