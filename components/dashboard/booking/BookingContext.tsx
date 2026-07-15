"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { PendingOrder } from "@/lib/booking/order";
import type { PolicyOption, ProPlan } from "@/lib/plans/types";

export type TierId = ProPlan["id"] | "free";

export type ActiveInsurance = {
  reference: string;
  insurer: string;
  cover: number;
  termYears: 1 | 2 | 3;
  premium: number;
  members: number;
  policy: PolicyOption;
  startedAt: string;
};

type BookingContextValue = {
  pendingOrder: PendingOrder | null;
  checkout: (order: PendingOrder) => void;
  clearOrder: () => void;
  navigateTo: string | null;
  consumeNavigation: () => void;

  // Persisted plan + insurance state
  currentTier: TierId;
  setCurrentTier: (t: TierId) => void;
  activeInsurance: ActiveInsurance | null;
  setActiveInsurance: (i: ActiveInsurance | null) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

const LS_TIER = "suppai.currentTier";
const LS_INSURANCE = "suppai.activeInsurance";

export function BookingProvider({ children }: { children: ReactNode }) {
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [navigateTo, setNavigateTo] = useState<string | null>(null);
  const [currentTier, setTier] = useState<TierId>("free");
  const [activeInsurance, setInsurance] = useState<ActiveInsurance | null>(null);

  // Hydrate persisted state on mount (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const t = localStorage.getItem(LS_TIER);
      if (t === "daily" || t === "weekly" || t === "free") {
        setTier(t);
      }
      const i = localStorage.getItem(LS_INSURANCE);
      if (i) setInsurance(JSON.parse(i) as ActiveInsurance);
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrentTier = useCallback((t: TierId) => {
    setTier(t);
    try {
      localStorage.setItem(LS_TIER, t);
    } catch {
      /* ignore */
    }
  }, []);

  const setActiveInsurance = useCallback((i: ActiveInsurance | null) => {
    setInsurance(i);
    try {
      if (i) localStorage.setItem(LS_INSURANCE, JSON.stringify(i));
      else localStorage.removeItem(LS_INSURANCE);
    } catch {
      /* ignore */
    }
  }, []);

  function checkout(order: PendingOrder) {
    setPendingOrder(order);
    setNavigateTo("plans");
  }
  function clearOrder() {
    setPendingOrder(null);
  }
  function consumeNavigation() {
    setNavigateTo(null);
  }

  return (
    <BookingContext.Provider
      value={{
        pendingOrder,
        checkout,
        clearOrder,
        navigateTo,
        consumeNavigation,
        currentTier,
        setCurrentTier,
        activeInsurance,
        setActiveInsurance,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
