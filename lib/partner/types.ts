/* Partner portals — doctors and labs. Separate from the SuppAI admin. */

import type { ConsultMode, Doctor } from "@/lib/consult/types";
import type { Patient, Schedule, TestPackage } from "@/lib/health-tests/types";

/* ------------------------ Sessions ------------------------ */

export type DoctorSession = {
  doctorId: string;
  username: string;
  issuedAt: string;
  expiresAt: string;
};

export type LabSession = {
  labId: string;
  labName: string;
  username: string;
  issuedAt: string;
  expiresAt: string;
};

export type VendorSession = {
  vendorId: string;
  vendorName: string;
  username: string;
  issuedAt: string;
  expiresAt: string;
};

/* ------------------------ Doctor portal ------------------------ */

export type TimeWindow = {
  /** "HH:MM" 24h */
  start: string;
  end: string;
};

export type Weekday =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type DoctorAvailability = {
  doctorId: string;
  /** Recurring weekly schedule — one entry per day in the practice week. */
  weekly: Record<Weekday, TimeWindow[]>;
  /** ISO dates (YYYY-MM-DD) explicitly blocked off (vacation, conferences). */
  blocked: string[];
  /** Optional reason message per blocked date — shown to patients. */
  leaveMessages?: Record<string, string>;
  /** Per-appointment slot duration in minutes. */
  slotMinutes: 15 | 20 | 30 | 45 | 60;
  /** Booking lead time required (hours). */
  noticeHours: number;
};

export type AppointmentStatus =
  | "upcoming"
  | "in-progress"
  | "completed"
  | "no-show"
  | "cancelled";

export type Appointment = {
  id: string;
  doctorId: string;
  patient: Patient;
  mode: ConsultMode;
  schedule: Schedule;
  fee: number;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
};

/* ------------------------ Lab portal ------------------------ */

export type LabOrderStatus =
  | "received"
  | "confirmed"
  | "sample-collected"
  | "in-lab"
  | "result-published"
  | "cancelled";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";
export type PaymentStatus = "paid" | "pending" | "refunded";

export type LabOrder = {
  id: string;
  labId: string;
  reference: string;
  pkg: TestPackage;
  patient: Patient;
  schedule: Schedule;
  homeCollection: boolean;
  collectionAddress?: string;
  phlebotomist?: string;
  fastingRequired: boolean;
  subtotal: number;
  collectionFee: number;
  discount: number;
  total: number;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    txnId: string;
  };
  /** Hours from order placed to result published (only when published). */
  turnaroundHours?: number;
  status: LabOrderStatus;
  createdAt: string;
  updatedAt: string;
};

/* ------------------------ Re-exports ------------------------ */

export type { Doctor, ConsultMode, Patient, Schedule, TestPackage };
