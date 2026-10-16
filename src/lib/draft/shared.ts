import type { DraftRequest, DraftScene, DraftStoryboard } from "./types";
import { describeVenue } from "@/lib/venue";
import type { SceneMedium, VisualStyle } from "@/lib/types";
import { VISUAL_STYLES } from "@/lib/constants";

/**
 * What every AI drafter shares (Claude, Gemini): the café-specific system
 * prompt, the storyboard JSON schema, the user message, and validation of
 * whatever the model returns.
 */

export const STYLE_IDS = VISUAL_STYLES.map((s) => s.id);

/** JSON schema constraining model output to a well-formed storyboard. */
export const STORYBOARD_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          prompt: { type: "string" },
          script: { type: "string" },
          style: { type: "string", enum: STYLE_IDS },
          medium: { type: "string", enum: ["image", "video"] },
          durationSec: { type: "integer" },
        },
        required: ["title", "prompt", "script", "style", "medium", "durationSec"],
      },
    },
  },
  required: ["title", "description", "scenes"],
} as const;

export const DRAFT_SYSTEM_PROMPT = `You are a creative director who makes short-form social video (Reels, TikTok, Shorts) for independent cafés, bakeries and restaurants. Given a brief, produce a tight storyboard of 3–6 scenes that makes people hungry and gives them a reason to visit or order (hook → build → payoff → call to action).

What works for food & hospitality content:
- Open on the most appetising, sensory shot — steam, pours, pulls, crunch, first bite. The hook must land in under 3 seconds.
- Show craft and people (hands, baristas, chefs) as well as the food; show the space and its atmosphere at least once.
- End with a concrete, local action: book a table, visit today, order for pickup, try the special before it's gone.
- Use the venue's real name, signature item and details when provided. Never invent prices, addresses, opening hours or dates the brief doesn't give — keep those generic.

For each scene write:
- title: a 1–2 word beat name (e.g. "Hook", "The pour", "CTA").
- prompt: a vivid visual prompt for an image/video model describing the shot (subject, plating/props, setting, lighting, mood, camera angle).
- script: one short line of on-screen caption or voiceover — warm, conversational, scroll-stopping.
- style: the visual look, chosen from the allowed set. Prefer "food-closeup" for dish/drink hero shots, "flat-lay" for overhead table spreads, "cozy-ambient" for interiors and atmosphere.
- medium: "image" or "video" — use video for motion-worthy beats (pours, pulls, steam, slicing).
- durationSec: 2–6 seconds on screen.

Keep the whole piece punchy — total runtime under ~25 seconds.`;

/** The user turn: venue profile (if any), the brief, and the tone. */
export function draftUserMessage({ brief, tone, venue }: DraftRequest): string {
  const venueInfo = describeVenue(venue);
  return [venueInfo && `Venue:\n${venueInfo}`, `Brief: ${brief}`, tone && `Tone: ${tone}`]
    .filter(Boolean)
    .join("\n\n");
}

export function coerceScene(raw: unknown): DraftScene | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const style = STYLE_IDS.includes(o.style as VisualStyle)
    ? (o.style as VisualStyle)
    : "cinematic";
  const medium: SceneMedium = o.medium === "video" ? "video" : "image";
  const durationSec = Math.min(10, Math.max(1, Math.round(Number(o.durationSec) || 3)));
  const prompt = typeof o.prompt === "string" ? o.prompt.trim() : "";
  if (!prompt) return null;
  return {
    title: typeof o.title === "string" && o.title.trim() ? o.title.trim() : "Scene",
    prompt,
    script: typeof o.script === "string" ? o.script.trim() : "",
    style,
    medium,
    durationSec,
  };
}

/** Validate a model's storyboard object; throws if nothing usable came back. */
export function coerceStoryboard(raw: unknown, brief: string): DraftStoryboard {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const scenes = Array.isArray(obj.scenes)
    ? obj.scenes.map(coerceScene).filter((s): s is DraftScene => s !== null)
    : [];
  if (scenes.length === 0) throw new Error("Draft contained no usable scenes.");
  return {
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title.trim() : brief.slice(0, 60),
    description: typeof obj.description === "string" ? obj.description.trim() : "",
    scenes: scenes.slice(0, 8),
  };
}
