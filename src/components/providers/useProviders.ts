"use client";

import { useEffect, useState } from "react";
import type { ProviderInfo } from "@/lib/providers";

/**
 * Fetches provider metadata (including server-side `configured` status) once.
 * Cached at module scope so multiple mounts share a single request.
 */
let cache: ProviderInfo[] | null = null;
let inflight: Promise<ProviderInfo[]> | null = null;

async function load(): Promise<ProviderInfo[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch("/api/providers")
      .then((r) => r.json())
      .then((d: { providers: ProviderInfo[] }) => {
        cache = d.providers;
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    load().then((p) => {
      if (active) {
        setProviders(p);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { providers, loading };
}
