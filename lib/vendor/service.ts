"use client";

/* Product-vendor portal data: catalogue, listing requests, orders, reports.
   Frontend-only, localStorage-backed. Shared with the admin review page. */

const DELAY = 160;
const delay = <T,>(v: T, ms = DELAY): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms));

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
function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}

export const VENDOR_CATEGORIES = [
  "Supplements",
  "Medicines / Pharma",
  "Medical devices",
  "Diagnostics",
  "Consumables",
  "Equipment",
  "Other",
];

export type StockStatus = "active" | "out_of_stock";
export type ListingStatus = "pending" | "listed" | "rejected" | "changes_requested";

export type VendorProduct = {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  brand: string;
  category: string;
  hsn?: string;
  coverImage: string;
  gallery: string[];
  description: string;
  longDescription: string;
  dosage?: string;
  ingredients: string[];
  tags: string[];
  mrp: number;
  supplyCost: number;
  price: number;
  discountPct: number;
  gstPct: number;
  moq: number;
  leadTimeDays: number;
  stockQty: number;
  stock: StockStatus;
  listing: ListingStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type NewListing = {
  name: string;
  brand: string;
  category: string;
  hsn?: string;
  coverImage: string;
  gallery: string[];
  description: string;
  longDescription: string;
  dosage?: string;
  ingredients: string[];
  tags: string[];
  mrp: number;
  supplyCost: number;
  price: number;
  discountPct: number;
  gstPct: number;
  moq: number;
  leadTimeDays: number;
  stockQty: number;
};

export type VendorOrderStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled";
export type VendorOrder = {
  id: string;
  vendorId: string;
  reference: string;
  productId: string;
  productName: string;
  qty: number;
  amount: number;
  customer: string;
  status: VendorOrderStatus;
  at: string;
};

export function marginPct(p: { price: number; supplyCost: number }) {
  if (!p.price) return 0;
  return Math.round(((p.price - p.supplyCost) / p.price) * 100);
}
/** Selling price after the vendor's promotional discount. */
export function effectivePrice(p: { price: number; discountPct: number }) {
  return Math.round(p.price * (1 - (p.discountPct || 0) / 100));
}

/* ------------------------------ products ------------------------------ */

const LS_PRODUCTS = "suppai.vendor.products.v3";
const LS_ORDERS = "suppai.vendor.orders.v1";

function seedProducts(): VendorProduct[] {
  const now = Date.now();
  const day = 86400000;
  const vid = "vendor-1";
  const vname = "MuscleBlaze Nutrition";
  const gal = (s: string) => [`https://picsum.photos/seed/${s}a/720/540`, `https://picsum.photos/seed/${s}b/720/540`, `https://picsum.photos/seed/${s}c/720/540`];
  const base = (o: Partial<VendorProduct>): VendorProduct => ({
    id: uid("vp"), vendorId: vid, vendorName: vname, name: "", brand: "", category: "Supplements",
    coverImage: "", gallery: [], description: "", longDescription: "", ingredients: [], tags: [],
    mrp: 0, supplyCost: 0, price: 0, discountPct: 0, gstPct: 18, moq: 10, leadTimeDays: 3, stockQty: 100,
    stock: "active", listing: "listed", createdAt: new Date(now - 10 * day).toISOString(), updatedAt: new Date(now - 2 * day).toISOString(), ...o,
  });
  return [
    base({ id: "vp-1", name: "Whey Protein Isolate 1 kg", brand: "MuscleBlaze", category: "Supplements", hsn: "2106", coverImage: "https://picsum.photos/seed/whey/720/540", gallery: gal("whey"), description: "27g protein per scoop, low-carb isolate.", mrp: 3499, supplyCost: 2200, price: 2899, discountPct: 10, gstPct: 18, moq: 10, leadTimeDays: 3, stockQty: 240 }),
    base({ id: "vp-2", name: "Daily Multivitamin (60 tabs)", brand: "Carbamide Forte", category: "Supplements", hsn: "2106", coverImage: "https://picsum.photos/seed/multivit/720/540", gallery: gal("multivit"), description: "23 essential vitamins and minerals.", mrp: 699, supplyCost: 350, price: 499, gstPct: 12, moq: 20, leadTimeDays: 2, stockQty: 500 }),
    base({ id: "vp-3", name: "Omega-3 Fish Oil (90 caps)", brand: "WOW Life", category: "Supplements", hsn: "1504", coverImage: "https://picsum.photos/seed/omega/720/540", gallery: gal("omega"), description: "1000mg fish oil, 180 EPA / 120 DHA.", mrp: 1299, supplyCost: 700, price: 999, gstPct: 12, moq: 15, leadTimeDays: 4, stockQty: 0, stock: "out_of_stock" }),
    base({ id: "vp-4", name: "Digital BP Monitor", brand: "Omron", category: "Medical devices", hsn: "9018", coverImage: "https://picsum.photos/seed/bpmon/720/540", gallery: gal("bpmon"), description: "Automatic upper-arm blood pressure monitor.", mrp: 2499, supplyCost: 1500, price: 1999, gstPct: 18, moq: 5, leadTimeDays: 5, stockQty: 60, listing: "pending", createdAt: new Date(now - 1 * day).toISOString() }),
  ];
}

export async function fetchVendorProducts(vendorId: string): Promise<VendorProduct[]> {
  return delay(readLocal(LS_PRODUCTS, seedProducts()).filter((p) => p.vendorId === vendorId));
}

/** All products for admin review (across vendors). */
export async function fetchAllVendorProducts(): Promise<VendorProduct[]> {
  return delay(readLocal(LS_PRODUCTS, seedProducts()));
}

export async function requestListing(vendorId: string, vendorName: string, draft: NewListing): Promise<VendorProduct[]> {
  const list = readLocal(LS_PRODUCTS, seedProducts());
  const iso = new Date().toISOString();
  const created: VendorProduct = {
    ...draft, id: uid("vp"), vendorId, vendorName, stock: "active", listing: "pending", createdAt: iso, updatedAt: iso,
  };
  const next = [created, ...list];
  writeLocal(LS_PRODUCTS, next);
  return delay(next.filter((p) => p.vendorId === vendorId), 220);
}

export async function setStock(id: string, stock: StockStatus): Promise<VendorProduct[]> {
  const next = readLocal(LS_PRODUCTS, seedProducts()).map((p) => (p.id === id ? { ...p, stock, updatedAt: new Date().toISOString() } : p));
  writeLocal(LS_PRODUCTS, next);
  return delay(next, 140);
}

export async function removeProduct(id: string): Promise<VendorProduct[]> {
  const next = readLocal(LS_PRODUCTS, seedProducts()).filter((p) => p.id !== id);
  writeLocal(LS_PRODUCTS, next);
  return delay(next, 140);
}

/** Vendor sets / changes the promotional discount % at any time. */
export async function setDiscount(id: string, pct: number): Promise<VendorProduct[]> {
  const clamped = Math.max(0, Math.min(90, Math.round(pct || 0)));
  const next = readLocal(LS_PRODUCTS, seedProducts()).map((p) =>
    p.id === id ? { ...p, discountPct: clamped, updatedAt: new Date().toISOString() } : p,
  );
  writeLocal(LS_PRODUCTS, next);
  return delay(next, 120);
}

/* ------------------------------ admin review ------------------------------ */

export async function approveListing(id: string): Promise<VendorProduct[]> {
  const next = readLocal(LS_PRODUCTS, seedProducts()).map((p) =>
    p.id === id ? { ...p, listing: "listed" as ListingStatus, note: undefined, updatedAt: new Date().toISOString() } : p,
  );
  writeLocal(LS_PRODUCTS, next);
  return delay(next, 180);
}
export async function rejectListing(id: string, note: string): Promise<VendorProduct[]> {
  const next = readLocal(LS_PRODUCTS, seedProducts()).map((p) =>
    p.id === id ? { ...p, listing: "rejected" as ListingStatus, note, updatedAt: new Date().toISOString() } : p,
  );
  writeLocal(LS_PRODUCTS, next);
  return delay(next, 180);
}

/** Send feedback: bounce the product back to the vendor to update and resubmit. */
export async function requestChanges(id: string, note: string): Promise<VendorProduct[]> {
  const next = readLocal(LS_PRODUCTS, seedProducts()).map((p) =>
    p.id === id ? { ...p, listing: "changes_requested" as ListingStatus, note, updatedAt: new Date().toISOString() } : p,
  );
  writeLocal(LS_PRODUCTS, next);
  return delay(next, 180);
}

/** Vendor edits a bounced product and resubmits it for review. */
export async function resubmitListing(id: string, draft: NewListing): Promise<VendorProduct[]> {
  const next = readLocal(LS_PRODUCTS, seedProducts()).map((p) =>
    p.id === id ? { ...p, ...draft, listing: "pending" as ListingStatus, note: undefined, updatedAt: new Date().toISOString() } : p,
  );
  writeLocal(LS_PRODUCTS, next);
  return delay(next, 200);
}

/* ------------------------------ orders ------------------------------ */

function seedOrders(): VendorOrder[] {
  const now = Date.now();
  const hr = 3600000;
  const day = 86400000;
  const vid = "vendor-1";
  const mk = (o: Partial<VendorOrder>): VendorOrder => ({
    id: uid("vo"), vendorId: vid, reference: "SA-ORD-0000", productId: "", productName: "", qty: 1, amount: 0, customer: "Member", status: "placed", at: new Date(now).toISOString(), ...o,
  });
  return [
    mk({ id: "vo-1", reference: "SA-ORD-4921", productId: "vp-1", productName: "Whey Protein Isolate 1 kg", qty: 2, amount: 5798, customer: "Jane Sharma", status: "shipped", at: new Date(now - 4 * hr).toISOString() }),
    mk({ id: "vo-2", reference: "SA-ORD-4918", productId: "vp-2", productName: "Daily Multivitamin (60 tabs)", qty: 3, amount: 1497, customer: "Arjun Rao", status: "delivered", at: new Date(now - 1 * day).toISOString() }),
    mk({ id: "vo-3", reference: "SA-ORD-4902", productId: "vp-1", productName: "Whey Protein Isolate 1 kg", qty: 1, amount: 2899, customer: "Meera Nair", status: "placed", at: new Date(now - 6 * hr).toISOString() }),
    mk({ id: "vo-4", reference: "SA-ORD-4880", productId: "vp-2", productName: "Daily Multivitamin (60 tabs)", qty: 5, amount: 2495, customer: "Kabir Shah", status: "delivered", at: new Date(now - 3 * day).toISOString() }),
    mk({ id: "vo-5", reference: "SA-ORD-4855", productId: "vp-3", productName: "Omega-3 Fish Oil (90 caps)", qty: 2, amount: 1998, customer: "Sara Thomas", status: "cancelled", at: new Date(now - 5 * day).toISOString() }),
    mk({ id: "vo-6", reference: "SA-ORD-4844", productId: "vp-1", productName: "Whey Protein Isolate 1 kg", qty: 1, amount: 2899, customer: "Rohan Kapoor", status: "packed", at: new Date(now - 8 * hr).toISOString() }),
  ];
}

export async function fetchVendorOrders(vendorId: string): Promise<VendorOrder[]> {
  return delay(
    readLocal(LS_ORDERS, seedOrders())
      .filter((o) => o.vendorId === vendorId)
      .sort((a, b) => b.at.localeCompare(a.at)),
  );
}

export const ORDER_STATUS_FLOW: VendorOrderStatus[] = ["placed", "packed", "shipped", "delivered", "cancelled"];

/** Vendor updates an order's fulfilment status. */
export async function setOrderStatus(id: string, status: VendorOrderStatus): Promise<VendorOrder[]> {
  const next = readLocal(LS_ORDERS, seedOrders()).map((o) => (o.id === id ? { ...o, status } : o));
  writeLocal(LS_ORDERS, next);
  return delay(next, 120);
}

/* ------------------------------ report ------------------------------ */

export type VendorReport = {
  revenue: number;
  orders: number;
  unitsSold: number;
  listed: number;
  pending: number;
  outOfStock: number;
  topProduct: string;
};

export async function fetchVendorReport(vendorId: string): Promise<VendorReport> {
  const products = readLocal(LS_PRODUCTS, seedProducts()).filter((p) => p.vendorId === vendorId);
  const orders = readLocal(LS_ORDERS, seedOrders()).filter((o) => o.vendorId === vendorId && o.status !== "cancelled");
  const revenue = orders.reduce((s, o) => s + o.amount, 0);
  const unitsSold = orders.reduce((s, o) => s + o.qty, 0);
  const byProduct = new Map<string, number>();
  for (const o of orders) byProduct.set(o.productName, (byProduct.get(o.productName) ?? 0) + o.qty);
  const topProduct = [...byProduct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  return delay({
    revenue,
    orders: orders.length,
    unitsSold,
    listed: products.filter((p) => p.listing === "listed").length,
    pending: products.filter((p) => p.listing === "pending").length,
    outOfStock: products.filter((p) => p.listing === "listed" && p.stock === "out_of_stock").length,
    topProduct,
  });
}
