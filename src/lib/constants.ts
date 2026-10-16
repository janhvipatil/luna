import type { AspectRatio, FormatPreset, VisualStyle } from "./types";

export const FORMAT_PRESETS: Record<AspectRatio, FormatPreset> = {
  "9:16": { id: "9:16", label: "Vertical", hint: "Reels · TikTok · Shorts", width: 1080, height: 1920 },
  "4:5": { id: "4:5", label: "Portrait", hint: "Instagram feed", width: 1080, height: 1350 },
  "1:1": { id: "1:1", label: "Square", hint: "Feed · ads", width: 1080, height: 1080 },
  "16:9": { id: "16:9", label: "Landscape", hint: "YouTube · web", width: 1920, height: 1080 },
};

export const FORMAT_LIST: FormatPreset[] = Object.values(FORMAT_PRESETS);

export const VISUAL_STYLES: Array<{ id: VisualStyle; label: string; blurb: string }> = [
  { id: "food-closeup", label: "Food Close-up", blurb: "Macro, glistening, mouth-watering" },
  { id: "flat-lay", label: "Flat Lay", blurb: "Overhead table spread" },
  { id: "cozy-ambient", label: "Cozy Ambience", blurb: "Warm interiors, golden light" },
  { id: "cinematic", label: "Cinematic", blurb: "Filmic lighting, shallow depth" },
  { id: "photographic", label: "Photographic", blurb: "Realistic, editorial" },
  { id: "product-shot", label: "Product Shot", blurb: "Clean studio backdrop" },
  { id: "retro", label: "Retro", blurb: "Grainy, nostalgic" },
  { id: "flat-illustration", label: "Illustration", blurb: "Vector, menu-board friendly" },
  { id: "3d-render", label: "3D Render", blurb: "Glossy, dimensional" },
  { id: "anime", label: "Anime", blurb: "Stylized, expressive" },
];

export const STYLE_LABEL: Record<VisualStyle, string> = Object.fromEntries(
  VISUAL_STYLES.map((s) => [s.id, s.label]),
) as Record<VisualStyle, string>;

export const DEFAULT_SCENE_PROMPT =
  "A beautifully plated dish on a rustic wooden table, soft window light, steam gently rising";
