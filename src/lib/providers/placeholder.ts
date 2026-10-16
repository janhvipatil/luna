import type { AspectRatio, VisualStyle } from "../types";
import { FORMAT_PRESETS } from "../constants";

/**
 * Generates a self-contained SVG "preview" as a data URL.
 *
 * This is what makes the mock provider useful: instead of a grey box, every
 * scene gets a distinct, style-appropriate frame so the storyboard reads like
 * the real thing while you design flow and copy. Real providers replace these
 * with actual model output.
 */

const STYLE_PALETTE: Record<VisualStyle, [string, string, string]> = {
  "food-closeup": ["#3b1d0e", "#9a3412", "#fdba74"],
  "flat-lay": ["#f5efe6", "#d6c3a5", "#7c4a1e"],
  "cozy-ambient": ["#422006", "#a16207", "#fde68a"],
  cinematic: ["#1e1b4b", "#4c1d95", "#f59e0b"],
  photographic: ["#0f172a", "#334155", "#e2e8f0"],
  "product-shot": ["#f8fafc", "#cbd5e1", "#0f172a"],
  "3d-render": ["#0c4a6e", "#7c3aed", "#22d3ee"],
  anime: ["#831843", "#db2777", "#fde68a"],
  "flat-illustration": ["#4338ca", "#8b5cf6", "#c4b5fd"],
  retro: ["#7c2d12", "#ea580c", "#fed7aa"],
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface PlaceholderOptions {
  prompt: string;
  style: VisualStyle;
  aspect: AspectRatio;
  label?: string;
  seed?: number;
}

export function buildPlaceholderSvg({
  prompt,
  style,
  aspect,
  label,
  seed,
}: PlaceholderOptions): string {
  const preset = FORMAT_PRESETS[aspect];
  // Work in a fixed 400-wide canvas scaled to the aspect ratio.
  const w = 400;
  const h = Math.round((preset.height / preset.width) * w);
  const [c1, c2, accent] = STYLE_PALETTE[style];
  const seedSalt = seed != null ? `#${seed}` : "";
  const h1 = seed ?? hashString(prompt + style);
  const angle = h1 % 360;

  // A few drifting "orbs" seeded by prompt + seed so each take is distinct.
  const orbs = Array.from({ length: 4 }, (_, i) => {
    const s = hashString(prompt + seedSalt + i);
    const cx = (s % 100) / 100 * w;
    const cy = ((s >> 3) % 100) / 100 * h;
    const r = 30 + ((s >> 5) % 60);
    const opacity = 0.12 + ((s >> 7) % 20) / 100;
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r}" fill="${accent}" opacity="${opacity.toFixed(2)}" />`;
  }).join("");

  const caption = escapeXml((label ?? prompt).slice(0, 48));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="24" /></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <g filter="url(#b)">${orbs}</g>
  <rect width="${w}" height="${h}" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="2" />
  <text x="16" y="${h - 40}" fill="#ffffff" fill-opacity="0.55" font-family="monospace" font-size="11">${escapeXml(style)}</text>
  <text x="16" y="${h - 20}" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="600">${caption}</text>
</svg>`;

  return svg;
}

export function svgToDataUrl(svg: string): string {
  const encoded = Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}
