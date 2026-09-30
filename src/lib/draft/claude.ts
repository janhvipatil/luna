import Anthropic from "@anthropic-ai/sdk";
import type { DraftRequest, DraftScene, DraftStoryboard } from "./types";
import type { SceneMedium, VisualStyle } from "@/lib/types";
import { VISUAL_STYLES } from "@/lib/constants";

const STYLE_IDS = VISUAL_STYLES.map((s) => s.id);

/** JSON schema constraining Claude's tool output to a well-formed storyboard. */
const STORYBOARD_SCHEMA: Anthropic.Tool.InputSchema = {
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
};

const SYSTEM = `You are a creative director for short-form marketing video. Given a brief, produce a tight storyboard of 3–6 scenes that flows well (hook → build → payoff → call to action).

For each scene write:
- title: a 1–2 word beat name (e.g. "Hook", "Problem", "CTA").
- prompt: a vivid visual prompt for an image/video model describing the shot (subject, setting, lighting, mood). Do not mention brand names you weren't given.
- script: one short line of on-screen caption or voiceover for that beat.
- style: the visual look, chosen from the allowed set.
- medium: "image" or "video" — use video sparingly for motion-worthy beats.
- durationSec: 2–6 seconds on screen.

Keep the whole piece punchy — total runtime under ~25 seconds.`;

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function coerceScene(raw: unknown): DraftScene | null {
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

/** Draft a storyboard with Claude. Throws if the API errors or returns junk. */
export async function draftWithClaude({
  brief,
  tone,
}: DraftRequest): Promise<DraftStoryboard> {
  const client = new Anthropic();

  // Force a tool call so Claude returns structured, schema-validated JSON
  // (works across SDK versions, unlike the newer output_config.format).
  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    system: SYSTEM,
    tools: [
      {
        name: "create_storyboard",
        description: "Return the drafted storyboard for the brief.",
        input_schema: STORYBOARD_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "create_storyboard" },
    messages: [
      {
        role: "user",
        content: `Brief: ${brief}${tone ? `\nTone: ${tone}` : ""}`,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("No storyboard returned.");

  const obj = (toolUse.input ?? {}) as Record<string, unknown>;
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
