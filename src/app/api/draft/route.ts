import { NextResponse } from "next/server";
import type { AspectRatio } from "@/lib/types";
import type { DraftRequest } from "@/lib/draft/types";
import { draftFromTemplate } from "@/lib/draft/fallback";
import { draftWithClaude, isClaudeConfigured } from "@/lib/draft/claude";
import { parseVenue } from "@/lib/venue";
import { draftWithGemini } from "@/lib/draft/gemini";
import { createClient } from "@/lib/supabase/server";
import { getAiContext } from "@/lib/ai/context";

export const maxDuration = 60;

const VALID_ASPECTS: AspectRatio[] = ["9:16", "1:1", "16:9", "4:5"];

/**
 * Drafts a full storyboard from a brief: Gemini on the user's own key, else
 * Claude when ANTHROPIC_API_KEY is set, else a deterministic template so the
 * feature always works. Reports which path produced the result.
 */
export async function POST(request: Request) {
  let body: Partial<DraftRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  if (!brief) {
    return NextResponse.json({ error: "Describe what you want to make." }, { status: 400 });
  }
  const format = VALID_ASPECTS.includes(body.format as AspectRatio)
    ? (body.format as AspectRatio)
    : "9:16";
  const tone = typeof body.tone === "string" ? body.tone.trim() : undefined;

  const venue = parseVenue(body.venue);

  const req: DraftRequest = { brief: brief.slice(0, 1000), format, tone, venue };

  // The user's own Gemini key first, then the operator's Claude key, then a
  // deterministic template — drafting always works.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctx = await getAiContext(supabase, user?.id);
  if (ctx.geminiKey) {
    try {
      const storyboard = await draftWithGemini(req, ctx.geminiKey);
      return NextResponse.json({ storyboard, source: "gemini" });
    } catch (err) {
      console.error("Gemini draft failed:", err);
      if (!isClaudeConfigured()) {
        const message = err instanceof Error ? err.message : "Drafting failed.";
        return NextResponse.json({ storyboard: draftFromTemplate(req), source: "template", warning: message });
      }
    }
  }

  if (isClaudeConfigured()) {
    try {
      const storyboard = await draftWithClaude(req);
      return NextResponse.json({ storyboard, source: "claude" });
    } catch (err) {
      console.error("Claude draft failed, using template:", err);
    }
  }

  return NextResponse.json({ storyboard: draftFromTemplate(req), source: "template" });
}
