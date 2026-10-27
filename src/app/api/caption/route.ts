import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAiContext } from "@/lib/ai/context";
import { geminiCaption, templateCaption, type CaptionInput } from "@/lib/caption";
import { parseVenue } from "@/lib/venue";

export const maxDuration = 60;

/**
 * Writes the caption to paste when posting a finished video: Gemini on the
 * user's own key, else a caption assembled from the storyboard's own lines.
 */
export async function POST(request: Request) {
  let body: Partial<CaptionInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input: CaptionInput = {
    title: typeof body.title === "string" ? body.title.slice(0, 200) : "",
    description: typeof body.description === "string" ? body.description.slice(0, 500) : "",
    scripts: Array.isArray(body.scripts)
      ? body.scripts.filter((s): s is string => typeof s === "string").map((s) => s.slice(0, 300)).slice(0, 12)
      : [],
    venue: parseVenue(body.venue),
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctx = await getAiContext(supabase, user?.id);

  if (ctx.geminiKey) {
    try {
      return NextResponse.json({ ...(await geminiCaption(input, ctx.geminiKey)), source: "gemini" });
    } catch (err) {
      console.error("Gemini caption failed, using template:", err);
    }
  }
  return NextResponse.json({ ...templateCaption(input), source: "template" });
}
