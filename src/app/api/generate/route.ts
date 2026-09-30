import { NextResponse } from "next/server";
import { generate, resolveProvider } from "@/lib/providers";
import { ProviderNotConfiguredError } from "@/lib/providers/types";
import type { GenerationRequest } from "@/lib/providers";
import type { AspectRatio, SceneMedium, VisualStyle } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { storeAsset } from "@/lib/data/storeAsset";

// Video generations can run for minutes; allow the function room to finish.
// (On Vercel this requires Fluid compute, which is on by default.)
export const maxDuration = 300;

const VALID_ASPECTS: AspectRatio[] = ["9:16", "1:1", "16:9", "4:5"];
const VALID_MEDIA: SceneMedium[] = ["image", "video"];

interface Body extends Partial<GenerationRequest> {
  providerId?: string;
  storyboardId?: string;
  sceneId?: string;
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

  const { prompt, style, medium, aspect, sceneTitle, seed, providerId, storyboardId, sceneId } =
    body;

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

    // Re-host the asset in Supabase Storage so it survives (provider URLs can
    // expire) and doesn't bloat the storyboard row. Best-effort: if storage
    // fails, fall back to the provider URL so generation still succeeds.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let url = result.url;
    let posterUrl = result.posterUrl;
    if (user) {
      try {
        url = await storeAsset(supabase, user.id, { url: result.url, storyboardId, sceneId });
        if (posterUrl && posterUrl !== result.url) {
          posterUrl = await storeAsset(supabase, user.id, {
            url: posterUrl,
            storyboardId,
            sceneId: sceneId ? `${sceneId}-poster` : undefined,
          });
        } else if (posterUrl) {
          posterUrl = url;
        }
      } catch (storageErr) {
        console.error("Asset storage failed, using provider URL:", storageErr);
      }
    }

    return NextResponse.json({ ...result, url, posterUrl, resolvedProviderId: resolved.id });
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
