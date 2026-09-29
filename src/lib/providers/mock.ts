import type { Provider, GenerationRequest, GenerationResult } from "./types";
import { buildPlaceholderSvg, svgToDataUrl } from "./placeholder";

/**
 * The built-in provider. Requires no keys and always works, so Luna is fully
 * usable out of the box: it returns a style-appropriate SVG frame for images
 * and the same (as a poster) for video. Swap it for a real provider once you
 * connect a backend.
 */
export const mockProvider: Provider = {
  id: "mock",
  name: "Luna Preview",
  description:
    "Built-in placeholder generator. Produces styled preview frames instantly — no API key required. Great for designing flow before wiring a real model.",
  capabilities: { image: true, video: true },
  isConfigured: () => true,
  async generate(req: GenerationRequest): Promise<GenerationResult> {
    // Simulate model latency so the generating UI is visible and realistic.
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 900));

    const svg = buildPlaceholderSvg({
      prompt: req.prompt,
      style: req.style,
      aspect: req.aspect,
      label: req.sceneTitle,
      seed: req.seed,
    });
    const url = svgToDataUrl(svg);

    return {
      url,
      medium: req.medium,
      providerId: "mock",
      posterUrl: req.medium === "video" ? url : undefined,
    };
  },
};
