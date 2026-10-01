import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic, de-duping conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Short, collision-resistant id for client-created entities (scene ids, etc.). */
export function createId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}_${time}${rand}`;
}

/**
 * RFC-4122 UUID for entities that map to a Postgres `uuid` column (storyboard
 * ids). Falls back to a manual v4 if crypto.randomUUID is unavailable.
 */
export function createUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
    const n = Number(c);
    return (n ^ (Math.floor(Math.random() * 256) & (15 >> (n / 4)))).toString(16);
  });
}

/** e.g. "2m ago", "3h ago", "just now" */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/** Whether an asset URL points at a real video file (vs an image/poster). */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.startsWith("data:video");
}

/**
 * Scene duration (whole seconds) that comfortably fits a narration clip:
 * the audio length rounded up with a small tail of breathing room, clamped to
 * the allowed 1–30s range. Falls back to 3s for an unknown length.
 */
export function fitDurationToAudio(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 3;
  return Math.min(30, Math.max(1, Math.ceil(seconds + 0.3)));
}

/** Read an audio file's duration in seconds (0 if it can't be determined). */
export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    if (typeof Audio === "undefined") {
      resolve(0);
      return;
    }
    const audio = new Audio();
    audio.preload = "metadata";
    let settled = false;
    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      resolve(Number.isFinite(value) ? value : 0);
    };
    audio.addEventListener("loadedmetadata", () => finish(audio.duration));
    audio.addEventListener("error", () => finish(0));
    audio.src = url;
    setTimeout(() => finish(audio.duration || 0), 5000);
  });
}

/** Total storyboard runtime in seconds, formatted as m:ss. */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
