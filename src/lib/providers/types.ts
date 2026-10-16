import type { AspectRatio, SceneMedium, VisualStyle } from "../types";
import type { AiContext } from "../ai/context";

export type { AiContext };

/**
 * The provider contract.
 *
 * Luna is deliberately not an AI model or a renderer. Every generation is
 * delegated to an external backend that already exists — a hosted API like
 * Replicate/Stability, or a self-hosted ComfyUI graph. A provider is the thin
 * adapter that turns Luna's neutral request into that backend's call and
 * normalizes the result back.
 *
 * To add a backend: implement `Provider`, register it in ./index.ts. Nothing
 * else in the app needs to know which backend ran.
 */

export interface GenerationRequest {
  prompt: string;
  style: VisualStyle;
  medium: SceneMedium;
  aspect: AspectRatio;
  /** Free-form label used only for nicer placeholders/logging. */
  sceneTitle?: string;
  /** Optional deterministic seed so re-runs are reproducible. */
  seed?: number;
  /** Seconds the scene stays on screen (video providers pick a clip length). */
  durationSec?: number;
  /** Image to animate (image-to-video). Must be a fetchable JPEG/PNG URL. */
  startImageUrl?: string;
}

export interface GenerationResult {
  url: string;
  medium: SceneMedium;
  providerId: string;
  posterUrl?: string;
}

export interface ProviderCapabilities {
  image: boolean;
  video: boolean;
}

export interface Provider {
  id: string;
  name: string;
  /** One-line description surfaced in the settings UI. */
  description: string;
  /** Link to the underlying open-source / hosted project. */
  homepage?: string;
  capabilities: ProviderCapabilities;
  /**
   * Whether this provider can run for this user: env config for self-hosted
   * backends, or the user's own connected key (bring-your-own-key, e.g. Gemini).
   * The mock provider is always ready.
   */
  isConfigured(ctx: AiContext): boolean;
  /** What the user must set to configure it (shown when not configured). */
  configHint?: string;
  generate(req: GenerationRequest, ctx: AiContext): Promise<GenerationResult>;

  /**
   * Long-running providers (e.g. Veo, which can take minutes) implement
   * start/poll instead of blocking in `generate`: `start` kicks the job off and
   * returns an operation id; `poll` checks it. The API route persists the
   * operation on a generation job so it survives disconnects.
   */
  start?(req: GenerationRequest, ctx: AiContext): Promise<{ operation: string }>;
  poll?(operation: string, ctx: AiContext): Promise<PollResult>;
  /** Headers needed to download this provider's result URLs (e.g. an API key). */
  downloadHeaders?(ctx: AiContext): Record<string, string>;
}

export type PollResult =
  | { done: false }
  | { done: true; result: GenerationResult }
  | { done: true; error: string };

export class ProviderNotConfiguredError extends Error {
  constructor(providerId: string, hint?: string) {
    super(
      `Provider "${providerId}" is not configured.${hint ? ` ${hint}` : ""}`,
    );
    this.name = "ProviderNotConfiguredError";
  }
}
