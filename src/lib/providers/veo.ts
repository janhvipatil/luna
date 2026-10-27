import type { AiContext, GenerationRequest, GenerationResult, PollResult, Provider } from "./types";
import { ProviderNotConfiguredError } from "./types";
import { buildStyledPrompt } from "./prompt";
import { geminiFetch, VEO_MODELS, VEO_PRICE_PER_SECOND } from "../ai/gemini";

/**
 * Google Veo 3.1 adapter (Gemini API) — the video model behind Google Flow.
 * Runs on the user's own Gemini key (bring-your-own-key), at the Veo tier they
 * picked (Lite / Fast / Standard), so generation is billed to their account.
 *
 * Veo jobs take from ~11 seconds to several minutes, so this provider is
 * asynchronous: `start` submits a long-running operation and `poll` checks it.
 * The API route stores the operation on a generation job and the client polls
 * until the clip is ready, so nothing blocks a serverless function for minutes.
 *
 * Supports text-to-video and image-to-video (animating a scene's still or an
 * uploaded photo of a real dish). Veo outputs 16:9 or 9:16 only — square and
 * 4:5 storyboards are generated vertically and cover-cropped on playback and
 * export. Clips are 4, 6 or 8 seconds with native audio. Result files are
 * deleted by Google after 2 days, so the route re-hosts them in Storage.
 *
 * @see https://ai.google.dev/gemini-api/docs/veo
 */

const RESOLUTION = process.env.VEO_RESOLUTION ?? "720p";
const CLIP_LENGTHS = [4, 6, 8] as const;

function apiKey(ctx: AiContext): string {
  if (!ctx.geminiKey) throw new ProviderNotConfiguredError("veo", veoProvider.configHint);
  return ctx.geminiKey;
}

/** Shortest Veo clip that covers the scene (longer scenes loop the 8s clip). */
export function veoClipLength(durationSec = 4): (typeof CLIP_LENGTHS)[number] {
  return CLIP_LENGTHS.find((len) => len >= durationSec) ?? 8;
}

/** Veo only renders landscape or vertical; everything else goes vertical. */
export function veoAspect(aspect: GenerationRequest["aspect"]): "16:9" | "9:16" {
  return aspect === "16:9" ? "16:9" : "9:16";
}

export async function imagePart(url: string): Promise<{ mimeType: string; data: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load the start image (${res.status}).`);
  const mimeType = (res.headers.get("content-type") ?? "").split(";")[0];
  if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
    throw new Error("Video models can only animate JPEG or PNG images — use a photo for the start frame.");
  }
  return { mimeType, data: Buffer.from(await res.arrayBuffer()).toString("base64") };
}


interface VeoOperation {
  name: string;
  done?: boolean;
  error?: { message?: string };
  response?: {
    generateVideoResponse?: {
      generatedSamples?: Array<{ video?: { uri?: string } }>;
      raiMediaFilteredReasons?: string[];
    };
  };
}

export const veoProvider: Provider = {
  id: "veo",
  name: "Google Veo 3.1",
  description: `Google's video model (the one behind Flow), on your own Gemini key. Vertical 9:16 clips with native sound; animates your stills or uploaded dish photos. Lite $${VEO_PRICE_PER_SECOND.lite.toFixed(2)}/s · Fast $${VEO_PRICE_PER_SECOND.fast.toFixed(2)}/s · Standard $${VEO_PRICE_PER_SECOND.standard.toFixed(2)}/s at 720p, billed by Google.`,
  homepage: "https://ai.google.dev/gemini-api/docs/veo",
  capabilities: { image: false, video: true },
  configHint: "Connect your Gemini API key in Profile → Gemini (video needs billing enabled).",
  // Omni Flash is the default; Veo runs when the user picked a Veo tier.
  isConfigured: (ctx) => Boolean(ctx.geminiKey) && ctx.videoTier !== "omni",

  async generate(): Promise<GenerationResult> {
    // Veo is long-running; the route always uses start/poll for it.
    throw new Error("Veo generations are asynchronous — use start/poll.");
  },

  async start(req: GenerationRequest, ctx: AiContext) {
    const instance: Record<string, unknown> = { prompt: buildStyledPrompt(req) };
    const parameters: Record<string, unknown> = {
      aspectRatio: veoAspect(req.aspect),
      // Above 720p Veo only renders 8-second clips.
      durationSeconds: String(RESOLUTION === "720p" ? veoClipLength(req.durationSec) : 8),
      resolution: RESOLUTION,
    };
    if (req.startImageUrl) {
      instance.image = { inlineData: await imagePart(req.startImageUrl) };
      // Image-to-video only permits adult-person generation (and it's the only
      // value allowed in the EU/UK/CH/MENA regions).
      parameters.personGeneration = "allow_adult";
    }

    const model = VEO_MODELS[ctx.videoTier === "omni" ? "fast" : ctx.videoTier];
    const op = await geminiFetch<VeoOperation>(apiKey(ctx), `models/${model}:predictLongRunning`, {
      body: { instances: [instance], parameters },
    });
    if (!op.name) throw new Error("Veo did not return an operation.");
    return { operation: op.name };
  },

  async poll(operation: string, ctx: AiContext): Promise<PollResult> {
    const op = await geminiFetch<VeoOperation>(apiKey(ctx), operation);
    if (!op.done) return { done: false };
    if (op.error) return { done: true, error: `Veo: ${op.error.message ?? "generation failed."}` };

    const res = op.response?.generateVideoResponse;
    const uri = res?.generatedSamples?.[0]?.video?.uri;
    if (!uri) {
      const reason = res?.raiMediaFilteredReasons?.[0];
      return {
        done: true,
        error: reason
          ? `Veo blocked this clip: ${reason}`
          : "Veo finished without a video. Try rewording the prompt.",
      };
    }
    return { done: true, result: { url: uri, medium: "video", providerId: "veo" } };
  },

  downloadHeaders: (ctx) => ({ "x-goog-api-key": apiKey(ctx) }),
};
