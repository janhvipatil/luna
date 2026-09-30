import type { Provider, GenerationRequest, GenerationResult } from "./types";
import { ProviderNotConfiguredError } from "./types";
import { buildStyledPrompt } from "./prompt";

/**
 * Replicate adapter.
 *
 * Replicate hosts thousands of open-source models behind one API — e.g.
 * `black-forest-labs/flux-schnell` for images and open video models. It becomes
 * live the moment REPLICATE_API_TOKEN is set. Model slugs are overridable via
 * env so you can point Luna at whichever open model you prefer.
 *
 * We create a prediction and poll it to completion rather than relying on the
 * blocking `Prefer: wait` header, because video generations routinely exceed
 * the wait window. The route sets a generous maxDuration to accommodate this.
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

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_MS = 240_000; // 4 min ceiling for slow video models.

interface Prediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[] | null;
  error?: string | null;
  urls?: { get?: string };
}

function firstUrl(output: Prediction["output"]): string | undefined {
  if (Array.isArray(output)) return output.find((o) => typeof o === "string");
  return typeof output === "string" ? output : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Create the prediction.
    const createRes = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        input: {
          prompt: buildStyledPrompt(req),
          aspect_ratio: ASPECT_TO_REPLICATE[req.aspect] ?? "1:1",
          ...(req.seed != null ? { seed: req.seed } : {}),
        },
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Replicate error ${createRes.status}: ${await createRes.text()}`);
    }

    let prediction = (await createRes.json()) as Prediction;
    const pollUrl =
      prediction.urls?.get ?? `https://api.replicate.com/v1/predictions/${prediction.id}`;

    // Poll to completion.
    const deadline = Date.now() + MAX_POLL_MS;
    while (prediction.status === "starting" || prediction.status === "processing") {
      if (Date.now() > deadline) {
        throw new Error("Replicate generation timed out.");
      }
      await sleep(POLL_INTERVAL_MS);
      const pollRes = await fetch(pollUrl, { headers });
      if (!pollRes.ok) {
        throw new Error(`Replicate poll error ${pollRes.status}: ${await pollRes.text()}`);
      }
      prediction = (await pollRes.json()) as Prediction;
    }

    if (prediction.status !== "succeeded") {
      throw new Error(prediction.error || `Replicate prediction ${prediction.status}.`);
    }

    const output = firstUrl(prediction.output);
    if (!output) {
      throw new Error("Replicate returned no output.");
    }

    return { url: output, medium: req.medium, providerId: "replicate" };
  },
};
