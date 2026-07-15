"use client";

import { Check, ChevronDown, Copy, Minus, X } from "lucide-react";
import { useState } from "react";

import type { SeoCheck, SeoReport } from "@/lib/admin/seo";

type Props = {
  report: SeoReport;
  jsonLd: object;
  title?: string;
};

export function SeoPanel({ report, jsonLd, title = "SEO health" }: Props) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const tone =
    report.score >= 80
      ? { ring: "ring-[#006E42]/35", bg: "bg-[#006E42]/10", fg: "text-[#006E42]" }
      : report.score >= 60
        ? { ring: "ring-[#c79a3d]/35", bg: "bg-[#c79a3d]/15", fg: "text-[#9c7426]" }
        : { ring: "ring-[#c14040]/35", bg: "bg-[#c14040]/10", fg: "text-[#c14040]" };

  async function copyJsonLd() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-[#0f3a26]/8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
            {title}
          </p>
          <p className="mt-1 text-[10.5px] text-[#0f3a26]/45">
            E-E-A-T &amp; schema readiness
          </p>
        </div>
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ring-1 ring-inset ${tone.bg} ${tone.ring}`}
        >
          <span className={`text-[15px] font-bold tabular-nums ${tone.fg}`}>
            {report.score}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {report.checks.map((c) => (
          <CheckRow key={c.id} check={c} />
        ))}
      </ul>

      {/* JSON-LD toggle */}
      <button
        type="button"
        onClick={() => setShowJson((v) => !v)}
        className="mt-4 flex w-full items-center justify-between rounded-lg bg-[#0f3a26]/[0.03] px-3 py-2 text-[11.5px] font-semibold text-[#0f3a26]/75 transition hover:bg-[#0f3a26]/[0.06]"
      >
        <span>JSON-LD structured data</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${showJson ? "rotate-180" : ""}`}
        />
      </button>

      {showJson && (
        <div className="mt-2 overflow-hidden rounded-lg bg-[#0c1614] text-[#e6efe9]">
          <div className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9af2c4]/75">
            <span>schema.org</span>
            <button
              type="button"
              onClick={copyJsonLd}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[10.5px] font-medium normal-case tracking-normal text-[#e6efe9]/85 transition hover:bg-white/10"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-h-[280px] overflow-auto px-3 py-2.5 font-mono text-[10.5px] leading-snug text-[#9af2c4]/85">
            {JSON.stringify(jsonLd, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function CheckRow({ check }: { check: SeoCheck }) {
  const { Icon, color } =
    check.status === "pass"
      ? { Icon: Check, color: "text-[#006E42] bg-[#006E42]/12" }
      : check.status === "warn"
        ? { Icon: Minus, color: "text-[#9c7426] bg-[#c79a3d]/18" }
        : { Icon: X, color: "text-[#c14040] bg-[#c14040]/12" };

  return (
    <li className="flex items-start gap-2.5 text-[11.5px]">
      <span
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${color}`}
      >
        <Icon className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#0f3a26]">{check.label}</p>
        {check.detail && (
          <p className="text-[10.5px] text-[#0f3a26]/55">{check.detail}</p>
        )}
      </div>
    </li>
  );
}
