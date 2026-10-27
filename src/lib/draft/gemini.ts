import type { DraftRequest, DraftStoryboard } from "./types";
import { coerceStoryboard, DRAFT_SYSTEM_PROMPT, draftUserMessage, STORYBOARD_SCHEMA } from "./shared";
import { createInteraction, GEMINI_MODELS, outputText } from "@/lib/ai/gemini";

/**
 * Draft a storyboard with Gemini on the user's own key, using structured JSON
 * output (works on the free tier). Throws if the API errors or returns junk.
 */
export async function draftWithGemini(req: DraftRequest, apiKey: string): Promise<DraftStoryboard> {
  const res = await createInteraction(apiKey, {
    model: GEMINI_MODELS.text,
    system_instruction: DRAFT_SYSTEM_PROMPT,
    input: draftUserMessage(req),
    response_format: { type: "text", mime_type: "application/json", schema: STORYBOARD_SCHEMA },
  });
  const text = outputText(res);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned a draft that wasn't valid JSON.");
  }
  return coerceStoryboard(parsed, req.brief);
}

const OPTIONS_INSTRUCTION = `Return exactly three storyboards in "options", each a genuinely different concept for the same brief:
1. Up close — sensory food and drink shots (steam, pours, textures, first bite).
2. Behind the counter — the people and craft that make it (hands, team, preparation).
3. Through a guest's eyes — the experience and atmosphere of visiting.
Give each a short, distinct title that names its angle.`;

/** Three distinct storyboard concepts in one call, for "pick one of three". */
export async function draftOptionsWithGemini(req: DraftRequest, apiKey: string): Promise<DraftStoryboard[]> {
  const res = await createInteraction(apiKey, {
    model: GEMINI_MODELS.text,
    system_instruction: `${DRAFT_SYSTEM_PROMPT}\n\n${OPTIONS_INSTRUCTION}`,
    input: draftUserMessage(req),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: {
        type: "object",
        properties: { options: { type: "array", items: STORYBOARD_SCHEMA } },
        required: ["options"],
      },
    },
  });
  let parsed: { options?: unknown[] };
  try {
    parsed = JSON.parse(outputText(res));
  } catch {
    throw new Error("Gemini returned options that weren't valid JSON.");
  }
  const options = (parsed.options ?? []).flatMap((o) => {
    try {
      return [coerceStoryboard(o, req.brief)];
    } catch {
      return [];
    }
  });
  if (options.length === 0) throw new Error("Gemini returned no usable options.");
  return options.slice(0, 3);
}
