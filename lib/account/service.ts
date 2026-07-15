"use client";

import { fetchOrders } from "@/lib/orders/service";
import type { OrderRecord } from "@/lib/orders/types";

/* ------------------------------ Profile ------------------------------ */

export type Profile = {
  name: string;
  email: string;
  phone: string;
  plan: string;
};

const LS_PROFILE = "suppai.account.profile";
const DELAY = 160;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

const DEFAULT_PROFILE: Profile = {
  name: "Jane Sharma",
  email: "jane.sharma@gmail.com",
  phone: "9876543210",
  plan: "Pro plan",
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function fetchProfile(): Promise<Profile> {
  return delay(readLocal(LS_PROFILE, DEFAULT_PROFILE));
}
export async function saveProfile(p: Profile): Promise<Profile> {
  writeLocal(LS_PROFILE, p);
  return delay(p, 220);
}

/* ------------------------------ Addresses ------------------------------ */

export type Address = {
  id: string;
  label: string;
  line: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

const LS_ADDR = "suppai.account.addresses";
const SEED_ADDR: Address[] = [
  { id: "addr-1", label: "Home", line: "8, 100ft Road, Indiranagar", city: "Bengaluru", pincode: "560038", isDefault: true },
  { id: "addr-2", label: "Office", line: "WeWork Galaxy, Residency Road", city: "Bengaluru", pincode: "560025", isDefault: false },
];

function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function fetchAddresses(): Promise<Address[]> {
  return delay(readLocal(LS_ADDR, SEED_ADDR));
}
export async function saveAddress(
  addr: Omit<Address, "id" | "isDefault"> & { id?: string },
): Promise<Address[]> {
  const list = readLocal(LS_ADDR, SEED_ADDR);
  let next: Address[];
  if (addr.id) {
    next = list.map((a) => (a.id === addr.id ? { ...a, ...addr, id: a.id } : a));
  } else {
    const created: Address = { ...addr, id: uid("addr"), isDefault: list.length === 0 };
    next = [...list, created];
  }
  writeLocal(LS_ADDR, next);
  return delay(next, 200);
}
export async function deleteAddress(id: string): Promise<Address[]> {
  let list = readLocal(LS_ADDR, SEED_ADDR).filter((a) => a.id !== id);
  if (list.length > 0 && !list.some((a) => a.isDefault)) {
    list = list.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }
  writeLocal(LS_ADDR, list);
  return delay(list, 160);
}
export async function setDefaultAddress(id: string): Promise<Address[]> {
  const list = readLocal(LS_ADDR, SEED_ADDR).map((a) => ({ ...a, isDefault: a.id === id }));
  writeLocal(LS_ADDR, list);
  return delay(list, 160);
}

/* ------------------------------ Wallet ------------------------------ */

export type WalletTxn = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  note: string;
  at: string;
};
export type Wallet = { balance: number; transactions: WalletTxn[] };

const LS_WALLET = "suppai.account.wallet";

function seedWallet(): Wallet {
  const now = Date.now();
  const day = 86400000;
  return {
    balance: 1250,
    transactions: [
      { id: "w1", type: "credit", amount: 500, note: "Cashback, order SA-ORD-4788", at: new Date(now - 2 * day).toISOString() },
      { id: "w2", type: "debit", amount: 250, note: "Applied to lab booking", at: new Date(now - 5 * day).toISOString() },
      { id: "w3", type: "credit", amount: 1000, note: "Added via UPI", at: new Date(now - 9 * day).toISOString() },
    ],
  };
}

export async function fetchWallet(): Promise<Wallet> {
  return delay(readLocal(LS_WALLET, seedWallet()));
}
export async function addMoney(amount: number): Promise<Wallet> {
  const w = readLocal(LS_WALLET, seedWallet());
  const next: Wallet = {
    balance: w.balance + amount,
    transactions: [
      { id: uid("w"), type: "credit", amount, note: "Added via UPI", at: new Date().toISOString() },
      ...w.transactions,
    ],
  };
  writeLocal(LS_WALLET, next);
  return delay(next, 260);
}

/* ------------------------------ Payment methods ------------------------------ */

export type PaymentMethod = {
  id: string;
  type: "upi" | "card";
  label: string;
  sub: string;
  lastUsed: boolean;
};

const LS_METHODS = "suppai.account.methods";
const SEED_METHODS: PaymentMethod[] = [
  { id: "m1", type: "upi", label: "jane@okhdfc", sub: "UPI", lastUsed: true },
  { id: "m2", type: "card", label: "Visa •• 4821", sub: "Expires 04/27", lastUsed: false },
  { id: "m3", type: "card", label: "Mastercard •• 1180", sub: "Expires 11/26", lastUsed: false },
];

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  return delay(readLocal(LS_METHODS, SEED_METHODS));
}
export async function setLastUsedMethod(id: string): Promise<PaymentMethod[]> {
  const list = readLocal(LS_METHODS, SEED_METHODS).map((m) => ({ ...m, lastUsed: m.id === id }));
  writeLocal(LS_METHODS, list);
  return delay(list, 140);
}

/* ------------------------------ Wallet offers ------------------------------ */

export type WalletOffer = {
  id: string;
  title: string;
  body: string;
  code: string;
  expiry?: string;
};

export const WALLET_OFFERS: WalletOffer[] = [
  { id: "o1", title: "5% back on ₹1,000+", body: "Add ₹1,000 or more and get instant wallet cashback.", code: "WALLET5" },
  { id: "o2", title: "₹100 consult credit", body: "Applied automatically on your next doctor booking.", code: "CARE100" },
];

export const MORE_WALLET_OFFERS: WalletOffer[] = [
  { id: "o3", title: "10% off your first lab test", body: "New lab bookings only, up to ₹300 off.", code: "LAB10", expiry: "Ends 31 Jul" },
  { id: "o4", title: "₹150 off supplements over ₹1,499", body: "Stack up on your monthly essentials and save.", code: "STACK150", expiry: "Ends 15 Jul" },
  { id: "o5", title: "Free delivery all month", body: "No minimum order on any product this month.", code: "FREESHIP", expiry: "Ends 31 Jul" },
  { id: "o6", title: "Refer a friend, both get ₹200", body: "Wallet credit lands once they place a first order.", code: "REFER200" },
];

/* ------------------------------ Payments ------------------------------ */

export type Payment = {
  id: string;
  reference: string;
  label: string;
  method: string;
  amount: number;
  at: string;
};

const METHODS = ["UPI", "Visa •• 4821", "Wallet", "Net banking"];

export async function fetchPayments(): Promise<Payment[]> {
  const orders = await fetchOrders();
  return orders.map((o, i) => ({
    id: `pay-${o.id}`,
    reference: o.reference,
    label: paymentLabel(o),
    method: METHODS[i % METHODS.length],
    amount: o.total,
    at: o.placedAt,
  }));
}

function paymentLabel(o: OrderRecord): string {
  switch (o.kind) {
    case "product":
      return o.lines.length > 1 ? `${o.lines[0].name} +${o.lines.length - 1}` : o.lines[0].name;
    case "test":
      return `Lab test, ${o.vendorName}`;
    case "consult":
      return `Consult, ${o.doctor.name}`;
    case "insurance":
      return `${o.insurer} health cover`;
  }
}

/* ------------------------------ Notifications ------------------------------ */

export type NotifType = "order" | "report" | "appointment" | "wallet" | "subscription";
export type Notification = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  at: string;
  read: boolean;
};

const LS_NOTIF = "suppai.account.notifications";

function seedNotifications(): Notification[] {
  const now = Date.now();
  const hr = 3600000;
  const day = 86400000;
  return [
    { id: "n1", type: "order", title: "Order shipped", body: "SA-ORD-4821 is on its way, arriving in 2 days.", at: new Date(now - 3 * hr).toISOString(), read: false },
    { id: "n2", type: "report", title: "Lab report ready", body: "Your Thyroid Profile report is available to download.", at: new Date(now - 8 * hr).toISOString(), read: false },
    { id: "n3", type: "appointment", title: "Appointment reminder", body: "Dr. Meera Nair, video consult in 2 days at 18:00.", at: new Date(now - 1 * day).toISOString(), read: false },
    { id: "n4", type: "wallet", title: "Wallet credited", body: "₹500 cashback added from order SA-ORD-4788.", at: new Date(now - 2 * day).toISOString(), read: true },
    { id: "n5", type: "subscription", title: "Subscription renewing", body: "Daily Multivitamin ships again in 2 days.", at: new Date(now - 4 * day).toISOString(), read: true },
  ];
}

export async function fetchNotifications(): Promise<Notification[]> {
  return delay(readLocal(LS_NOTIF, seedNotifications()));
}
export async function markNotificationRead(id: string): Promise<Notification[]> {
  const list = readLocal(LS_NOTIF, seedNotifications()).map((n) => (n.id === id ? { ...n, read: true } : n));
  writeLocal(LS_NOTIF, list);
  return delay(list, 80);
}
export async function markAllNotificationsRead(): Promise<Notification[]> {
  const list = readLocal(LS_NOTIF, seedNotifications()).map((n) => ({ ...n, read: true }));
  writeLocal(LS_NOTIF, list);
  return delay(list, 120);
}

/* ------------------------------ Helpers ------------------------------ */

export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
