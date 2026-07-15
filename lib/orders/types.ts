import type { ConsultMode, Doctor } from "@/lib/consult/types";
import type { Patient, Schedule } from "@/lib/health-tests/types";
import type { PolicyOption } from "@/lib/plans/types";

/* Historical order / booking records shown on the Track & manage page. */

export type ProductStatus =
  | "placed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export type TestStatus =
  | "confirmed"
  | "sample_collected"
  | "in_lab"
  | "result_published";

export type ConsultStatus = "upcoming" | "completed" | "cancelled";
export type InsuranceStatus = "pending" | "active";

type Base = {
  id: string;
  reference: string;
  placedAt: string;
  total: number;
};

export type ProductLine = {
  name: string;
  brand: string;
  image: string;
  qty: number;
  price: number;
  subscription?: { frequencyWeeks: number };
};

export type ProductResolution = "cancelled" | "return_requested";

export type ProductOrder = Base & {
  kind: "product";
  lines: ProductLine[];
  status: ProductStatus;
  address: string;
  eta: string;
  resolution?: ProductResolution;
};

export type TestOrder = Base & {
  kind: "test";
  vendorName: string;
  tests: { id: string; name: string; parameterCount: number }[];
  patient: Patient;
  schedule: Schedule;
  status: TestStatus;
};

export type ConsultOrder = Base & {
  kind: "consult";
  doctor: Doctor;
  mode: ConsultMode;
  patient: Patient;
  schedule: Schedule;
  status: ConsultStatus;
};

export type InsuranceOrder = Base & {
  kind: "insurance";
  policy: PolicyOption;
  insurer: string;
  cover: number;
  termYears: 1 | 2 | 3;
  members: number;
  status: InsuranceStatus;
};

export type OrderRecord =
  | ProductOrder
  | TestOrder
  | ConsultOrder
  | InsuranceOrder;

export type OrderKind = OrderRecord["kind"];

/* ----------------------------- Timeline ----------------------------- */

export type TimelineStep = {
  key: string;
  label: string;
  state: "done" | "current" | "todo";
  at?: string;
};

export const PRODUCT_STEPS: { key: ProductStatus; label: string }[] = [
  { key: "placed", label: "Order placed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export const TEST_STEPS: { key: TestStatus; label: string }[] = [
  { key: "confirmed", label: "Booking confirmed" },
  { key: "sample_collected", label: "Sample collected" },
  { key: "in_lab", label: "Processing in lab" },
  { key: "result_published", label: "Report published" },
];

export function buildSteps<S extends string>(
  steps: { key: S; label: string }[],
  current: S,
  placedAt: string,
): TimelineStep[] {
  const idx = steps.findIndex((s) => s.key === current);
  const day = 86400000;
  const start = new Date(placedAt).getTime();
  return steps.map((s, i) => ({
    key: s.key,
    label: s.label,
    state: i < idx ? "done" : i === idx ? "current" : "todo",
    at: i <= idx ? new Date(start + i * day * 0.6).toISOString() : undefined,
  }));
}
