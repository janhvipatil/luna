"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Returns true only after the first client render. Used to gate rendering of
 * localStorage-backed state so the server-rendered HTML (which has no store)
 * doesn't mismatch the hydrated client tree.
 *
 * Implemented with useSyncExternalStore: the server snapshot is always `false`
 * and the client snapshot is `true`, so there's no setState-in-effect and no
 * cascading render.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
