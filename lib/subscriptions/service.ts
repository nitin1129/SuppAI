"use client";

export type SubStatus = "active" | "paused" | "cancelled";

export type Subscription = {
  id: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  categoryId: string;
  unitPrice: number;
  frequencyWeeks: number;
  status: SubStatus;
  nextDelivery: string; // ISO date
  skipNext: boolean;
  deliveredCount: number;
  createdAt: string;
};

export const FREQUENCY_OPTIONS: { weeks: number; label: string }[] = [
  { weeks: 1, label: "Weekly" },
  { weeks: 2, label: "Every 2 weeks" },
  { weeks: 4, label: "Monthly" },
  { weeks: 8, label: "Every 2 months" },
  { weeks: 12, label: "Every 3 months" },
];

export function frequencyLabel(weeks: number): string {
  return FREQUENCY_OPTIONS.find((f) => f.weeks === weeks)?.label ?? `Every ${weeks} weeks`;
}

const LS_KEY = "suppai.subscriptions.v1";
const DELAY = 160;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

function read(): Subscription[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Subscription[]) : seed();
  } catch {
    return [];
  }
}
function writeAll(list: Subscription[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
function addWeeks(iso: string, weeks: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  return delay(read().filter((s) => s.status !== "cancelled"));
}

function mutate(id: string, fn: (s: Subscription) => Subscription): Promise<Subscription | null> {
  const list = read();
  let updated: Subscription | null = null;
  const next = list.map((s) => {
    if (s.id !== id) return s;
    updated = fn(s);
    return updated;
  });
  writeAll(next);
  return delay(updated, 200);
}

export function pauseSub(id: string) {
  return mutate(id, (s) => ({ ...s, status: "paused" }));
}
export function resumeSub(id: string) {
  return mutate(id, (s) => ({
    ...s,
    status: "active",
    nextDelivery: s.nextDelivery < new Date().toISOString().slice(0, 10)
      ? addWeeks(new Date().toISOString(), 1)
      : s.nextDelivery,
  }));
}
export function skipNext(id: string) {
  return mutate(id, (s) => ({
    ...s,
    nextDelivery: addWeeks(s.nextDelivery, s.frequencyWeeks),
    skipNext: false,
  }));
}
export function changeFrequency(id: string, weeks: number) {
  return mutate(id, (s) => ({
    ...s,
    frequencyWeeks: weeks,
    nextDelivery: addWeeks(new Date().toISOString(), weeks),
  }));
}
export function cancelSub(id: string) {
  return mutate(id, (s) => ({ ...s, status: "cancelled" }));
}

/* ----------------------------- Seed ----------------------------- */

function seed(): Subscription[] {
  const now = Date.now();
  const day = 86400000;
  const subs: Subscription[] = [
    {
      id: "sub-1",
      productId: "o1",
      name: "Omega-3 Fish Oil",
      brand: "WOW Life",
      image: "https://picsum.photos/seed/o1/720/540",
      categoryId: "omega",
      unitPrice: 499,
      frequencyWeeks: 4,
      status: "active",
      nextDelivery: new Date(now + 5 * day).toISOString().slice(0, 10),
      skipNext: false,
      deliveredCount: 3,
      createdAt: new Date(now - 90 * day).toISOString(),
    },
    {
      id: "sub-2",
      productId: "v1",
      name: "Daily Multivitamin",
      brand: "Carbamide Forte",
      image: "https://picsum.photos/seed/v1/720/540",
      categoryId: "vitamins",
      unitPrice: 424,
      frequencyWeeks: 2,
      status: "active",
      nextDelivery: new Date(now + 2 * day).toISOString().slice(0, 10),
      skipNext: false,
      deliveredCount: 6,
      createdAt: new Date(now - 84 * day).toISOString(),
    },
    {
      id: "sub-3",
      productId: "p1",
      name: "Whey Protein Isolate 1 kg",
      brand: "MuscleBlaze",
      image: "https://picsum.photos/seed/p1/720/540",
      categoryId: "performance",
      unitPrice: 2464,
      frequencyWeeks: 4,
      status: "paused",
      nextDelivery: new Date(now + 12 * day).toISOString().slice(0, 10),
      skipNext: false,
      deliveredCount: 2,
      createdAt: new Date(now - 60 * day).toISOString(),
    },
  ];
  writeAll(subs);
  return subs;
}
