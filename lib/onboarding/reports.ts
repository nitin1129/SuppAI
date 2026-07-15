"use client";

import type { Application, PartnerKind } from "./types";

export type PartnerReport = {
  id: string;
  reference: string;
  patient: string;
  /** Test name (lab) or consultation type (doctor). */
  title: string;
  /** Mode/detail line: collection type or consult mode. */
  detail: string;
  date: string;
  statusLabel: string;
  statusTone: "good" | "info" | "muted";
  amount: number;
  settled: boolean;
};

export type ReportSummary = {
  reports: PartnerReport[];
  totalRevenue: number;
  settledAmount: number;
  pendingAmount: number;
  completedCount: number;
  /** Kind-aware copy. */
  unit: string; // "report" | "consultation"
  revenueLabel: string;
};

const PATIENTS = [
  "Rajesh Kumar", "Priya Sharma", "Anjali Iyer", "Vikram Reddy",
  "Sara Mathew", "Karthik Iyer", "Devika Rao", "Imran Khan",
  "Neha Gupta", "Arjun Nair", "Fatima Sheikh", "Rohit Verma",
];

const LAB_TESTS: { name: string; price: number }[] = [
  { name: "Full Body Checkup, Advanced", price: 1499 },
  { name: "Complete Blood Count (CBC)", price: 299 },
  { name: "Thyroid Profile (T3, T4, TSH)", price: 399 },
  { name: "Lipid Profile", price: 499 },
  { name: "Vitamin Deficiency Panel", price: 1099 },
  { name: "Diabetes Care Panel", price: 599 },
];

const CONSULT_TYPES: { name: string; price: number }[] = [
  { name: "New consultation", price: 700 },
  { name: "Follow-up consultation", price: 400 },
  { name: "Report review", price: 500 },
  { name: "Second opinion", price: 900 },
  { name: "Routine check-in", price: 600 },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function partnerReportsFor(app: Application): ReportSummary {
  const isLab = app.kind === "lab";
  const base = hash(app.id);
  const count = 8 + (base % 8);
  const now = Date.now();
  const day = 86400000;
  const reports: PartnerReport[] = [];

  for (let i = 0; i < count; i++) {
    const r = hash(app.id + ":" + i);
    const offset = (r % 28) + i;
    let title: string;
    let detail: string;
    let amount: number;
    let statusLabel: string;
    let statusTone: PartnerReport["statusTone"];

    if (isLab) {
      const test = LAB_TESTS[r % LAB_TESTS.length];
      const home = r % 3 !== 0;
      title = test.name;
      detail = home ? "Home collection" : "Walk-in";
      amount = test.price + (home ? 100 : 0);
      if (offset > 6) {
        statusLabel = "Published";
        statusTone = "good";
      } else if (offset > 2) {
        statusLabel = "In lab";
        statusTone = "info";
      } else {
        statusLabel = "Collected";
        statusTone = "muted";
      }
    } else {
      const c = CONSULT_TYPES[r % CONSULT_TYPES.length];
      const video = r % 2 === 0;
      title = c.name;
      detail = video ? "Video consult" : "In-clinic";
      amount = c.price;
      if (offset > 2) {
        statusLabel = "Completed";
        statusTone = "good";
      } else if (offset > 0) {
        statusLabel = "Upcoming";
        statusTone = "info";
      } else {
        statusLabel = "Today";
        statusTone = "muted";
      }
    }

    reports.push({
      id: `${app.id}-rep-${i}`,
      reference: `${isLab ? "SA-RPT" : "SA-CON"}-${String(2000 + (r % 8000)).padStart(4, "0")}`,
      patient: PATIENTS[r % PATIENTS.length],
      title,
      detail,
      date: new Date(now - offset * day).toISOString(),
      statusLabel,
      statusTone,
      amount,
      settled: offset > 14,
    });
  }
  reports.sort((a, b) => b.date.localeCompare(a.date));

  let totalRevenue = 0;
  let settledAmount = 0;
  let completedCount = 0;
  for (const r of reports) {
    totalRevenue += r.amount;
    if (r.settled) settledAmount += r.amount;
    if (r.statusTone === "good") completedCount += 1;
  }

  return {
    reports,
    totalRevenue,
    settledAmount,
    pendingAmount: totalRevenue - settledAmount,
    completedCount,
    unit: isLab ? "report" : "consultation",
    revenueLabel: isLab ? "Total revenue" : "Earnings",
  };
}

export type { PartnerKind };
