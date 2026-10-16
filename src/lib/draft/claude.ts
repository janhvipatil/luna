import Anthropic from "@anthropic-ai/sdk";
import type { DraftRequest, DraftStoryboard } from "./types";
import { coerceStoryboard, DRAFT_SYSTEM_PROMPT, draftUserMessage, STORYBOARD_SCHEMA } from "./shared";

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Draft a storyboard with Claude. Throws if the API errors or returns junk. */
export async function draftWithClaude(req: DraftRequest): Promise<DraftStoryboard> {
  const client = new Anthropic();

  // Force a tool call so Claude returns structured, schema-validated JSON
  // (works across SDK versions, unlike the newer output_config.format).
  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    system: DRAFT_SYSTEM_PROMPT,
    tools: [
      {
        name: "create_storyboard",
        description: "Return the drafted storyboard for the brief.",
        input_schema: STORYBOARD_SCHEMA as unknown as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: "create_storyboard" },
    messages: [{ role: "user", content: draftUserMessage(req) }],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("No storyboard returned.");
  return coerceStoryboard(toolUse.input, req.brief);
}
