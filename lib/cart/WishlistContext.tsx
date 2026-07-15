"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { WishlistDraft, WishlistItem } from "./types";

const LS_KEY = "suppai.wishlist";

type Ctx = {
  items: WishlistItem[];
  hydrated: boolean;
  add: (item: WishlistDraft) => void;
  remove: (id: string) => void;
  togglProduct: (productId: string, data: Omit<WishlistItem & { kind: "product" }, "id" | "addedAt" | "kind">) => boolean;
  isProductWished: (productId: string) => boolean;
  isDoctorWished: (doctorId: string) => boolean;
  isTestWished: (testId: string) => boolean;
  countByKind: Record<WishlistItem["kind"], number>;
};

const WishlistContext = createContext<Ctx | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function read(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: WishlistItem[]) => {
    setItems(next);
    write(next);
  }, []);

  const add = useCallback(
    (input: WishlistDraft) => {
      const id = input.id ?? uid(input.kind);
      const next: WishlistItem = {
        ...(input as WishlistItem),
        id,
        addedAt: new Date().toISOString(),
      };
      persist([next, ...items]);
    },
    [items, persist],
  );

  const remove = useCallback(
    (id: string) => persist(items.filter((i) => i.id !== id)),
    [items, persist],
  );

  const isProductWished = useCallback(
    (productId: string) =>
      items.some((i) => i.kind === "product" && i.productId === productId),
    [items],
  );
  const isDoctorWished = useCallback(
    (doctorId: string) =>
      items.some((i) => i.kind === "doctor" && i.doctor.id === doctorId),
    [items],
  );
  const isTestWished = useCallback(
    (testId: string) =>
      items.some((i) => i.kind === "test" && i.testId === testId),
    [items],
  );

  const togglProduct = useCallback(
    (
      productId: string,
      data: Omit<WishlistItem & { kind: "product" }, "id" | "addedAt" | "kind">,
    ): boolean => {
      const existing = items.find(
        (i) => i.kind === "product" && i.productId === productId,
      );
      if (existing) {
        persist(items.filter((i) => i.id !== existing.id));
        return false;
      }
      const next: WishlistItem = {
        ...data,
        kind: "product",
        id: uid("product"),
        addedAt: new Date().toISOString(),
      };
      persist([next, ...items]);
      return true;
    },
    [items, persist],
  );

  const countByKind = useMemo(() => {
    const c = { product: 0, doctor: 0, test: 0 } as Record<
      WishlistItem["kind"],
      number
    >;
    for (const i of items) c[i.kind] += 1;
    return c;
  }, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        hydrated,
        add,
        remove,
        togglProduct,
        isProductWished,
        isDoctorWished,
        isTestWished,
        countByKind,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
