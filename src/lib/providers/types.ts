import type { AspectRatio, SceneMedium, VisualStyle } from "../types";

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
   * Whether this provider has the env/config it needs to run. The mock
   * provider is always ready; real ones report false until keys are present.
   */
  isConfigured(): boolean;
  /** What the user must set to configure it (shown when not configured). */
  configHint?: string;
  generate(req: GenerationRequest): Promise<GenerationResult>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerId: string, hint?: string) {
    super(
      `Provider "${providerId}" is not configured.${hint ? ` ${hint}` : ""}`,
    );
    this.name = "ProviderNotConfiguredError";
  }
}
