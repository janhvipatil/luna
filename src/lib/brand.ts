import type { Json } from "@/lib/supabase/types";
import { parseVenue, type VenueProfile } from "@/lib/venue";

/** Per-user brand styling applied to captions and overlays. */
export interface BrandKit {
  /** Brand name as it should appear on videos (falls back to the venue name). */
  name?: string;
  /** Primary color as a hex string — used for captions. */
  color?: string;
  /** Extra brand colors (hex), in order; the first is the watermark accent. */
  colors?: string[];
  /** Caption typeface family. */
  font?: "sans" | "serif" | "mono";
  /** URL of a logo watermark shown on each scene. */
  logoUrl?: string;
  /** The café / restaurant this account markets (see lib/venue). */
  venue?: VenueProfile;
}

/** Most extra colors a brand kit keeps. */
export const MAX_BRAND_COLORS = 5;

const HEX = /^#[0-9a-fA-F]{3,8}$/;
export const isHexColor = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

/** The brand's full palette: primary first, then the extra colors. */
export function brandPalette(kit: BrandKit): string[] {
  return [kit.color ?? DEFAULT_CAPTION_COLOR, ...(kit.colors ?? [])];
}

/** The name to show on videos: the brand name, else the venue's name. */
export function brandName(kit: BrandKit): string | undefined {
  return kit.name?.trim() || kit.venue?.name?.trim() || undefined;
}

/** Background for the name watermark: the first extra color, else a dark tint. */
export function watermarkColor(kit: BrandKit): string {
  return kit.colors?.[0] ?? "rgba(20,24,22,0.72)";
}

export const BRAND_FONTS: Array<{ id: NonNullable<BrandKit["font"]>; label: string }> = [
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
];

/** CSS font-family for a brand font choice. */
export function fontFamily(font: BrandKit["font"]): string {
  switch (font) {
    case "serif":
      return "Georgia, 'Times New Roman', serif";
    case "mono":
      return "ui-monospace, 'SF Mono', monospace";
    default:
      return "ui-sans-serif, system-ui, sans-serif";
  }
}

/** Coerce an arbitrary JSON value into a BrandKit. */
export function parseBrandKit(raw: Json | null | undefined): BrandKit {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const kit: BrandKit = {};
  if (typeof o.name === "string" && o.name.trim()) kit.name = o.name.trim().slice(0, 60);
  if (isHexColor(o.color)) kit.color = o.color;
  if (Array.isArray(o.colors)) {
    const colors = o.colors.filter(isHexColor).slice(0, MAX_BRAND_COLORS);
    if (colors.length) kit.colors = colors;
  }
  if (o.font === "sans" || o.font === "serif" || o.font === "mono") kit.font = o.font;
  if (typeof o.logoUrl === "string" && o.logoUrl.trim()) kit.logoUrl = o.logoUrl.trim();
  const venue = parseVenue(o.venue);
  if (venue) kit.venue = venue;
  return kit;
}

export const DEFAULT_CAPTION_COLOR = "#ffffff";
