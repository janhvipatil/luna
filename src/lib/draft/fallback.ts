import type { DraftRequest, DraftStoryboard } from "./types";

/**
 * Deterministic, no-LLM drafter. Produces a solid hook→problem→solution→proof→
 * CTA structure seeded from the brief, so AI drafting works even without an
 * ANTHROPIC_API_KEY. When a key is present the route uses Claude instead.
 */
export function draftFromTemplate({ brief, tone }: DraftRequest): DraftStoryboard {
  const subject = brief.trim() || "your product";
  const short = subject.length > 60 ? `${subject.slice(0, 57)}…` : subject;
  const toneNote = tone ? `, ${tone} tone` : "";

  return {
    title: short.charAt(0).toUpperCase() + short.slice(1),
    description: `Short-form concept for: ${subject}${toneNote}`,
    scenes: [
      {
        title: "Hook",
        prompt: `Eye-catching opening shot that represents ${subject}, dramatic lighting on a dark background`,
        script: "Stop scrolling — you'll want to see this.",
        style: "cinematic",
        medium: "image",
        durationSec: 3,
      },
      {
        title: "Problem",
        prompt: `A relatable everyday scene showing the frustration that ${subject} solves, muted colors`,
        script: "Tired of doing it the hard way?",
        style: "photographic",
        medium: "image",
        durationSec: 4,
      },
      {
        title: "Solution",
        prompt: `Clean hero shot of ${subject} on a studio pedestal, soft shadows, confident and modern`,
        script: `Meet ${short}.`,
        style: "product-shot",
        medium: "video",
        durationSec: 4,
      },
      {
        title: "Proof",
        prompt: `Bright, optimistic before-and-after showing the benefit of ${subject}`,
        script: "Real results you can see.",
        style: "photographic",
        medium: "image",
        durationSec: 4,
      },
      {
        title: "Call to action",
        prompt: `Bold closing frame with negative space for text, brand gradient background, featuring ${subject}`,
        script: "Try it today — link in bio.",
        style: "flat-illustration",
        medium: "image",
        durationSec: 3,
      },
    ],
  };
}
