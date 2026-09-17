"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useHydrated } from "@/lib/hooks/useHydrated";

import type { CartItem, CartItemDraft, CartTotals } from "./types";

const LS_KEY = "suppai.cart";

type Ctx = {
  items: CartItem[];
  hydrated: boolean;
  oneTime: CartItem[];
  subscriptions: CartItem[];
  totals: CartTotals;
  addItem: (item: CartItemDraft) => string;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  hasProduct: (productId: string, kind: "product-onetime" | "product-subscription") => boolean;
};

const CartContext = createContext<Ctx | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function computeTotals(items: CartItem[]): CartTotals {
  let oneTimeSubtotal = 0;
  let oneTimeSavings = 0;
  let subscriptionSubtotal = 0;

  for (const item of items) {
    switch (item.kind) {
      case "product-onetime":
        oneTimeSubtotal += item.unitPrice * item.qty;
        if (item.unitMrp > item.unitPrice)
          oneTimeSavings += (item.unitMrp - item.unitPrice) * item.qty;
        break;
      case "product-subscription":
        subscriptionSubtotal += item.unitPrice;
        if (item.unitMrp > item.unitPrice)
          oneTimeSavings += item.unitMrp - item.unitPrice;
        break;
      case "consult":
        oneTimeSubtotal += item.fee + item.platformFee;
        break;
      case "test":
        oneTimeSubtotal += item.subtotal + item.collectionFee;
        break;
      case "insurance":
        oneTimeSubtotal += item.premium;
        break;
    }
  }

  const oneTimeTax = Math.round(oneTimeSubtotal * 0.05);
  const total = oneTimeSubtotal + subscriptionSubtotal + oneTimeTax;

  return {
    oneTimeSubtotal,
    oneTimeSavings,
    subscriptionSubtotal,
    oneTimeTax,
    total,
    itemCount: items.length,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  // What storage held when the page loaded; local edits take over once made.
  const stored = useMemo<CartItem[]>(() => (hydrated ? read() : []), [hydrated]);
  const [edited, setEdited] = useState<CartItem[] | null>(null);
  const items = edited ?? stored;

  const persist = useCallback((next: CartItem[]) => {
    setEdited(next);
    write(next);
  }, []);

  const addItem = useCallback(
    (input: CartItemDraft): string => {
      const id = input.id ?? uid(input.kind);
      const next: CartItem = {
        ...(input as CartItem),
        id,
        addedAt: new Date().toISOString(),
      };

      // Merge duplicates for one-time products (same product + pack -> bump qty).
      if (next.kind === "product-onetime") {
        const existingIdx = items.findIndex(
          (i) =>
            i.kind === "product-onetime" &&
            i.productId === next.productId &&
            i.packLabel === next.packLabel,
        );
        if (existingIdx >= 0) {
          const existing = items[existingIdx] as Extract<
            CartItem,
            { kind: "product-onetime" }
          >;
          const merged = { ...existing, qty: existing.qty + next.qty };
          const arr = [...items];
          arr[existingIdx] = merged;
          persist(arr);
          return existing.id;
        }
      }

      // Subscriptions: replace existing subscription for same product.
      if (next.kind === "product-subscription") {
        const filtered = items.filter(
          (i) =>
            !(i.kind === "product-subscription" && i.productId === next.productId),
        );
        persist([next, ...filtered]);
        return id;
      }

      persist([next, ...items]);
      return id;
    },
    [items, persist],
  );

  const updateQty = useCallback(
    (id: string, qty: number) => {
      if (qty < 1) return;
      const next = items.map((i) =>
        i.kind === "product-onetime" && i.id === id ? { ...i, qty } : i,
      );
      persist(next);
    },
    [items, persist],
  );

  const removeItem = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id));
    },
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const hasProduct = useCallback(
    (productId: string, kind: "product-onetime" | "product-subscription") =>
      items.some(
        (i) =>
          i.kind === kind &&
          (i as Extract<CartItem, { kind: typeof kind }>).productId === productId,
      ),
    [items],
  );

  const oneTime = useMemo(
    () => items.filter((i) => i.kind !== "product-subscription"),
    [items],
  );
  const subscriptions = useMemo(
    () => items.filter((i) => i.kind === "product-subscription"),
    [items],
  );
  const totals = useMemo(() => computeTotals(items), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,
        oneTime,
        subscriptions,
        totals,
        addItem,
        updateQty,
        removeItem,
        clear,
        hasProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
