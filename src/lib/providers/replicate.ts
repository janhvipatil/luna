import type { Provider, GenerationRequest, GenerationResult } from "./types";
import { ProviderNotConfiguredError } from "./types";
import { buildStyledPrompt } from "./prompt";

/**
 * Replicate adapter (skeleton).
 *
 * Replicate hosts thousands of open-source models behind one API — e.g.
 * `black-forest-labs/flux-schnell` for images and a range of open video models.
 * This adapter is intentionally minimal and self-contained: it becomes live the
 * moment REPLICATE_API_TOKEN is set. Model slugs are overridable via env so you
 * can point Luna at whichever open model you prefer without code changes.
 *
 * @see https://replicate.com
 */

const IMAGE_MODEL = process.env.REPLICATE_IMAGE_MODEL ?? "black-forest-labs/flux-schnell";
const VIDEO_MODEL = process.env.REPLICATE_VIDEO_MODEL ?? "";

const ASPECT_TO_REPLICATE: Record<string, string> = {
  "9:16": "9:16",
  "4:5": "4:5",
  "1:1": "1:1",
  "16:9": "16:9",
};

export const replicateProvider: Provider = {
  id: "replicate",
  name: "Replicate",
  description:
    "Run open-source image and video models (FLUX, SDXL, and more) through Replicate's hosted API.",
  homepage: "https://replicate.com",
  capabilities: { image: true, video: Boolean(VIDEO_MODEL) },
  configHint: "Set REPLICATE_API_TOKEN in your environment.",
  isConfigured: () => Boolean(process.env.REPLICATE_API_TOKEN),

  async generate(req: GenerationRequest): Promise<GenerationResult> {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new ProviderNotConfiguredError("replicate", this.configHint);
    }

    const model = req.medium === "video" ? VIDEO_MODEL : IMAGE_MODEL;
    if (!model) {
      throw new ProviderNotConfiguredError(
        "replicate",
        `No model configured for medium "${req.medium}". Set REPLICATE_VIDEO_MODEL.`,
      );
    }

    // Replicate's "run and wait" endpoint blocks until the prediction resolves,
    // which keeps this adapter free of polling logic.
    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt: buildStyledPrompt(req),
          aspect_ratio: ASPECT_TO_REPLICATE[req.aspect] ?? "1:1",
          ...(req.seed != null ? { seed: req.seed } : {}),
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Replicate error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as { output?: string | string[] };
    const output = Array.isArray(data.output) ? data.output[0] : data.output;
    if (!output) {
      throw new Error("Replicate returned no output.");
    }

    return { url: output, medium: req.medium, providerId: "replicate" };
  },
};
