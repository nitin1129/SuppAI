"use client";

import { CheckCircle2, Printer, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/shell/BrandMark";
import { fetchOrder } from "@/lib/orders/service";
import type { OrderRecord, TestOrder } from "@/lib/orders/types";

/* Clean, printable lab report. Opened in a new tab; browser print -> PDF. */
export default function TestReportPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRecord | null | undefined>(undefined);

  useEffect(() => {
    if (params?.id) fetchOrder(params.id).then((o) => setOrder(o));
  }, [params?.id]);

  const rows = useMemo(() => {
    if (!order || order.kind !== "test") return [];
    return buildParameters(order as TestOrder);
  }, [order]);

  const flagged = rows.filter((r) => r.flag !== "Normal");

  if (order === undefined) {
    return <div className="grid min-h-screen place-items-center text-[#0f3a26]/50">Loading report…</div>;
  }
  if (!order || order.kind !== "test") {
    return <div className="grid min-h-screen place-items-center text-[#0f3a26]/50">Report not found.</div>;
  }
  const test = order as TestOrder;

  return (
    <div className="min-h-screen bg-[#eef3ef] py-8 text-[#0f3a26] print:bg-white print:py-0">
      {/* Toolbar (hidden on print) */}
      <div className="mx-auto mb-5 flex max-w-[820px] items-center justify-between px-6 print:hidden">
        <p className="text-[12px] text-[#0f3a26]/55">Lab report · {test.reference}</p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / Save as PDF
        </button>
      </div>

      {/* Sheet */}
      <article className="mx-auto max-w-[820px] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#0f3a26]/8 print:rounded-none print:shadow-none print:ring-0">
        {/* Masthead */}
        <div className="flex items-start justify-between bg-[#006E42] px-10 py-6 text-white print:bg-[#006E42]">
          <div>
            <BrandMark variant="inverse" className="w-[64px]" />
            <p className="mt-2.5 text-[11px] text-white/75">Diagnostic report, powered by {test.vendorName}</p>
          </div>
          <div className="text-right text-[11px] text-white/75">
            <p className="text-[14px] font-bold text-white tabular-nums">{test.reference}</p>
            <p className="mt-0.5">Collected {formatDate(test.schedule.date)}</p>
            <p>Reported {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        <div className="px-10 py-8">
          {/* Patient band */}
          <section className="grid grid-cols-2 gap-x-8 gap-y-4 border-b border-[#0f3a26]/10 pb-6 text-[12px] sm:grid-cols-4">
            <Field label="Patient" value={test.patient.fullName} />
            <Field label="Gender / Age" value={`${cap(test.patient.gender)} · ${ageFrom(test.patient.dob)}`} />
            <Field label="Panel" value={test.tests.map((t) => t.name).join(", ")} />
            <Field label="Parameters" value={String(rows.length)} />
          </section>

          {/* Results summary */}
          <section className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0f3a26]/10 py-5">
            <div className="flex items-center gap-3">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  flagged.length === 0 ? "bg-[#006E42]/10 text-[#006E42]" : "bg-[#c14040]/10 text-[#c14040]"
                }`}
              >
                {flagged.length === 0 ? <CheckCircle2 className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-[14px] font-bold text-[#0f3a26]">
                  {flagged.length === 0
                    ? "All parameters within range"
                    : `${flagged.length} parameter${flagged.length === 1 ? "" : "s"} need attention`}
                </p>
                <p className="text-[11.5px] text-[#0f3a26]/55">
                  {flagged.length === 0
                    ? "No abnormal values detected in this panel."
                    : "Review the flagged rows below with your physician."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Stat label="Normal" value={rows.length - flagged.length} tone="good" />
              <Stat label="Flagged" value={flagged.length} tone={flagged.length ? "bad" : "muted"} />
            </div>
          </section>

          {/* Table */}
          <section className="pt-5">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-[#0f3a26]/15 text-left text-[10.5px] uppercase tracking-[0.1em] text-[#0f3a26]/50">
                  <th className="py-2 font-semibold">Parameter</th>
                  <th className="py-2 font-semibold">Result</th>
                  <th className="py-2 font-semibold">Unit</th>
                  <th className="py-2 font-semibold">Reference range</th>
                  <th className="py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const abn = r.flag !== "Normal";
                  return (
                    <tr key={r.name} className={`border-b border-[#0f3a26]/6 ${abn ? "bg-[#c14040]/[0.03]" : ""}`}>
                      <td className="py-2.5 font-medium text-[#0f3a26]">{r.name}</td>
                      <td className={`py-2.5 font-bold tabular-nums ${abn ? "text-[#c14040]" : "text-[#0f3a26]"}`}>{r.result}</td>
                      <td className="py-2.5 text-[#0f3a26]/60">{r.unit}</td>
                      <td className="py-2.5 tabular-nums text-[#0f3a26]/60">{r.range}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            r.flag === "Normal"
                              ? "bg-[#006E42]/10 text-[#006E42]"
                              : "bg-[#c14040]/10 text-[#c14040]"
                          }`}
                        >
                          {r.flag === "Normal" ? "Normal" : r.flag === "High" ? "High ↑" : "Low ↓"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Signature */}
          <section className="mt-8 flex items-end justify-between gap-6">
            <p className="max-w-md text-[10.5px] leading-relaxed text-[#0f3a26]/50">
              This is a system-generated demonstration report routed through SuppAI. Results are indicative and should be interpreted by a qualified physician. Not for medico-legal use.
            </p>
            <div className="text-right">
              <div className="mb-1 ml-auto h-8 w-40 border-b border-[#0f3a26]/25" />
              <p className="text-[11.5px] font-semibold text-[#0f3a26]">Dr. S. Raghavan, MD (Pathology)</p>
              <p className="text-[10.5px] text-[#0f3a26]/55">Consultant Pathologist · Reg. 44120</p>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">{label}</p>
      <p className="mt-0.5 font-medium text-[#0f3a26]">{value}</p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "good" | "bad" | "muted" }) {
  const fg = tone === "good" ? "text-[#006E42]" : tone === "bad" ? "text-[#c14040]" : "text-[#0f3a26]/45";
  return (
    <div className="text-center">
      <p className={`text-[20px] font-bold leading-none tabular-nums ${fg}`}>{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">{label}</p>
    </div>
  );
}

type ParamRow = { name: string; result: string; unit: string; range: string; flag: "Normal" | "High" | "Low" };

const PARAM_BANK: { name: string; unit: string; low: number; high: number }[] = [
  { name: "Haemoglobin", unit: "g/dL", low: 12, high: 16 },
  { name: "Total Cholesterol", unit: "mg/dL", low: 125, high: 200 },
  { name: "HDL Cholesterol", unit: "mg/dL", low: 40, high: 60 },
  { name: "Triglycerides", unit: "mg/dL", low: 50, high: 150 },
  { name: "TSH", unit: "µIU/mL", low: 0.4, high: 4.0 },
  { name: "Vitamin D (25-OH)", unit: "ng/mL", low: 30, high: 100 },
  { name: "Vitamin B12", unit: "pg/mL", low: 200, high: 900 },
  { name: "HbA1c", unit: "%", low: 4, high: 5.6 },
  { name: "Fasting Glucose", unit: "mg/dL", low: 70, high: 100 },
  { name: "Serum Creatinine", unit: "mg/dL", low: 0.6, high: 1.2 },
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function buildParameters(order: TestOrder): ParamRow[] {
  const total = Math.min(10, Math.max(6, order.tests.reduce((s, t) => s + Math.min(4, t.parameterCount), 0)));
  const rows: ParamRow[] = [];
  for (let i = 0; i < total; i++) {
    const p = PARAM_BANK[i % PARAM_BANK.length];
    const seed = hash(order.id + p.name);
    const span = p.high - p.low;
    const roll = seed % 100;
    let value: number;
    let flag: ParamRow["flag"] = "Normal";
    if (roll < 12) {
      value = p.low - span * 0.15;
      flag = "Low";
    } else if (roll < 22) {
      value = p.high + span * 0.2;
      flag = "High";
    } else {
      value = p.low + (span * (seed % 80)) / 100;
    }
    const dp = p.high < 10 ? 1 : 0;
    rows.push({ name: p.name, result: value.toFixed(dp), unit: p.unit, range: `${p.low}–${p.high}`, flag });
  }
  return rows;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
function ageFrom(dob: string) {
  try {
    const y = (Date.now() - new Date(dob).getTime()) / (365.25 * 864e5);
    return `${Math.floor(y)} yrs`;
  } catch {
    return "";
  }
}
