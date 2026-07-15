import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/shell/BrandMark";
import { Footer } from "@/components/shell/Footer";

export function PublicPage({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6faf7]">
      <header className="sticky top-0 z-30 border-b border-[#0f3a26]/8 bg-[#fbfdfb]/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
          <Link href="/dashboard" aria-label="SuppAI home"><BrandMark variant="compact" className="w-[58px]" /></Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/65 transition hover:text-[#006E42]">
            <ArrowLeft className="h-3.5 w-3.5" />Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:py-14">
        <h1 className="text-[28px] font-bold tracking-tight text-[#0f3a26] md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/55">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </main>

      <Footer />
    </div>
  );
}

/** Shared renderer for the policy / legal pages. */
export function LegalDoc({ updated, sections }: { updated: string; sections: { h: string; p: string }[] }) {
  return (
    <div className="space-y-6">
      <p className="inline-block rounded-lg bg-[#f1f7f3] px-3 py-1.5 text-[12px] font-medium text-[#0f3a26]/60 ring-1 ring-inset ring-[#0f3a26]/8">Last updated: {updated}</p>
      {sections.map((s, i) => (
        <section key={i}>
          <h2 className="text-[16.5px] font-bold tracking-tight text-[#0f3a26]">{s.h}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#0f3a26]/70">{s.p}</p>
        </section>
      ))}
    </div>
  );
}
