"use client";

import type {
  Appointment,
  AppointmentStatus,
  DoctorAvailability,
  LabOrder,
  LabOrderStatus,
  PaymentMethod,
  PaymentStatus,
  Weekday,
} from "./types";

const LS_AVAILABILITY = "suppai.partner.availability";
const LS_APPOINTMENTS = "suppai.partner.appointments";
const LS_LAB_ORDERS = "suppai.partner.laborders.v2";

const DELAY = 180;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

/* ------------------------------ Storage ------------------------------ */

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function nowISO() {
  return new Date().toISOString();
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/* ------------------------------ Doctor seeds ------------------------------ */

const DEFAULT_WEEKLY: Record<Weekday, { start: string; end: string }[]> = {
  mon: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "19:00" }],
  tue: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "19:00" }],
  wed: [{ start: "09:00", end: "13:00" }],
  thu: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "19:00" }],
  fri: [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "19:00" }],
  sat: [{ start: "10:00", end: "14:00" }],
  sun: [],
};

function seedAvailability(doctorId: string): DoctorAvailability {
  return {
    doctorId,
    weekly: structuredClone(DEFAULT_WEEKLY),
    blocked: [],
    slotMinutes: 30,
    noticeHours: 4,
  };
}

const PATIENTS = [
  { fullName: "Rajesh Kumar", dob: "1982-03-14", gender: "male" as const, phone: "9123456789" },
  { fullName: "Priya Sharma", dob: "1990-08-22", gender: "female" as const, phone: "9876543210" },
  { fullName: "Anjali Iyer", dob: "1975-11-02", gender: "female" as const, phone: "9988776655" },
  { fullName: "Vikram Reddy", dob: "1988-06-30", gender: "male" as const, phone: "9012345678" },
  { fullName: "Sara Mathew", dob: "1995-01-17", gender: "female" as const, phone: "9999988888" },
  { fullName: "Karthik Iyer", dob: "1979-09-12", gender: "male" as const, phone: "9090909090" },
  { fullName: "Devika Rao", dob: "2001-04-05", gender: "female" as const, phone: "9123987654" },
];

const REASONS = [
  "Follow-up consultation",
  "Lipid profile review",
  "Persistent headache",
  "Sleep disturbance",
  "Annual checkup",
  "Medication review",
  "Lower back pain",
];

function seedAppointments(doctorId: string): Appointment[] {
  const out: Appointment[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    // Spread appointments across past 3 days through next 10 days.
    const offsetDays = i - 3;
    const date = new Date(now);
    date.setDate(now.getDate() + offsetDays);
    const dayISO = isoDate(date);
    const hour = 9 + (i % 8);
    const slotLabel = `${String(hour).padStart(2, "0")}:00 - ${String(hour).padStart(2, "0")}:30`;
    const patient = PATIENTS[i % PATIENTS.length];
    const status: AppointmentStatus =
      offsetDays < 0
        ? i % 5 === 0
          ? "no-show"
          : "completed"
        : offsetDays === 0
          ? "in-progress"
          : "upcoming";
    out.push({
      id: `apt-${doctorId}-${i}`,
      doctorId,
      patient,
      mode: i % 3 === 0 ? "in-clinic" : "video",
      schedule: {
        date: dayISO,
        slotId: `slot-${hour}-${i}`,
        slotLabel,
      },
      fee: 600 + (i % 4) * 100,
      reason: REASONS[i % REASONS.length],
      status,
      createdAt: new Date(now.getTime() - (10 - offsetDays) * 86400000).toISOString(),
    });
  }
  return out;
}

/* ------------------------------ Lab seeds ------------------------------ */

const TEST_PACKAGES = [
  { id: "tp-cbc", name: "Complete Blood Count (CBC)", parameterCount: 22, price: 449 },
  { id: "tp-fbp", name: "Full Body Panel", parameterCount: 84, price: 1499 },
  { id: "tp-lipid", name: "Lipid Profile", parameterCount: 9, price: 599 },
  { id: "tp-thyroid", name: "Thyroid Profile (TSH, T3, T4)", parameterCount: 5, price: 699 },
  { id: "tp-vitamin", name: "Vitamin D & B12", parameterCount: 6, price: 899 },
  { id: "tp-diabetes", name: "Diabetes screening (HbA1c)", parameterCount: 7, price: 599 },
  { id: "tp-hormone", name: "Female hormone panel", parameterCount: 11, price: 2299 },
];

const ADDRESSES = [
  "Indiranagar, Bengaluru",
  "Bandra West, Mumbai",
  "Koramangala, Bengaluru",
  "Sector 14, Gurugram",
  "Adyar, Chennai",
  "Salt Lake, Kolkata",
];

const PHLEBOTOMISTS = [
  "Suresh Patil",
  "Anita Das",
  "Ravi Menon",
  "Fatima Sheikh",
  "Joseph Thomas",
];

const PAYMENT_METHODS: PaymentMethod[] = ["upi", "card", "netbanking", "cod"];

function seedLabOrders(labId: string): LabOrder[] {
  const out: LabOrder[] = [];
  const now = new Date();
  for (let i = 0; i < 18; i++) {
    const offsetDays = i - 7;
    const date = new Date(now);
    date.setDate(now.getDate() + offsetDays);
    const dayISO = isoDate(date);
    const hour = 7 + (i % 6);
    const slotLabel = `${String(hour).padStart(2, "0")}:00 - ${String(hour).padStart(2, "0")}:30`;
    const pkg = TEST_PACKAGES[i % TEST_PACKAGES.length];
    const patient = PATIENTS[i % PATIENTS.length];
    const homeCollection = i % 3 !== 0;
    const collectionFee = homeCollection ? 100 : 0;
    const subtotal = pkg.price;
    const discount = i % 4 === 0 ? Math.round(subtotal * 0.1) : 0;
    const fastingRequired = i % 2 === 0;

    let status: LabOrderStatus;
    if (offsetDays < -3) status = "result-published";
    else if (offsetDays < -1) status = "in-lab";
    else if (offsetDays < 0) status = "sample-collected";
    else if (offsetDays === 0) status = "confirmed";
    else status = "received";
    if (i % 11 === 0) status = "cancelled";

    const method = PAYMENT_METHODS[i % PAYMENT_METHODS.length];
    const payStatus: PaymentStatus =
      status === "cancelled"
        ? "refunded"
        : method === "cod" && status === "received"
          ? "pending"
          : "paid";

    out.push({
      id: `lab-${labId}-${i}`,
      labId,
      reference: `SA-LAB-${String(i + 100).padStart(4, "0")}`,
      pkg: {
        id: pkg.id,
        name: pkg.name,
        tagline: "",
        category: "blood",
        parameterCount: pkg.parameterCount,
        fastingRequired,
        highlights: [],
        vendors: [],
      },
      patient,
      schedule: { date: dayISO, slotId: `slot-${hour}-${i}`, slotLabel },
      homeCollection,
      collectionAddress: homeCollection ? ADDRESSES[i % ADDRESSES.length] : undefined,
      phlebotomist: homeCollection
        ? PHLEBOTOMISTS[i % PHLEBOTOMISTS.length]
        : undefined,
      fastingRequired,
      subtotal,
      collectionFee,
      discount,
      total: subtotal + collectionFee - discount,
      payment: {
        method,
        status: payStatus,
        txnId: `TXN${String(48210 + i * 17).padStart(8, "0")}`,
      },
      turnaroundHours:
        status === "result-published" ? 18 + (i % 5) * 6 : undefined,
      status,
      createdAt: new Date(now.getTime() - (15 - offsetDays) * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - Math.max(0, 10 - offsetDays) * 86400000).toISOString(),
    });
  }
  return out;
}

/* ------------------------------ Doctor APIs ------------------------------ */

export async function fetchAvailability(
  doctorId: string,
): Promise<DoctorAvailability> {
  const all = read<Record<string, DoctorAvailability>>(LS_AVAILABILITY) ?? {};
  if (!all[doctorId]) {
    all[doctorId] = seedAvailability(doctorId);
    write(LS_AVAILABILITY, all);
  }
  return delay(all[doctorId]);
}

export async function saveAvailability(
  availability: DoctorAvailability,
): Promise<void> {
  const all = read<Record<string, DoctorAvailability>>(LS_AVAILABILITY) ?? {};
  all[availability.doctorId] = availability;
  write(LS_AVAILABILITY, all);
  return delay(undefined, 120);
}

export async function fetchAppointments(
  doctorId: string,
): Promise<Appointment[]> {
  const all = read<Record<string, Appointment[]>>(LS_APPOINTMENTS) ?? {};
  if (!all[doctorId]) {
    all[doctorId] = seedAppointments(doctorId);
    write(LS_APPOINTMENTS, all);
  }
  return delay(all[doctorId]);
}

export async function updateAppointmentStatus(
  doctorId: string,
  appointmentId: string,
  status: AppointmentStatus,
): Promise<void> {
  const all = read<Record<string, Appointment[]>>(LS_APPOINTMENTS) ?? {};
  const list = all[doctorId] ?? [];
  all[doctorId] = list.map((a) =>
    a.id === appointmentId ? { ...a, status } : a,
  );
  write(LS_APPOINTMENTS, all);
  return delay(undefined, 100);
}

/* ------------------------------ Lab APIs ------------------------------ */

export async function fetchLabOrders(labId: string): Promise<LabOrder[]> {
  const all = read<Record<string, LabOrder[]>>(LS_LAB_ORDERS) ?? {};
  if (!all[labId]) {
    all[labId] = seedLabOrders(labId);
    write(LS_LAB_ORDERS, all);
  }
  return delay(all[labId]);
}

export async function updateLabOrderStatus(
  labId: string,
  orderId: string,
  status: LabOrderStatus,
): Promise<void> {
  const all = read<Record<string, LabOrder[]>>(LS_LAB_ORDERS) ?? {};
  const list = all[labId] ?? [];
  all[labId] = list.map((o) =>
    o.id === orderId
      ? { ...o, status, updatedAt: nowISO() }
      : o,
  );
  write(LS_LAB_ORDERS, all);
  return delay(undefined, 100);
}

/* ------------------------------ Helpers ------------------------------ */

export const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

export const LAB_STATUS_ORDER: LabOrderStatus[] = [
  "received",
  "confirmed",
  "sample-collected",
  "in-lab",
  "result-published",
];

export const LAB_STATUS_LABELS: Record<LabOrderStatus, string> = {
  received: "Received",
  confirmed: "Confirmed",
  "sample-collected": "Sample collected",
  "in-lab": "In lab",
  "result-published": "Result published",
  cancelled: "Cancelled",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  upcoming: "Upcoming",
  "in-progress": "In progress",
  completed: "Completed",
  "no-show": "No-show",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
  cod: "Cash on collection",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
};

/* Aggregated lab analytics for the Reports tab. */
export type LabAnalytics = {
  totalRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  refundedRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  avgTurnaroundHours: number | null;
  homeShare: number; // 0-100
  byMethod: { method: PaymentMethod; count: number; revenue: number }[];
  byMonth: { month: string; count: number; revenue: number }[];
  topTests: { name: string; count: number; revenue: number }[];
};

export function computeLabAnalytics(orders: LabOrder[]): LabAnalytics {
  let totalRevenue = 0;
  let collectedRevenue = 0;
  let pendingRevenue = 0;
  let refundedRevenue = 0;
  let orderCount = 0;
  let homeCount = 0;
  let turnaroundSum = 0;
  let turnaroundN = 0;

  const methodMap = new Map<PaymentMethod, { count: number; revenue: number }>();
  const monthMap = new Map<string, { count: number; revenue: number }>();
  const testMap = new Map<string, { count: number; revenue: number }>();

  for (const o of orders) {
    const payment = o.payment ?? {
      method: "upi" as const,
      status: "paid" as const,
      txnId: "",
    };
    if (payment.status === "refunded") {
      refundedRevenue += o.total;
      continue;
    }
    orderCount += 1;
    totalRevenue += o.total;
    if (payment.status === "paid") collectedRevenue += o.total;
    else pendingRevenue += o.total;
    if (o.homeCollection) homeCount += 1;
    if (o.turnaroundHours != null) {
      turnaroundSum += o.turnaroundHours;
      turnaroundN += 1;
    }

    const m = methodMap.get(payment.method) ?? { count: 0, revenue: 0 };
    m.count += 1;
    m.revenue += o.total;
    methodMap.set(payment.method, m);

    const key = o.schedule.date.slice(0, 7);
    const mo = monthMap.get(key) ?? { count: 0, revenue: 0 };
    mo.count += 1;
    mo.revenue += o.total;
    monthMap.set(key, mo);

    const t = testMap.get(o.pkg.name) ?? { count: 0, revenue: 0 };
    t.count += 1;
    t.revenue += o.total;
    testMap.set(o.pkg.name, t);
  }

  return {
    totalRevenue,
    collectedRevenue,
    pendingRevenue,
    refundedRevenue,
    orderCount,
    avgOrderValue: orderCount ? Math.round(totalRevenue / orderCount) : 0,
    avgTurnaroundHours: turnaroundN
      ? Math.round(turnaroundSum / turnaroundN)
      : null,
    homeShare: orderCount ? Math.round((homeCount / orderCount) * 100) : 0,
    byMethod: Array.from(methodMap.entries())
      .map(([method, v]) => ({ method, ...v }))
      .sort((a, b) => b.revenue - a.revenue),
    byMonth: Array.from(monthMap.entries())
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => b.month.localeCompare(a.month)),
    topTests: Array.from(testMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
  };
}
