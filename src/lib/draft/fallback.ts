import type { DraftRequest, DraftStoryboard } from "./types";
import { venueTokens } from "@/lib/venue";

/**
 * Deterministic, no-LLM drafter. Produces a solid food-content structure
 * (sensory hook → craft → the bite → atmosphere → CTA) seeded from the brief
 * and the venue profile, so AI drafting works even without an
 * ANTHROPIC_API_KEY. When a key is present the route uses Claude instead.
 */
export function draftFromTemplate({ brief, tone, venue }: DraftRequest): DraftStoryboard {
  const subject = brief.trim() || "our signature dish";
  const short = subject.length > 60 ? `${subject.slice(0, 57)}…` : subject;
  const toneNote = tone ? `, ${tone} tone` : "";
  const v = venueTokens(venue);
  const venueName = venue?.name ?? v.venue;

  return {
    title: short.charAt(0).toUpperCase() + short.slice(1),
    description: `Short-form concept for ${venueName}: ${subject}${toneNote}`,
    scenes: [
      {
        title: "Hook",
        prompt: `Mouth-watering macro close-up for: ${subject}. Steam rising, glistening textures, dark moody background`,
        script: "Stop scrolling — you'll want to see this.",
        style: "food-closeup",
        medium: "video",
        durationSec: 3,
      },
      {
        title: "Craft",
        prompt: `Hands preparing it with care behind the counter of a ${v.vibe} ${v.type}, warm light, close-up`,
        script: "Made fresh, by hand, every day.",
        style: "cinematic",
        medium: "video",
        durationSec: 4,
      },
      {
        title: "The bite",
        prompt: `First bite or sip, slow motion, revealing the texture inside — ${subject}`,
        script: "This is the moment.",
        style: "food-closeup",
        medium: "video",
        durationSec: 3,
      },
      {
        title: "Atmosphere",
        prompt: `Inside a ${v.vibe} ${v.type}: people relaxing at sunny tables, plants, golden-hour light`,
        script: `Pull up a chair at ${v.venue}.`,
        style: "cozy-ambient",
        medium: "image",
        durationSec: 3,
      },
      {
        title: "Call to action",
        prompt: `Overhead flat lay with negative space for text, featuring ${subject}, linen and ceramics`,
        script: `Come try it at ${v.venue}${venue?.location ? ` in ${venue.location}` : ""}.`,
        style: "flat-lay",
        medium: "image",
        durationSec: 3,
      },
    ],
  };
}
