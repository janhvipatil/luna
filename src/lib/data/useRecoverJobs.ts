"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLunaStore } from "@/lib/store";
import type { GeneratedAsset } from "@/lib/types";
import { pollJob } from "@/lib/pollJob";

const WINDOW_MS = 2 * 60 * 60 * 1000; // only recover jobs from the last 2 hours

/**
 * Recovers generations that completed server-side after the client disconnected
 * (navigation, tab close, crash). On load it reads recent `ready` generation
 * jobs for this storyboard and fills in any scene that's still missing its
 * asset — making generation durable without a background worker. Jobs still
 * rendering on a long-running provider (Veo) are resumed and polled.
 */
export function useRecoverJobs(storyboardId: string) {
  const supabase = useMemo(() => createClient(), []);
  const hydrated = useLunaStore((s) => s.hydrated);
  const setSceneAsset = useLunaStore((s) => s.setSceneAsset);
  const setSceneStatus = useLunaStore((s) => s.setSceneStatus);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const abort = new AbortController();

    (async () => {
      const since = new Date(Date.now() - WINDOW_MS).toISOString();
      const { data } = await supabase
        .from("generation_jobs")
        .select("scene_id, result, updated_at")
        .eq("storyboard_id", storyboardId)
        .eq("status", "ready")
        .gte("updated_at", since)
        .order("updated_at", { ascending: false });

      if (!active || !data) return;

      const sb = useLunaStore.getState().storyboards[storyboardId];
      if (!sb) return;

      const applied = new Set<string>();
      for (const job of data) {
        if (applied.has(job.scene_id) || !job.result) continue; // newest per scene
        applied.add(job.scene_id);
        const scene = sb.scenes.find((s) => s.id === job.scene_id);
        if (scene && !scene.asset) {
          setSceneAsset(storyboardId, job.scene_id, job.result as unknown as GeneratedAsset);
        }
      }

      // Resume clips that were still rendering when the page was left.
      const { data: pending } = await supabase
        .from("generation_jobs")
        .select("id, scene_id, created_at")
        .eq("storyboard_id", storyboardId)
        .eq("status", "pending")
        .gte("updated_at", since)
        .order("created_at", { ascending: false });
      if (!active || !pending) return;

      const resumed = new Set<string>();
      for (const job of pending) {
        if (resumed.has(job.scene_id)) continue; // newest per scene
        resumed.add(job.scene_id);
        setSceneStatus(storyboardId, job.scene_id, "generating");
        pollJob(job.id, abort.signal)
          .then((asset) => active && setSceneAsset(storyboardId, job.scene_id, asset))
          .catch((err: Error) => active && setSceneStatus(storyboardId, job.scene_id, "error", err.message));
      }
    })();

    return () => {
      active = false;
      abort.abort();
    };
  }, [supabase, storyboardId, hydrated, setSceneAsset, setSceneStatus]);
}
