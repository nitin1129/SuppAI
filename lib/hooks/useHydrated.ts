"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** False on the server and during hydration, true on the client afterwards.
    Replaces the "setHydrated(true) inside an effect" pattern: reads that depend
    on the browser (localStorage, the clock) can key off this instead of being
    pushed into state from an effect. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

const pickCache = new WeakMap<readonly unknown[], unknown>();

/** One random item per pool, fixed for the page's lifetime. The pool must be a
    stable (module-level) array so the cached pick stays put across renders. */
export function useRandomPick<T>(pool: readonly T[] | undefined): T | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      if (!pool || pool.length === 0) return null;
      if (!pickCache.has(pool)) pickCache.set(pool, pool[Math.floor(Math.random() * pool.length)]);
      return pickCache.get(pool) as T;
    },
    () => null,
  );
}
