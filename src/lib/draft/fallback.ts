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

/**
 * Three distinct template concepts for "show me options": the sensory close-up
 * cut, a behind-the-scenes cut, and a guest's-eye cut. User testing: owners
 * wanted AI to "just make three ads to choose from".
 */
export function draftOptionsFromTemplate(req: DraftRequest): DraftStoryboard[] {
  const base = draftFromTemplate(req);
  const subject = req.brief.trim() || "our signature dish";
  const v = venueTokens(req.venue);

  const behindTheScenes: DraftStoryboard = {
    title: "Behind the counter",
    description: `The people and craft behind ${v.venue}: ${subject}`,
    scenes: [
      { title: "Early start", prompt: `Hands preparing ingredients at dawn in a ${v.vibe} ${v.type} kitchen, warm light, flour in the air`, script: "Before the doors open…", style: "cinematic", medium: "video", durationSec: 3 },
      { title: "Craft", prompt: `Close-up of skilled hands making it with care — ${subject}`, script: "Everything made by hand, every day.", style: "food-closeup", medium: "video", durationSec: 4 },
      { title: "The team", prompt: `The team smiling behind the counter of a ${v.vibe} ${v.type}, candid`, script: `Meet the people behind ${v.venue}.`, style: "photographic", medium: "image", durationSec: 3 },
      { title: "Call to action", prompt: `Finished dish served across the counter to a happy guest — ${subject}`, script: "Come say hi — we'll have it ready.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  };

  const guestsEye: DraftStoryboard = {
    title: "Through a guest's eyes",
    description: `POV: a first visit to ${v.venue} for ${subject}`,
    scenes: [
      { title: "Walk in", prompt: `First-person view walking into a ${v.vibe} ${v.type}, morning light, bell above the door`, script: `POV: you finally tried ${v.venue}.`, style: "cozy-ambient", medium: "video", durationSec: 3 },
      { title: "Order", prompt: `First-person view at the counter pointing at it in the display — ${subject}`, script: "You already know what you're getting.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "First bite", prompt: `First-person first bite or sip, slow motion — ${subject}`, script: "And now you get it.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Call to action", prompt: `Friends laughing at a sunny table inside a ${v.vibe} ${v.type}`, script: "Tag who you're bringing next time.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  };

  return [{ ...base, title: "Up close" }, behindTheScenes, guestsEye];
}
