"use client";

import { useCallback, useState } from "react";
import { useLunaStore } from "./store";
import type { GeneratedAsset, Scene, Storyboard } from "./types";

interface GenerateResponse extends GeneratedAsset {
  resolvedProviderId?: string;
  error?: string;
}

/**
 * Orchestrates scene generation from the client: flips store status, calls the
 * API, and writes the resulting asset back. Handles a single scene or the whole
 * storyboard (sequentially, to be gentle on rate-limited backends).
 */
export function useGeneration(storyboard: Storyboard) {
  const providerId = useLunaStore((s) => s.providerId);
  const setSceneStatus = useLunaStore((s) => s.setSceneStatus);
  const setSceneAsset = useLunaStore((s) => s.setSceneAsset);
  const [busy, setBusy] = useState(false);

  const generateScene = useCallback(
    async (scene: Scene) => {
      setSceneStatus(storyboard.id, scene.id, "generating");
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: scene.prompt,
            style: scene.style,
            medium: scene.medium,
            aspect: storyboard.format,
            sceneTitle: scene.title,
            seed: scene.seed,
            providerId,
            storyboardId: storyboard.id,
            sceneId: scene.id,
          }),
        });
        const data: GenerateResponse = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        setSceneAsset(storyboard.id, scene.id, {
          url: data.url,
          medium: data.medium,
          providerId: data.resolvedProviderId ?? data.providerId,
          createdAt: Date.now(),
          posterUrl: data.posterUrl,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed.";
        setSceneStatus(storyboard.id, scene.id, "error", message);
      }
    },
    [providerId, setSceneAsset, setSceneStatus, storyboard.format, storyboard.id],
  );

  const generateAll = useCallback(
    async (scenes: Scene[]) => {
      setBusy(true);
      // Mark everything queued up front so the UI reflects the batch.
      scenes.forEach((s) => setSceneStatus(storyboard.id, s.id, "queued"));
      for (const scene of scenes) {
        await generateScene(scene);
      }
      setBusy(false);
    },
    [generateScene, setSceneStatus, storyboard.id],
  );

  return { generateScene, generateAll, busy };
}
