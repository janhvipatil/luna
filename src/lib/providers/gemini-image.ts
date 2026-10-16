import type { AiContext, GenerationRequest, GenerationResult, Provider } from "./types";
import { ProviderNotConfiguredError } from "./types";
import { buildStyledPrompt } from "./prompt";
import { createInteraction, GEMINI_MODELS, outputMedia } from "../ai/gemini";

/**
 * Gemini native image generation ("Nano Banana") on the user's own key.
 *
 * Opt-in (Profile → Gemini → AI images) because it's paid-tier only (~$0.034
 * per 1K image) — by default stills use the free stock-photo preview. Returns a
 * data URL; the generate route re-hosts it in Storage.
 */

/** Aspect ratios Gemini images accept that match Luna's formats one-to-one. */
const ASPECT: Record<GenerationRequest["aspect"], string> = {
  "9:16": "9:16",
  "4:5": "4:5",
  "1:1": "1:1",
  "16:9": "16:9",
};

export const geminiImageProvider: Provider = {
  id: "gemini-image",
  name: "Gemini images",
  description:
    "AI-generated stills with Google's Nano Banana model on your own Gemini key. About $0.03 per image, billed by Google (needs billing enabled).",
  homepage: "https://ai.google.dev/gemini-api/docs/image-generation",
  capabilities: { image: true, video: false },
  configHint: "Connect your Gemini key and turn on AI images in Profile → Gemini.",
  isConfigured: (ctx) => Boolean(ctx.geminiKey && ctx.geminiImages),

  async generate(req: GenerationRequest, ctx: AiContext): Promise<GenerationResult> {
    if (!ctx.geminiKey) throw new ProviderNotConfiguredError("gemini-image", this.configHint);
    const res = await createInteraction(ctx.geminiKey, {
      model: GEMINI_MODELS.image,
      input: [{ type: "text", text: buildStyledPrompt(req) }],
      response_format: {
        type: "image",
        mime_type: "image/jpeg",
        aspect_ratio: ASPECT[req.aspect],
        image_size: "1K",
      },
    });
    const image = outputMedia(res, "image", "image/jpeg");
    if (!image) throw new Error("Gemini returned no image — try rewording the prompt.");
    return {
      url: `data:${image.mimeType};base64,${image.data}`,
      medium: "image",
      providerId: "gemini-image",
    };
  },
};
