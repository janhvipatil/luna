import type { AiContext, GenerationRequest, GenerationResult, Provider } from "./types";
import { ProviderNotConfiguredError } from "./types";
import { buildStyledPrompt } from "./prompt";
import { imagePart, veoAspect } from "./veo";
import { createInteraction, OMNI_PRICE_PER_SECOND, OMNI_VIDEO_MODEL } from "../ai/gemini";

/**
 * Gemini Omni Flash adapter — Google's current video model, on the Interactions
 * API with the user's own Gemini key (paid tier only, billed by Google).
 *
 * Text-to-video, or first-frame-to-video when the scene has a still or an
 * uploaded photo of the real dish: the image is sent inline and the prompt is
 * tagged `<FIRST_FRAME>` so the clip starts exactly on it. Clips are 3–10 s,
 * 9:16 or 16:9, with native audio. Image inputs work in the EEA (only video
 * uploads for editing are region-restricted).
 *
 * Generation is a single synchronous call (as in Google's Omni skill); the
 * generate route allows up to 5 minutes. The video comes back as a Files API
 * URI which we download here and hand on as a data URL, so the route can
 * re-host it in Storage without needing the key.
 *
 * @see https://ai.google.dev/gemini-api/docs/omni
 */

const RESOLUTION = process.env.OMNI_RESOLUTION ?? "720p";

function apiKey(ctx: AiContext): string {
  if (!ctx.geminiKey) throw new ProviderNotConfiguredError("gemini-omni", geminiOmniProvider.configHint);
  return ctx.geminiKey;
}

/** Omni renders whole seconds between 3 and 10. */
export function omniDuration(durationSec = 4): string {
  return `${Math.min(10, Math.max(3, Math.ceil(durationSec)))}s`;
}

interface VideoBlock {
  type?: string;
  uri?: string;
  data?: string;
  mime_type?: string;
}

async function download(uri: string, key: string): Promise<Buffer> {
  const res = await fetch(uri, { headers: { "x-goog-api-key": key }, redirect: "follow" });
  if (!res.ok) throw new Error(`Could not download the Omni clip (${res.status}).`);
  return Buffer.from(await res.arrayBuffer());
}

export const geminiOmniProvider: Provider = {
  id: "gemini-omni",
  name: "Gemini Omni Flash",
  description: `Google's newest video model, on your own Gemini key. Brings your stills or uploaded dish photos to life as 3–10 s vertical clips with native sound. About $${OMNI_PRICE_PER_SECOND.toFixed(2)}/s at 720p, billed by Google.`,
  homepage: "https://ai.google.dev/gemini-api/docs/omni",
  capabilities: { image: false, video: true },
  configHint: "Connect your Gemini API key in Profile → Gemini (video needs billing enabled).",
  isConfigured: (ctx) => Boolean(ctx.geminiKey) && ctx.videoTier === "omni",

  async generate(req: GenerationRequest, ctx: AiContext): Promise<GenerationResult> {
    const key = apiKey(ctx);
    const prompt = buildStyledPrompt(req);
    const input = req.startImageUrl
      ? await imagePart(req.startImageUrl).then((img) => [
          { type: "image", data: img.data, mime_type: img.mimeType },
          { type: "text", text: `<FIRST_FRAME> ${prompt}` },
        ])
      : prompt;

    const res = await createInteraction(key, {
      model: OMNI_VIDEO_MODEL,
      input,
      response_format: {
        type: "video",
        delivery: "uri",
        aspect_ratio: veoAspect(req.aspect),
        duration: omniDuration(req.durationSec),
        resolution: RESOLUTION,
      },
    });

    const video = (res.steps ?? [])
      .filter((s) => s.type === "model_output")
      .flatMap((s) => (s.content ?? []) as VideoBlock[])
      .filter((b) => b.type === "video")
      .at(-1);
    if (!video?.uri && !video?.data) {
      throw new Error("Omni finished without a video — it may have been blocked. Try rewording the prompt.");
    }
    const mime = video.mime_type ?? "video/mp4";
    const bytes = video.data ? Buffer.from(video.data, "base64") : await download(video.uri!, key);
    return {
      url: `data:${mime};base64,${bytes.toString("base64")}`,
      medium: "video",
      providerId: "gemini-omni",
      posterUrl: req.startImageUrl,
    };
  },
};
