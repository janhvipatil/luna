import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAiContext } from "@/lib/ai/context";
import { createInteraction, GEMINI_MODELS, outputText } from "@/lib/ai/gemini";

export const maxDuration = 60;

export interface IdeaTheme {
  title: string;
  summary: string;
  ideaIds: string[];
  /** A ready-to-use brief combining the theme's ideas. */
  brief: string;
}

const SCHEMA = {
  type: "object",
  properties: {
    themes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          ideaIds: { type: "array", items: { type: "string" } },
          brief: { type: "string" },
        },
        required: ["title", "summary", "ideaIds", "brief"],
      },
    },
  },
  required: ["themes"],
} as const;

const SYSTEM = `You help a café's marketer make sense of ad ideas the owner jotted down (often rough, half-sentences or transcribed voice notes).
Group the ideas into 2–6 themes. For each theme:
- title: 2–5 words.
- summary: one or two plain sentences on what the owner seems to want, so the marketer understands the vision.
- ideaIds: the ids of the ideas in it (every idea in exactly one theme).
- brief: a 1–2 sentence video brief combining them (what, who for, how it should feel), ready to turn into a storyboard.
Never invent prices, dates or details that aren't in the ideas.`;

/**
 * Groups the user's saved ideas into themes with Gemini (their own key), so the
 * marketer can see the owner's vision at a glance (user-testing request).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You're signed out." }, { status: 401 });

  const ctx = await getAiContext(supabase, user.id);
  if (!ctx.geminiKey) {
    return NextResponse.json(
      { error: "Connect your Gemini key (Profile → Gemini) to organise ideas with AI." },
      { status: 422 },
    );
  }

  const { data: ideas } = await supabase
    .from("ideas")
    .select("id, text")
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!ideas || ideas.length < 2) {
    return NextResponse.json({ error: "Save at least two ideas to organise them." }, { status: 400 });
  }

  try {
    const res = await createInteraction(ctx.geminiKey, {
      model: GEMINI_MODELS.text,
      system_instruction: SYSTEM,
      input: ideas.map((i) => `[${i.id}] ${i.text}`).join("\n"),
      response_format: { type: "text", mime_type: "application/json", schema: SCHEMA },
    });
    const parsed = JSON.parse(outputText(res)) as { themes?: IdeaTheme[] };
    const known = new Set(ideas.map((i) => i.id));
    const themes = (parsed.themes ?? [])
      .map((t) => ({
        title: String(t.title ?? "").trim(),
        summary: String(t.summary ?? "").trim(),
        brief: String(t.brief ?? "").trim(),
        ideaIds: (t.ideaIds ?? []).filter((id) => known.has(id)),
      }))
      .filter((t) => t.title && t.ideaIds.length > 0);
    return NextResponse.json({ themes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't organise ideas.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
