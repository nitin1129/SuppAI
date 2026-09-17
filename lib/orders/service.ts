"use client";

import type { CartItem } from "@/lib/cart/types";

import type { Schedule } from "@/lib/health-tests/types";

import type {
  OrderRecord,
  ProductLine,
  ProductStatus,
  TestStatus,
} from "./types";

const LS_KEY = "suppai.orders.v5";
const DELAY = 180;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

function read(): OrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as OrderRecord[]) : seed();
  } catch {
    return [];
  }
}
function writeAll(list: OrderRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}
function ref(p: string) {
  return `SA-${p}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ----------------------------- Reads ----------------------------- */

export async function fetchOrders(): Promise<OrderRecord[]> {
  return delay(
    [...read()].sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
  );
}

export async function fetchOrder(id: string): Promise<OrderRecord | null> {
  return delay(read().find((o) => o.id === id) ?? null);
}

/* ----------------------------- Reschedule ----------------------------- */

/** Cutoff: rescheduling is allowed only until this many hours before the slot. */
export const RESCHEDULE_CUTOFF_HOURS = 8;

function slotStart(schedule: { date: string; slotLabel: string }): Date {
  const startStr = schedule.slotLabel.split(" - ")[0] ?? "00:00";
  const [h, m] = startStr.split(":").map((n) => parseInt(n, 10) || 0);
  const d = new Date(schedule.date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function hoursUntil(schedule: { date: string; slotLabel: string }): number {
  return (slotStart(schedule).getTime() - Date.now()) / 3_600_000;
}

export function canReschedule(schedule: { date: string; slotLabel: string }): boolean {
  return hoursUntil(schedule) > RESCHEDULE_CUTOFF_HOURS;
}

/** Update the schedule of a consult or test order. */
export async function rescheduleOrder(
  id: string,
  schedule: Schedule,
): Promise<OrderRecord | null> {
  const list = read();
  let updated: OrderRecord | null = null;
  const next = list.map((o) => {
    if (o.id !== id || (o.kind !== "consult" && o.kind !== "test")) return o;
    updated = { ...o, schedule };
    return updated;
  });
  writeAll(next);
  return delay(updated, 240);
}

/** Cancel or request return on a product order. */
export async function setProductResolution(
  id: string,
  resolution: "cancelled" | "return_requested",
): Promise<OrderRecord | null> {
  const list = read();
  let updated: OrderRecord | null = null;
  const next = list.map((o) => {
    if (o.id !== id || o.kind !== "product") return o;
    updated = { ...o, resolution };
    return updated;
  });
  writeAll(next);
  return delay(updated, 220);
}

/* ----------------------------- Create from cart ----------------------------- */

/** Turn the paid cart into persisted order/booking records. */
export function createOrdersFromCart(items: CartItem[]): OrderRecord[] {
  const now = new Date().toISOString();
  const created: OrderRecord[] = [];

  // Group products (one-time + subscription) into a single shipment.
  const products = items.filter(
    (i) => i.kind === "product-onetime" || i.kind === "product-subscription",
  );
  if (products.length > 0) {
    const lines: ProductLine[] = products.map((p) => {
      if (p.kind === "product-onetime") {
        return {
          name: p.name,
          brand: p.brand,
          image: p.image,
          qty: p.qty,
          price: p.unitPrice * p.qty,
        };
      }
      return {
        name: p.name,
        brand: p.brand,
        image: p.image,
        qty: 1,
        price: p.unitPrice,
        subscription: { frequencyWeeks: p.frequencyWeeks },
      };
    });
    created.push({
      id: uid("prod"),
      reference: ref("ORD"),
      kind: "product",
      placedAt: now,
      total: lines.reduce((s, l) => s + l.price, 0),
      lines,
      status: "placed",
      address: "Home, 8 100ft Road, Indiranagar, Bengaluru 560038",
      eta: new Date(Date.now() + 3 * 86400000).toISOString(),
    });
  }

  for (const item of items) {
    if (item.kind === "test") {
      created.push({
        id: uid("test"),
        reference: ref("LAB"),
        kind: "test",
        placedAt: now,
        total: item.subtotal + item.collectionFee,
        vendorName: item.vendorName,
        tests: item.tests.map((t) => ({
          id: t.id,
          name: t.name,
          parameterCount: t.parameterCount,
        })),
        patient: item.patient,
        schedule: item.schedule,
        status: "confirmed",
      });
    } else if (item.kind === "consult") {
      created.push({
        id: uid("consult"),
        reference: ref("DOC"),
        kind: "consult",
        placedAt: now,
        total: item.fee + item.platformFee,
        doctor: item.doctor,
        mode: item.mode,
        patient: item.patient,
        schedule: item.schedule,
        status: "upcoming",
      });
    } else if (item.kind === "insurance") {
      created.push({
        id: uid("ins"),
        reference: ref("INS"),
        kind: "insurance",
        placedAt: now,
        total: item.premium,
        policy: item.policy,
        insurer: item.insurer,
        cover: item.cover,
        termYears: item.termYears,
        members: item.members,
        status: "pending",
      });
    }
  }

  if (created.length > 0) writeAll([...created, ...read()]);
  return created;
}

/* ----------------------------- Seed ----------------------------- */

function seed(): OrderRecord[] {
  const now = Date.now();
  const day = 86400000;
  const patient = { fullName: "Jane Sharma", dob: "1992-05-14", gender: "female" as const, phone: "9876543210" };

  const orders: OrderRecord[] = [
    {
      id: "seed-prod-1",
      reference: "SA-ORD-4821",
      kind: "product",
      placedAt: new Date(now - 1 * day).toISOString(),
      total: 3398,
      status: "shipped",
      address: "Home, 8 100ft Road, Indiranagar, Bengaluru 560038",
      eta: new Date(now + 2 * day).toISOString(),
      lines: [
        { name: "Whey Protein Isolate 1 kg", brand: "MuscleBlaze", image: "https://picsum.photos/seed/p1/720/540", qty: 1, price: 2899 },
        { name: "Daily Multivitamin", brand: "Carbamide Forte", image: "https://picsum.photos/seed/v1/720/540", qty: 1, price: 499 },
      ],
    },
    {
      id: "seed-prod-2",
      reference: "SA-ORD-4788",
      kind: "product",
      placedAt: new Date(now - 6 * day).toISOString(),
      total: 998,
      status: "delivered",
      address: "Home, 8 100ft Road, Indiranagar, Bengaluru 560038",
      eta: new Date(now - 3 * day).toISOString(),
      lines: [
        { name: "Omega-3 Fish Oil", brand: "WOW Life", image: "https://picsum.photos/seed/o1/720/540", qty: 2, price: 998, subscription: { frequencyWeeks: 4 } },
      ],
    },
    {
      id: "seed-test-1",
      reference: "SA-LAB-3310",
      kind: "test",
      placedAt: new Date(now - 2 * day).toISOString(),
      total: 1599,
      status: "in_lab",
      vendorName: "Thyrocare",
      patient,
      schedule: { date: new Date(now - 1 * day).toISOString().slice(0, 10), slotId: "s1", slotLabel: "07:00 - 07:30" },
      tests: [{ id: "full-body-advanced", name: "Full Body Checkup, Advanced", parameterCount: 92 }],
    },
    {
      id: "seed-test-2",
      reference: "SA-LAB-3288",
      kind: "test",
      placedAt: new Date(now - 9 * day).toISOString(),
      total: 599,
      status: "result_published",
      vendorName: "Redcliffe Labs",
      patient,
      schedule: { date: new Date(now - 8 * day).toISOString().slice(0, 10), slotId: "s2", slotLabel: "08:00 - 08:30" },
      tests: [{ id: "thyroid", name: "Thyroid Profile (T3, T4, TSH)", parameterCount: 3 }],
    },
    {
      id: "seed-consult-1",
      reference: "SA-DOC-2201",
      kind: "consult",
      placedAt: new Date(now - 1 * day).toISOString(),
      total: 629,
      status: "upcoming",
      mode: "video",
      patient,
      schedule: { date: new Date(now + 2 * day).toISOString().slice(0, 10), slotId: "s3", slotLabel: "18:00 - 18:30" },
      doctor: {
        id: "doc-1", name: "Dr. Meera Nair", specialtyId: "endo", specialtyLabel: "Endocrinologist",
        qualifications: "MBBS, MD, DM", experienceYears: 14, rating: 4.8, reviewCount: 320,
        languages: ["English", "Hindi"], bio: "", fee: 600, clinic: "Apollo Clinic",
        modes: ["video", "in-clinic"], nextAvailable: "", reviews: [],
      },
    },
    {
      id: "seed-consult-5",
      reference: "SA-DOC-2214",
      kind: "consult",
      placedAt: new Date(now - 1 * day).toISOString(),
      total: 749,
      status: "upcoming",
      mode: "in-clinic",
      patient,
      schedule: { date: new Date(now + 5 * day).toISOString().slice(0, 10), slotId: "s5", slotLabel: "16:00 - 16:30" },
      doctor: {
        id: "doc-4", name: "Dr. Arjun Menon", specialtyId: "gastro", specialtyLabel: "Gastroenterologist",
        qualifications: "MBBS, MD, DM", experienceYears: 17, rating: 4.9, reviewCount: 412,
        languages: ["English", "Malayalam"], bio: "", fee: 700, clinic: "Fortis Heart Institute",
        modes: ["in-clinic", "video"], nextAvailable: "", reviews: [],
      },
    },
    {
      id: "seed-consult-2",
      reference: "SA-DOC-2180",
      kind: "consult",
      placedAt: new Date(now - 12 * day).toISOString(),
      total: 429,
      status: "completed",
      mode: "in-clinic",
      patient,
      schedule: { date: new Date(now - 10 * day).toISOString().slice(0, 10), slotId: "s4", slotLabel: "11:00 - 11:30" },
      doctor: {
        id: "doc-3", name: "Dr. Kavya Reddy", specialtyId: "derm", specialtyLabel: "Dermatologist",
        qualifications: "MBBS, MD", experienceYears: 9, rating: 4.6, reviewCount: 210,
        languages: ["English", "Telugu"], bio: "", fee: 400, clinic: "Skin & Care",
        modes: ["in-clinic"], nextAvailable: "", reviews: [],
      },
    },
    {
      id: "seed-ins-1",
      reference: "SA-INS-1120",
      kind: "insurance",
      placedAt: new Date(now - 4 * day).toISOString(),
      total: 18400,
      status: "active",
      insurer: "Star Health",
      cover: 1000000,
      termYears: 1,
      members: 3,
      policy: { id: "p1", insurer: "Star Health", cover: 1000000, termYears: 1, premium: 18400, features: ["Cashless at 14,000+ hospitals", "No room rent cap"] },
    },
    {
      id: "seed-ins-2",
      reference: "SA-INS-1098",
      kind: "insurance",
      placedAt: new Date(now - 1 * day).toISOString(),
      total: 12200,
      status: "pending",
      insurer: "HDFC Ergo",
      cover: 500000,
      termYears: 1,
      members: 2,
      policy: { id: "p2", insurer: "HDFC Ergo", cover: 500000, termYears: 1, premium: 12200, features: ["Cashless network", "Annual health check"] },
    },

    /* ---- more products ---- */
    {
      id: "seed-prod-3",
      reference: "SA-ORD-4902",
      kind: "product",
      placedAt: new Date(now).toISOString(),
      total: 1348,
      status: "placed",
      address: "Home, 8 100ft Road, Indiranagar, Bengaluru 560038",
      eta: new Date(now + 4 * day).toISOString(),
      lines: [
        { name: "Ashwagandha KSM-66", brand: "Himalaya", image: "https://picsum.photos/seed/a1/720/540", qty: 1, price: 549 },
        { name: "Magnesium Glycinate", brand: "Fast&Up", image: "https://picsum.photos/seed/m1/720/540", qty: 1, price: 799 },
      ],
    },
    {
      id: "seed-prod-4",
      reference: "SA-ORD-4855",
      kind: "product",
      placedAt: new Date(now - 3 * day).toISOString(),
      total: 2199,
      status: "out_for_delivery",
      address: "Office, WeWork Galaxy, Residency Road, Bengaluru 560025",
      eta: new Date(now).toISOString(),
      lines: [
        { name: "Plant Protein, Chocolate", brand: "Plix", image: "https://picsum.photos/seed/pp1/720/540", qty: 1, price: 1499 },
        { name: "Creatine Monohydrate", brand: "GNC", image: "https://picsum.photos/seed/cr1/720/540", qty: 1, price: 700 },
      ],
    },
    {
      id: "seed-prod-5",
      reference: "SA-ORD-4699",
      kind: "product",
      placedAt: new Date(now - 11 * day).toISOString(),
      total: 649,
      status: "packed",
      address: "Home, 8 100ft Road, Indiranagar, Bengaluru 560038",
      eta: new Date(now + 1 * day).toISOString(),
      lines: [
        { name: "Biotin + Collagen", brand: "OZiva", image: "https://picsum.photos/seed/bc1/720/540", qty: 1, price: 649 },
      ],
    },

    /* ---- more tests ---- */
    {
      id: "seed-test-3",
      reference: "SA-LAB-3402",
      kind: "test",
      placedAt: new Date(now).toISOString(),
      total: 899,
      status: "confirmed",
      vendorName: "Apollo Diagnostics",
      patient,
      schedule: { date: new Date(now + 1 * day).toISOString().slice(0, 10), slotId: "s5", slotLabel: "06:30 - 07:00" },
      tests: [{ id: "vitamin", name: "Vitamin Deficiency Panel", parameterCount: 6 }],
    },
    {
      id: "seed-test-4",
      reference: "SA-LAB-3350",
      kind: "test",
      placedAt: new Date(now - 3 * day).toISOString(),
      total: 599,
      status: "sample_collected",
      vendorName: "Healthians",
      patient,
      schedule: { date: new Date(now - 1 * day).toISOString().slice(0, 10), slotId: "s6", slotLabel: "07:30 - 08:00" },
      tests: [{ id: "diabetes", name: "Diabetes Care Panel", parameterCount: 5 }],
    },
    {
      id: "seed-test-5",
      reference: "SA-LAB-3120",
      kind: "test",
      placedAt: new Date(now - 15 * day).toISOString(),
      total: 449,
      status: "result_published",
      vendorName: "Dr. Lal PathLabs",
      patient,
      schedule: { date: new Date(now - 14 * day).toISOString().slice(0, 10), slotId: "s7", slotLabel: "08:30 - 09:00" },
      tests: [{ id: "cbc", name: "Complete Blood Count (CBC)", parameterCount: 28 }],
    },

    /* ---- more consults ---- */
    {
      id: "seed-consult-3",
      reference: "SA-DOC-2260",
      kind: "consult",
      placedAt: new Date(now).toISOString(),
      total: 529,
      status: "upcoming",
      mode: "in-clinic",
      patient,
      schedule: { date: new Date(now + 4 * day).toISOString().slice(0, 10), slotId: "s8", slotLabel: "10:00 - 10:30" },
      doctor: {
        id: "doc-5", name: "Dr. Rohan Kapoor", specialtyId: "cardio", specialtyLabel: "Cardiologist",
        qualifications: "MBBS, MD, DM", experienceYears: 16, rating: 4.9, reviewCount: 410,
        languages: ["English", "Hindi"], bio: "", fee: 500, clinic: "Heart Institute",
        modes: ["video", "in-clinic"], nextAvailable: "", reviews: [],
      },
    },
    {
      id: "seed-consult-4",
      reference: "SA-DOC-2140",
      kind: "consult",
      placedAt: new Date(now - 8 * day).toISOString(),
      total: 429,
      status: "cancelled",
      mode: "video",
      patient,
      schedule: { date: new Date(now - 6 * day).toISOString().slice(0, 10), slotId: "s9", slotLabel: "17:30 - 18:00" },
      doctor: {
        id: "doc-6", name: "Dr. Sara Thomas", specialtyId: "gen", specialtyLabel: "General Physician",
        qualifications: "MBBS, MD", experienceYears: 8, rating: 4.5, reviewCount: 180,
        languages: ["English", "Malayalam"], bio: "", fee: 400, clinic: "City Care",
        modes: ["video"], nextAvailable: "", reviews: [],
      },
    },

    /* ---- more insurance ---- */
    {
      id: "seed-ins-3",
      reference: "SA-INS-1150",
      kind: "insurance",
      placedAt: new Date(now - 15 * day).toISOString(),
      total: 9800,
      status: "active",
      insurer: "Niva Bupa",
      cover: 700000,
      termYears: 2,
      members: 1,
      policy: { id: "p3", insurer: "Niva Bupa", cover: 700000, termYears: 2, premium: 9800, features: ["Reinstatement benefit", "Health coach"] },
    },
  ];
  writeAll(orders);
  return orders;
}

/* ----------------------------- Helpers ----------------------------- */

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  placed: "Order placed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export const TEST_STATUS_LABEL: Record<TestStatus, string> = {
  confirmed: "Confirmed",
  sample_collected: "Sample collected",
  in_lab: "In lab",
  result_published: "Report ready",
};

export function relativeTime(iso: string): string {
  const target = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((t.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}

export function dayGroupLabel(iso: string): string {
  const rel = relativeTime(iso);
  if (rel === "Today" || rel === "Yesterday") return rel;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
