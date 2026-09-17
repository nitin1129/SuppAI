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
  // Persisted state is read once the client has hydrated (no SSR mismatch);
  // choices made in this session override what storage held.
  const hydrated = useHydrated();
  const stored = useMemo(() => {
    const out: { tier: TierId; insurance: ActiveInsurance | null } = { tier: "free", insurance: null };
    if (!hydrated) return out;
    try {
      const t = localStorage.getItem(LS_TIER);
      if (t === "daily" || t === "weekly" || t === "free") out.tier = t;
      const i = localStorage.getItem(LS_INSURANCE);
      if (i) out.insurance = JSON.parse(i) as ActiveInsurance;
    } catch {
      /* ignore */
    }
    return out;
  }, [hydrated]);
  const [tierChoice, setTier] = useState<TierId | null>(null);
  const [insuranceChoice, setInsurance] = useState<ActiveInsurance | null | undefined>(undefined);
  const currentTier = tierChoice ?? stored.tier;
  const activeInsurance = insuranceChoice !== undefined ? insuranceChoice : stored.insurance;

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
