import type { ConsultMode, Doctor } from "@/lib/consult/types";
import type { Patient, Schedule, TestPackage } from "@/lib/health-tests/types";
import type { PolicyOption } from "@/lib/plans/types";

/* ----------------------------- Cart ----------------------------- */

type Base = {
  id: string;
  addedAt: string;
};

export type CartProductOneTime = Base & {
  kind: "product-onetime";
  productId: string;
  name: string;
  brand: string;
  categoryId: string;
  image: string;
  unitPrice: number;
  unitMrp: number;
  qty: number;
  packLabel?: string;
};

export type CartProductSubscription = Base & {
  kind: "product-subscription";
  productId: string;
  name: string;
  brand: string;
  categoryId: string;
  image: string;
  unitPrice: number;        // already discounted recurring price
  unitMrp: number;
  packLabel: string;        // e.g. "1 month supply"
  frequencyWeeks: number;   // billing interval
};

export type CartConsult = Base & {
  kind: "consult";
  doctor: Doctor;
  mode: ConsultMode;
  patient: Patient;
  schedule: Schedule;
  fee: number;
  platformFee: number;
};

export type CartTest = Base & {
  kind: "test";
  vendorName: string;
  vendorLogo?: string;
  tests: TestPackage[];
  patient: Patient;
  schedule: Schedule;
  subtotal: number;
  collectionFee: number;
};

export type CartInsurance = Base & {
  kind: "insurance";
  policy: PolicyOption;
  insurer: string;
  cover: number;
  termYears: 1 | 2 | 3;
  premium: number;          // annual premium total today
  members: number;
};

export type CartItem =
  | CartProductOneTime
  | CartProductSubscription
  | CartConsult
  | CartTest
  | CartInsurance;

/** Distributive omit so the discriminated union is preserved when typing input drafts. */
export type CartItemDraft = CartItem extends infer T
  ? T extends CartItem
    ? Omit<T, "id" | "addedAt"> & { id?: string }
    : never
  : never;

/* ----------------------------- Wishlist ----------------------------- */

export type WishProduct = {
  id: string;                // wish id
  kind: "product";
  productId: string;
  name: string;
  brand: string;
  categoryId: string;
  image: string;
  price: number;
  mrp: number;
  addedAt: string;
};

export type WishDoctor = {
  id: string;
  kind: "doctor";
  doctor: Doctor;
  addedAt: string;
};

export type WishTest = {
  id: string;
  kind: "test";
  testId: string;
  name: string;
  vendor: string;
  price: number;
  addedAt: string;
};

export type WishlistItem = WishProduct | WishDoctor | WishTest;

export type WishlistDraft = WishlistItem extends infer T
  ? T extends WishlistItem
    ? Omit<T, "id" | "addedAt"> & { id?: string }
    : never
  : never;

/* ----------------------------- Totals ----------------------------- */

export type CartTotals = {
  oneTimeSubtotal: number;
  oneTimeSavings: number;
  subscriptionSubtotal: number;     // first cycle charged today
  oneTimeTax: number;
  total: number;
  itemCount: number;
};
