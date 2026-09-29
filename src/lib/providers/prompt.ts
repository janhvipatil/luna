import type { GenerationRequest } from "./types";
import type { VisualStyle } from "../types";

/**
 * Expands a scene's raw prompt with style-specific modifiers before it reaches
 * a real model. Keeping this in one place means every provider produces
 * consistent results for a given Luna style.
 */
const STYLE_MODIFIERS: Record<VisualStyle, string> = {
  cinematic: "cinematic still, dramatic lighting, shallow depth of field, film grain, 35mm",
  photographic: "professional photograph, natural lighting, high detail, editorial",
  "product-shot": "product photography, clean studio background, soft shadows, sharp focus",
  "3d-render": "high-quality 3D render, octane, glossy materials, volumetric light",
  anime: "anime illustration, vibrant colors, clean linework, expressive",
  "flat-illustration": "flat vector illustration, minimal, bold shapes, brand-friendly",
  retro: "retro film aesthetic, grainy, warm tones, nostalgic",
};

export function buildStyledPrompt(req: GenerationRequest): string {
  const modifiers = STYLE_MODIFIERS[req.style];
  return `${req.prompt.trim()}. ${modifiers}.`;
}
