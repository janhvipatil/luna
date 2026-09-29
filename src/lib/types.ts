/**
 * Luna core domain model.
 *
 * A Storyboard is an ordered list of Scenes. Each Scene describes one shot of
 * short-form content: a visual prompt, a script/voiceover line, timing, and the
 * asset generated for it. Luna itself does not render video or run models — it
 * orchestrates existing generation backends (see lib/providers) and gives the
 * whole thing a good UI.
 */

/** Aspect ratios for short-form platforms. */
export type AspectRatio = "9:16" | "1:1" | "16:9" | "4:5";

export interface FormatPreset {
  id: AspectRatio;
  label: string;
  /** Platform hint shown in the UI. */
  hint: string;
  width: number;
  height: number;
}

/** Visual treatment applied to a scene's generation prompt. */
export type VisualStyle =
  | "cinematic"
  | "3d-render"
  | "anime"
  | "photographic"
  | "flat-illustration"
  | "retro"
  | "product-shot";

/** What kind of asset a scene should produce. */
export type SceneMedium = "image" | "video";

/** Lifecycle of a single generation request for a scene. */
export type GenerationStatus = "idle" | "queued" | "generating" | "ready" | "error";

export interface GeneratedAsset {
  /** URL (data URL or remote) of the produced image/video. */
  url: string;
  medium: SceneMedium;
  /** Which provider produced it, for provenance and re-runs. */
  providerId: string;
  createdAt: number;
  /** Optional poster/thumbnail for video assets. */
  posterUrl?: string;
}

export interface Scene {
  id: string;
  /** Short human label, e.g. "Hook", "Problem", "CTA". */
  title: string;
  /** The image/video generation prompt for this shot. */
  prompt: string;
  /** On-screen caption / voiceover script line. */
  script: string;
  style: VisualStyle;
  medium: SceneMedium;
  /** Seconds this shot stays on screen. */
  durationSec: number;
  status: GenerationStatus;
  asset?: GeneratedAsset;
  error?: string;
}

export interface Storyboard {
  id: string;
  title: string;
  description: string;
  format: AspectRatio;
  scenes: Scene[];
  createdAt: number;
  updatedAt: number;
}

/** A starter storyboard used on the dashboard's "new from template" flow. */
export interface Template {
  id: string;
  name: string;
  description: string;
  format: AspectRatio;
  accent: string;
  scenes: Array<Pick<Scene, "title" | "prompt" | "script" | "style" | "medium" | "durationSec">>;
}
