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
