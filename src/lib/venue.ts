/**
 * The venue a Luna account markets — a café, bakery, restaurant, etc.
 *
 * Luna is built for food & beverage businesses, so templates, AI drafts and
 * caption presets are written with tokens like {venue} and {signature} that get
 * filled from this profile. With no profile set, friendly generic fallbacks are
 * used so every template still reads naturally.
 */

export type VenueType =
  | "cafe"
  | "coffee-shop"
  | "bakery"
  | "restaurant"
  | "bistro"
  | "brunch-spot"
  | "bar"
  | "dessert-shop"
  | "food-truck";

export interface VenueProfile {
  /** Business name, e.g. "Little Fern Café". */
  name?: string;
  type?: VenueType;
  /** The dish or drink people come for, e.g. "pistachio croissant". */
  signature?: string;
  /** Neighbourhood or city, e.g. "Shoreditch". */
  location?: string;
  /** A few words on the atmosphere, e.g. "sunlit, plant-filled, slow mornings". */
  vibe?: string;
}

export const VENUE_TYPES: Array<{ id: VenueType; label: string; noun: string }> = [
  { id: "cafe", label: "Café", noun: "café" },
  { id: "coffee-shop", label: "Coffee shop", noun: "coffee shop" },
  { id: "bakery", label: "Bakery", noun: "bakery" },
  { id: "restaurant", label: "Restaurant", noun: "restaurant" },
  { id: "bistro", label: "Bistro", noun: "bistro" },
  { id: "brunch-spot", label: "Brunch spot", noun: "brunch spot" },
  { id: "bar", label: "Bar / wine bar", noun: "bar" },
  { id: "dessert-shop", label: "Dessert shop", noun: "dessert shop" },
  { id: "food-truck", label: "Food truck", noun: "food truck" },
];

const VENUE_TYPE_IDS = VENUE_TYPES.map((t) => t.id);

function str(v: unknown, max = 80): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
}

/** Coerce arbitrary JSON into a VenueProfile (drops unknown/invalid fields). */
export function parseVenue(raw: unknown): VenueProfile | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const o = raw as Record<string, unknown>;
  const venue: VenueProfile = {};
  const name = str(o.name);
  const signature = str(o.signature);
  const location = str(o.location);
  const vibe = str(o.vibe, 160);
  if (name) venue.name = name;
  if (VENUE_TYPE_IDS.includes(o.type as VenueType)) venue.type = o.type as VenueType;
  if (signature) venue.signature = signature;
  if (location) venue.location = location;
  if (vibe) venue.vibe = vibe;
  return Object.keys(venue).length ? venue : undefined;
}

/** Lower-case noun for the venue type ("café", "bakery"…). */
export function venueNoun(venue?: VenueProfile): string {
  return VENUE_TYPES.find((t) => t.id === venue?.type)?.noun ?? "café";
}

/** Values substituted into template tokens, with graceful fallbacks. */
export function venueTokens(venue?: VenueProfile): Record<string, string> {
  return {
    venue: venue?.name || `our ${venueNoun(venue)}`,
    type: venueNoun(venue),
    signature: venue?.signature || "house special",
    location: venue?.location || "the neighbourhood",
    vibe: venue?.vibe || "warm and welcoming",
  };
}

/**
 * Replace {venue}, {type}, {signature}, {location} and {vibe} tokens. A token at
 * the start of a sentence is capitalised so "our café" fallbacks read well.
 */
export function personalize(text: string, venue?: VenueProfile): string {
  const tokens = venueTokens(venue);
  return text.replace(/\{(\w+)\}/g, (match, key: string, offset: number) => {
    const value = tokens[key];
    if (value == null) return match;
    const before = text.slice(0, offset).trimEnd();
    const sentenceStart = before === "" || /[.!?—]$/.test(before);
    return sentenceStart ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  });
}

/** One-line description of the venue for AI prompts (empty if no profile). */
export function describeVenue(venue?: VenueProfile): string {
  if (!venue) return "";
  const parts = [
    venue.name && `Name: ${venue.name}`,
    venue.type && `Type: ${venueNoun(venue)}`,
    venue.signature && `Known for: ${venue.signature}`,
    venue.location && `Location: ${venue.location}`,
    venue.vibe && `Vibe: ${venue.vibe}`,
  ].filter(Boolean);
  return parts.join("\n");
}
