"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Stethoscope, User, Wallet, X } from "lucide-react";
import { useEffect, useMemo } from "react";

import { partnerReportsFor, type PartnerReport } from "@/lib/onboarding/reports";
import type { Application } from "@/lib/onboarding/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ReportsDrawer({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) {
  const summary = useMemo(() => (app ? partnerReportsFor(app) : null), [app]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (app) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [app, onClose]);

  const isLab = app?.kind === "lab";

  return (
    <AnimatePresence>
      {app && summary && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0f3a26]/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[680px] flex-col bg-[#fbfdfb] shadow-[-30px_0_80px_-30px_rgba(0,30,18,0.4)]"
            role="dialog"
            aria-label="Partner reports"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#0f3a26]/8 px-7 py-5">
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
                  {isLab ? "Reports & settlement" : "Consultations & earnings"}
                </p>
                <h2 className="mt-1 truncate text-[19px] font-bold tracking-tight text-[#0f3a26]">
                  {app.displayName}
                </h2>
                <p className="text-[12px] text-[#0f3a26]/55">
                  {app.reference} · {summary.reports.length} {summary.unit}
                  {summary.reports.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5 hover:text-[#0f3a26]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Amount summary */}
            <div className="grid grid-cols-3 gap-px bg-[#0f3a26]/8 px-7 py-5">
              <SummaryTile label={summary.revenueLabel} value={`₹${summary.totalRevenue.toLocaleString()}`} accent />
              <SummaryTile label="Settled" value={`₹${summary.settledAmount.toLocaleString()}`} />
              <SummaryTile label="Pending payout" value={`₹${summary.pendingAmount.toLocaleString()}`} warn={summary.pendingAmount > 0} />
            </div>

            {/* Reports list */}
            <div className="no-scrollbar flex-1 overflow-y-auto px-7 py-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
                  {isLab ? "Reports" : "Consultations"}
                </h3>
                <span className="text-[11px] text-[#0f3a26]/45">
                  {summary.completedCount} {isLab ? "published" : "completed"}
                </span>
              </div>
              <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
                {summary.reports.map((r, i) => (
                  <li
                    key={r.id}
                    className={`flex items-center gap-4 px-5 py-3.5 ${
                      i === summary.reports.length - 1 ? "" : "border-b border-[#0f3a26]/6"
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
                      {isLab ? <FileText className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{r.title}</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-[#0f3a26]/55">
                        <User className="h-3 w-3" />
                        {r.patient}
                        <span className="text-[#0f3a26]/30">·</span>
                        {r.detail}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-[11.5px] text-[#0f3a26]/55">
                        {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      <ReportStatus label={r.statusLabel} tone={r.statusTone} />
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold tabular-nums text-[#0f3a26]">₹{r.amount.toLocaleString()}</p>
                      <p className={`text-[10px] font-semibold ${r.settled ? "text-[#006E42]" : "text-[#9c7426]"}`}>
                        {r.settled ? "Settled" : "Pending"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#006E42]/[0.04] p-4 text-[11.5px] text-[#0f3a26]/65 ring-1 ring-inset ring-[#006E42]/15">
                <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006E42]" />
                <p>
                  Payouts are reconciled per the {isLab ? "lab" : "clinician"}&apos;s settlement
                  cycle. Figures shown are revenue routed through SuppAI.
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SummaryTile({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="bg-[#fbfdfb] px-4 py-1 text-center first:text-left last:text-right">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">{label}</p>
      <p className={`mt-1 text-[18px] font-bold tabular-nums ${accent ? "text-[#006E42]" : warn ? "text-[#9c7426]" : "text-[#0f3a26]"}`}>
        {value}
      </p>
    </div>
  );
}

function ReportStatus({ label, tone }: { label: string; tone: PartnerReport["statusTone"] }) {
  const fg = tone === "good" ? "text-[#006E42]" : tone === "info" ? "text-[#2a578f]" : "text-[#0f3a26]/45";
  return <p className={`text-[10px] font-semibold ${fg}`}>{label}</p>;
}
