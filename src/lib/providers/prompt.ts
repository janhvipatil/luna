import type { GenerationRequest } from "./types";
import type { VisualStyle } from "../types";

/**
 * Expands a scene's raw prompt with style-specific modifiers before it reaches
 * a real model. Keeping this in one place means every provider produces
 * consistent results for a given Luna style.
 */
const STYLE_MODIFIERS: Record<VisualStyle, string> = {
  "food-closeup":
    "professional food photography, macro close-up, appetizing, glistening textures, shallow depth of field, soft natural side light",
  "flat-lay":
    "overhead flat lay food photography, top-down, styled table spread, linen and ceramics, even soft daylight",
  cartoon:
    "playful 2D cartoon animation style, bold clean outlines, bright cheerful colours, cute expressive characters, charming and fun",
  "cozy-ambient":
    "warm cozy café interior, golden hour light through windows, candid, inviting atmosphere, lifestyle photography",
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
