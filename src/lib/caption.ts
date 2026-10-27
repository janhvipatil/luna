import { createInteraction, GEMINI_MODELS, outputText } from "@/lib/ai/gemini";
import { describeVenue, venueNoun, type VenueProfile } from "@/lib/venue";
import type { PostCaption } from "./caption-format";

/**
 * The caption a café pastes when it posts the finished video (Instagram,
 * TikTok). User testing showed "Advertising content" wasn't understood, so the
 * UI calls this "Caption for your post" and offers a one-tap copy.
 */

export interface CaptionInput {
  title: string;
  description: string;
  /** Each scene's on-screen line, in order. */
  scripts: string[];
  venue?: VenueProfile;
}

export { formatPostCaption, type PostCaption } from "./caption-format";

const tagify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

function venueHashtags(venue?: VenueProfile): string[] {
  const tags = [
    venue?.name && tagify(venue.name),
    venue?.location && tagify(venue.location),
    venue?.signature && tagify(venue.signature),
    tagify(venueNoun(venue)),
    "foodie",
    "reels",
  ];
  return [...new Set(tags.filter((t): t is string => Boolean(t && t.length > 2)))].slice(0, 8);
}

/** Deterministic caption from the storyboard's own lines (no AI needed). */
export function templateCaption({ title, scripts, venue }: CaptionInput): PostCaption {
  const lines = scripts.map((s) => s.trim()).filter(Boolean);
  const hook = lines.at(0) ?? title;
  const cta = lines.length > 1 ? lines.at(-1) : undefined;
  const where = venue?.name ? `📍 ${venue.name}${venue.location ? `, ${venue.location}` : ""}` : undefined;
  return {
    caption: [hook, cta, where].filter(Boolean).join("\n\n"),
    hashtags: venueHashtags(venue),
  };
}

const SCHEMA = {
  type: "object",
  properties: {
    caption: { type: "string" },
    hashtags: { type: "array", items: { type: "string" } },
  },
  required: ["caption", "hashtags"],
} as const;

const SYSTEM = `You write Instagram and TikTok captions for independent cafés and restaurants.
Write a caption for the short video described below:
- 2–4 short lines, warm and conversational, in the venue's voice; at most 2 emoji.
- Open with a hook, end with a clear local call to action (visit, book, order, tag a friend).
- Use the venue's name and details when given. Never invent prices, addresses, opening hours or dates.
- hashtags: 5–10 relevant tags, lowercase, no '#', no spaces — mix the venue, location, food and #reels-style discovery tags.`;

/** Caption via Gemini on the user's own key (free tier). */
export async function geminiCaption(input: CaptionInput, apiKey: string): Promise<PostCaption> {
  const venueInfo = describeVenue(input.venue);
  const res = await createInteraction(apiKey, {
    model: GEMINI_MODELS.text,
    system_instruction: SYSTEM,
    input: [
      venueInfo && `Venue:\n${venueInfo}`,
      `Video: ${input.title}${input.description ? ` — ${input.description}` : ""}`,
      `Scenes:\n${input.scripts.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    response_format: { type: "text", mime_type: "application/json", schema: SCHEMA },
  });
  const parsed = JSON.parse(outputText(res)) as Partial<PostCaption>;
  const caption = typeof parsed.caption === "string" ? parsed.caption.trim() : "";
  if (!caption) throw new Error("Gemini returned an empty caption.");
  const hashtags = Array.isArray(parsed.hashtags)
    ? parsed.hashtags.filter((t): t is string => typeof t === "string").map(tagify).filter(Boolean).slice(0, 10)
    : [];
  return { caption, hashtags };
}
