import type { Provider, GenerationRequest, GenerationResult } from "./types";
import { buildPlaceholderSvg, svgToDataUrl } from "./placeholder";
import { NON_PHOTO_STYLES, photoUrlForAspect, pickPhoto } from "../photos";

/**
 * The built-in provider. Requires no keys and always works, so Luna is fully
 * usable out of the box: it returns the curated food photo (lib/photos) that
 * best matches the scene's prompt, cropped to the storyboard's aspect — or a
 * style-appropriate SVG frame for illustration looks. Swap it for a real
 * provider once you connect a backend.
 */
export const mockProvider: Provider = {
  id: "mock",
  name: "Luna Preview",
  description:
    "Built-in preview. Matches each scene to curated food photography instantly — no API key required. Great for planning a reel before wiring a real model.",
  capabilities: { image: true, video: true },
  isConfigured: () => true,
  async generate(req: GenerationRequest): Promise<GenerationResult> {
    // Simulate model latency so the generating UI is visible and realistic.
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 900));

    if (!NON_PHOTO_STYLES.includes(req.style)) {
      const photoId = pickPhoto(`${req.sceneTitle ?? ""} ${req.prompt}`, {
        style: req.style,
        seed: req.seed ?? Math.floor(Math.random() * 1000),
      });
      const url = photoUrlForAspect(photoId, req.aspect);
      return {
        url,
        medium: req.medium,
        providerId: "mock",
        posterUrl: req.medium === "video" ? url : undefined,
      };
    }

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
