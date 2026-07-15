import type { Doctor, ConsultMode } from "@/lib/consult/types";
import type { Patient, Schedule, TestOrder } from "@/lib/health-tests/types";
import type { ProPlan } from "@/lib/plans/types";

export type ConsultOrder = {
  kind: "consult";
  reference: string;
  doctor: Doctor;
  mode: ConsultMode;
  patient: Patient;
  schedule: Schedule;
  fee: number;
  platformFee: number;
  total: number;
};

export type ProPlanOrder = {
  kind: "pro-plan";
  reference: string;
  plan: ProPlan;
  subtotal: number;
  gst: number;
  total: number;
};

export type PendingOrder = TestOrder | ConsultOrder | ProPlanOrder;

export type { TestOrder };
