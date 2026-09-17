"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

/* Entry blocks and section headers shared by the merged hub pages
   (Plans & Bookings, Account & Support). A block leads with a real number,
   not a paragraph, and links through to the full page. */

export function ActivityBlock({
  href,
  icon: Icon,
  label,
  value,
  unit,
  detail,
  cta,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  unit: string;
  detail: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_2px_-1px_rgba(15,58,38,0.04),0_12px_28px_-20px_rgba(15,58,38,0.18)] ring-1 ring-[#006E42]/12 transition hover:ring-[#006E42]/30 sm:p-5"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#006E42]/10 text-[#006E42]">
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">
          {label}
        </p>
        {value === null ? (
          <span className="mt-1.5 block h-6 w-20 animate-pulse rounded bg-[#0f3a26]/8" />
        ) : (
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-[24px] font-bold leading-none tabular-nums text-[#0f3a26]">
              {value}
            </span>
            <span className="text-[12px] font-medium text-[#0f3a26]/50">{unit}</span>
          </p>
        )}
        <p className="mt-1 truncate text-[11.5px] text-[#0f3a26]/55">{detail}</p>
      </div>

      <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#006E42]">
        <span className="hidden sm:inline">{cta}</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** One section-header language for the whole page, matching the rest of the app. */
export function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006E42]/70">
        {label}
      </span>
      <span className="h-px flex-1 bg-[#0f3a26]/10" />
      <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">{title}</h2>
    </div>
  );
}

