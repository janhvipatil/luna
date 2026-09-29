import type { AspectRatio, FormatPreset, Template, VisualStyle } from "./types";

export const FORMAT_PRESETS: Record<AspectRatio, FormatPreset> = {
  "9:16": { id: "9:16", label: "Vertical", hint: "Reels · TikTok · Shorts", width: 1080, height: 1920 },
  "4:5": { id: "4:5", label: "Portrait", hint: "Instagram feed", width: 1080, height: 1350 },
  "1:1": { id: "1:1", label: "Square", hint: "Feed · ads", width: 1080, height: 1080 },
  "16:9": { id: "16:9", label: "Landscape", hint: "YouTube · web", width: 1920, height: 1080 },
};

export const FORMAT_LIST: FormatPreset[] = Object.values(FORMAT_PRESETS);

export const VISUAL_STYLES: Array<{ id: VisualStyle; label: string; blurb: string }> = [
  { id: "cinematic", label: "Cinematic", blurb: "Filmic lighting, shallow depth" },
  { id: "photographic", label: "Photographic", blurb: "Realistic, editorial" },
  { id: "product-shot", label: "Product Shot", blurb: "Clean studio backdrop" },
  { id: "3d-render", label: "3D Render", blurb: "Glossy, dimensional" },
  { id: "anime", label: "Anime", blurb: "Stylized, expressive" },
  { id: "flat-illustration", label: "Flat Illustration", blurb: "Vector, brand-friendly" },
  { id: "retro", label: "Retro", blurb: "Grainy, nostalgic" },
];

export const STYLE_LABEL: Record<VisualStyle, string> = Object.fromEntries(
  VISUAL_STYLES.map((s) => [s.id, s.label]),
) as Record<VisualStyle, string>;

/**
 * Starter storyboards. These give a new user a fully-formed structure they can
 * immediately tweak — the fastest path from "blank" to "generating".
 */
export const TEMPLATES: Template[] = [
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Hook → problem → product → proof → CTA. The workhorse ad structure.",
    format: "9:16",
    accent: "#8b5cf6",
    scenes: [
      { title: "Hook", prompt: "Extreme close-up of the product with dramatic rim lighting on a dark background", script: "Stop scrolling — this changes everything.", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Problem", prompt: "A frustrated person surrounded by clutter, muted colors, relatable everyday scene", script: "Tired of the old way of doing this?", style: "photographic", medium: "image", durationSec: 4 },
      { title: "Product", prompt: "The product rotating on a clean pedestal, studio lighting, soft shadows", script: "Meet the upgrade you've been waiting for.", style: "product-shot", medium: "video", durationSec: 4 },
      { title: "Proof", prompt: "Split-screen before and after comparison, bright and optimistic", script: "Real results, right out of the box.", style: "photographic", medium: "image", durationSec: 4 },
      { title: "CTA", prompt: "Bold product hero shot with negative space for text overlay, brand gradient background", script: "Get yours today. Link in bio.", style: "flat-illustration", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "founder-story",
    name: "Founder Story",
    description: "A personal, talking-head narrative arc for building trust.",
    format: "9:16",
    accent: "#3b82f6",
    scenes: [
      { title: "Cold open", prompt: "Warm portrait of a founder in a home office, natural window light, candid", script: "Three years ago, I almost gave up.", style: "cinematic", medium: "image", durationSec: 4 },
      { title: "The turn", prompt: "Hands sketching an idea on paper, close-up, hopeful morning light", script: "Then I realized what everyone was missing.", style: "photographic", medium: "image", durationSec: 4 },
      { title: "The build", prompt: "Time-lapse style montage of a small team working together, energetic", script: "So we built it ourselves.", style: "cinematic", medium: "video", durationSec: 5 },
      { title: "Invitation", prompt: "Founder smiling directly at camera, welcoming, soft bokeh background", script: "I'd love for you to be part of it.", style: "photographic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "explainer",
    name: "60-Second Explainer",
    description: "Teach one concept fast with clean illustrated beats.",
    format: "1:1",
    accent: "#34d399",
    scenes: [
      { title: "Question", prompt: "A single glowing question mark made of light, minimal dark background", script: "Ever wondered how this actually works?", style: "flat-illustration", medium: "image", durationSec: 3 },
      { title: "Concept", prompt: "Simple isometric diagram of connected nodes, friendly color palette", script: "It comes down to three simple steps.", style: "flat-illustration", medium: "image", durationSec: 5 },
      { title: "Payoff", prompt: "Bright celebratory illustration of a completed goal, confetti accents", script: "And that's it — you've got it.", style: "flat-illustration", medium: "image", durationSec: 3 },
    ],
  },
];

export const DEFAULT_SCENE_PROMPT = "A striking, well-lit hero shot on a clean background";
