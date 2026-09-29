import { NextResponse } from "next/server";
import { generate, resolveProvider } from "@/lib/providers";
import { ProviderNotConfiguredError } from "@/lib/providers/types";
import type { GenerationRequest } from "@/lib/providers";
import type { AspectRatio, SceneMedium, VisualStyle } from "@/lib/types";

const VALID_ASPECTS: AspectRatio[] = ["9:16", "1:1", "16:9", "4:5"];
const VALID_MEDIA: SceneMedium[] = ["image", "video"];

interface Body extends Partial<GenerationRequest> {
  providerId?: string;
}

/**
 * Generation endpoint. Validates the request, delegates to the resolved
 * provider, and returns a normalized asset. Runs on the Node runtime because
 * some backends (and the placeholder encoder) rely on Node APIs.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { prompt, style, medium, aspect, sceneTitle, seed, providerId } = body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
  }
  if (!aspect || !VALID_ASPECTS.includes(aspect)) {
    return NextResponse.json({ error: "Invalid aspect ratio." }, { status: 400 });
  }
  if (!medium || !VALID_MEDIA.includes(medium)) {
    return NextResponse.json({ error: "Invalid medium." }, { status: 400 });
  }

  const req: GenerationRequest = {
    prompt: prompt.slice(0, 2000),
    style: (style as VisualStyle) ?? "cinematic",
    medium,
    aspect,
    sceneTitle: sceneTitle?.slice(0, 120),
    seed: typeof seed === "number" ? seed : undefined,
  };

  try {
    const result = await generate(providerId, req);
    // Report which provider actually ran, in case of fallback.
    const resolved = resolveProvider(providerId, req);
    return NextResponse.json({ ...result, resolvedProviderId: resolved.id });
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
