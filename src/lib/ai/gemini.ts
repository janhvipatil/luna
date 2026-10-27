/**
 * Minimal Gemini API client (REST, no SDK) for the user's own API key.
 *
 * Text, speech and images go through the Interactions API
 * (`POST /v1beta/interactions`), including video with Gemini Omni Flash
 * (providers/gemini-omni.ts); Veo uses `predictLongRunning` in providers/veo.ts. Requests set `store: false` so Google doesn't keep the
 * interaction server-side — Luna stores what it needs itself.
 *
 * @see https://ai.google.dev/gemini-api/docs/interactions
 */

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const GEMINI_MODELS = {
  /** Storyboard drafting — available on the free tier. */
  text: process.env.GEMINI_TEXT_MODEL ?? "gemini-3.8-flash",
  /** Voiceover — available on the free tier. */
  tts: process.env.GEMINI_TTS_MODEL ?? "gemini-3.8-flash-tts",
  /** AI stills ("Nano Banana") — paid tier only, ~$0.034 per 1K image. */
  image: process.env.GEMINI_IMAGE_MODEL ?? "gemini-nano-banana-2.1",
} as const;

/** Default video model — text/photo-to-video with native audio, 3–10 s clips. */
export const OMNI_VIDEO_MODEL = process.env.GEMINI_VIDEO_MODEL ?? "gemini-omni-1.1-flash";

export const VEO_MODELS = {
  lite: "veo-3.1-lite-generate-preview",
  fast: "veo-3.1-fast-generate-preview",
  standard: "veo-3.1-generate-preview",
} as const;
export type VeoTier = keyof typeof VEO_MODELS;
/** The user's video model: Omni Flash (default) or one of the Veo 3.1 tiers. */
export type VideoTier = "omni" | VeoTier;

/** USD per generated second at 720p, from the Gemini pricing page. */
export const VEO_PRICE_PER_SECOND: Record<VeoTier, number> = { lite: 0.05, fast: 0.1, standard: 0.4 };
/** Omni Flash at 720p: ~5,792 output tokens per second at $17.50 / 1M. */
export const OMNI_PRICE_PER_SECOND = 0.1;

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

/** Turn an API error into something a café owner can act on. */
function friendly(status: number, message: string): string {
  if (status === 400 && /api key/i.test(message)) return "Your Gemini API key isn't valid — reconnect it in Profile → Gemini.";
  if (status === 403) return `Gemini refused this request (${message}). Paid features (video, AI images) need billing enabled on your Google project.`;
  if (status === 429) return "Your Gemini key hit its rate limit or free-tier quota. Wait a minute, or enable billing for higher limits.";
  return `Gemini: ${message}`;
}

export async function geminiFetch<T = unknown>(
  apiKey: string,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${GEMINI_BASE_URL}/${path}`, {
    method: init?.method ?? (init?.body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message ?? `request failed (${res.status})`;
    throw new GeminiError(friendly(res.status, message), res.status);
  }
  return data as T;
}

interface ContentBlock {
  type?: string;
  text?: string;
  data?: string;
  mime_type?: string;
  mimeType?: string;
}
interface InteractionResponse {
  steps?: Array<{ type?: string; content?: ContentBlock[] }>;
}

/** Content blocks from the model's output steps, in order. */
function outputBlocks(res: InteractionResponse): ContentBlock[] {
  return (res.steps ?? [])
    .filter((s) => s.type === "model_output")
    .flatMap((s) => s.content ?? []);
}

/** Create an interaction (stateless) and return the raw response. */
export function createInteraction(apiKey: string, body: Record<string, unknown>) {
  return geminiFetch<InteractionResponse>(apiKey, "interactions", { body: { store: false, ...body } });
}

export function outputText(res: InteractionResponse): string {
  return outputBlocks(res)
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
}

/** The last image or audio block, as base64 + mime type. */
export function outputMedia(
  res: InteractionResponse,
  kind: "image" | "audio",
  fallbackMime: string,
): { data: string; mimeType: string } | null {
  const block = outputBlocks(res)
    .filter((b) => b.type === kind && b.data)
    .at(-1);
  if (!block?.data) return null;
  return { data: block.data, mimeType: block.mime_type ?? block.mimeType ?? fallbackMime };
}

/** Cheap validity check for a key: list one model. */
export async function verifyGeminiKey(apiKey: string): Promise<void> {
  await geminiFetch(apiKey, "models?pageSize=1");
}
