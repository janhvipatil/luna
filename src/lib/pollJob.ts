import type { GeneratedAsset, Scene } from "./types";
import { isVideoUrl } from "./utils";

const POLL_EVERY_MS = 5000;
/** Veo peaks at ~6 minutes; give it headroom before giving up client-side. */
const GIVE_UP_AFTER_MS = 12 * 60 * 1000;

interface JobResponse {
  status: "pending" | "ready" | "error";
  asset?: GeneratedAsset;
  error?: string;
}

/**
 * Polls a long-running generation job until it's ready or failed. The job
 * itself lives server-side, so if this gives up (or the tab closes) the result
 * is still recovered on the next visit by useRecoverJobs.
 */
export async function pollJob(jobId: string, signal?: AbortSignal): Promise<GeneratedAsset> {
  const started = Date.now();
  while (Date.now() - started < GIVE_UP_AFTER_MS) {
    await new Promise((r) => setTimeout(r, POLL_EVERY_MS));
    if (signal?.aborted) throw new Error("Stopped waiting for this clip.");
    const res = await fetch(`/api/generate/jobs/${jobId}`, { cache: "no-store" });
    const data: JobResponse = await res.json().catch(() => ({ status: "pending" }));
    if (!res.ok && res.status !== 404) continue; // transient — keep polling
    if (data.status === "ready" && data.asset) return data.asset;
    if (data.status === "error" || res.status === 404) {
      throw new Error(data.error || "Generation failed.");
    }
  }
  throw new Error("Still rendering — it will appear here when it's done.");
}

/**
 * The still a video scene should animate (image-to-video): the current image
 * asset, else the newest image take. Only http(s) JPEG/PNG-ish URLs qualify
 * (the mock's SVG frames can't be animated).
 */
export function startFrameFor(scene: Scene): string | undefined {
  const candidates = [scene.asset, ...(scene.takes ?? [])].filter(Boolean) as GeneratedAsset[];
  const still = candidates.find(
    (a) => !isVideoUrl(a.url) && /^https:\/\//.test(a.url) && !/\.svg(\?|$)/i.test(a.url),
  );
  return still?.url;
}
