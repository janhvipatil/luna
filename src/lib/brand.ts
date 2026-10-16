import type { Json } from "@/lib/supabase/types";
import { parseVenue, type VenueProfile } from "@/lib/venue";

/** Per-user brand styling applied to captions and overlays. */
export interface BrandKit {
  /** Caption/accent color as a hex string. */
  color?: string;
  /** Caption typeface family. */
  font?: "sans" | "serif" | "mono";
  /** URL of a logo watermark shown on each scene. */
  logoUrl?: string;
  /** The café / restaurant this account markets (see lib/venue). */
  venue?: VenueProfile;
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
  if (typeof o.color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(o.color)) kit.color = o.color;
  if (o.font === "sans" || o.font === "serif" || o.font === "mono") kit.font = o.font;
  if (typeof o.logoUrl === "string" && o.logoUrl.trim()) kit.logoUrl = o.logoUrl.trim();
  const venue = parseVenue(o.venue);
  if (venue) kit.venue = venue;
  return kit;
}

export const DEFAULT_CAPTION_COLOR = "#ffffff";
