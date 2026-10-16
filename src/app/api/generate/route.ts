import { NextResponse } from "next/server";
import { resolveProvider } from "@/lib/providers";
import { ProviderNotConfiguredError } from "@/lib/providers/types";
import type { GenerationRequest } from "@/lib/providers";
import type { AspectRatio, SceneMedium, VisualStyle } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { storeAsset } from "@/lib/data/storeAsset";
import { getAiContext } from "@/lib/ai/context";

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

  const {
    prompt,
    style,
    medium,
    aspect,
    sceneTitle,
    seed,
    durationSec,
    startImageUrl,
    providerId,
    storyboardId,
    sceneId,
  } = body;

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
    durationSec: typeof durationSec === "number" ? durationSec : undefined,
    startImageUrl:
      typeof startImageUrl === "string" && /^https:\/\//.test(startImageUrl)
        ? startImageUrl
        : undefined,
  };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The user's own keys (bring-your-own-key) decide which providers can run.
  const ctx = await getAiContext(supabase, user?.id);
  const provider = resolveProvider(providerId, req, ctx);

  // Record a durable job so a generation that finishes after the client
  // disconnects isn't lost — the client reconciles ready jobs on next load.
  // Only when we have a user + a scene to attach it to.
  let jobId: string | null = null;
  if (user && storyboardId && sceneId) {
    const { data: job } = await supabase
      .from("generation_jobs")
      .insert({ storyboard_id: storyboardId, scene_id: sceneId, status: "processing" })
      .select("id")
      .maybeSingle();
    jobId = job?.id ?? null;
  }

  // Long-running providers (Veo): start the job and let the client poll
  // /api/generate/jobs/[id]. Requires a job row to hold the operation.
  if (provider.start) {
    if (!jobId) {
      return NextResponse.json(
        { error: "Sign in and open a storyboard to generate video." },
        { status: 401 },
      );
    }
    try {
      const { operation } = await provider.start(req, ctx);
      await supabase
        .from("generation_jobs")
        // The start frame (if any) doubles as the clip's poster/thumbnail.
        .update({
          status: "pending",
          provider_id: provider.id,
          operation,
          result: req.startImageUrl ? { posterUrl: req.startImageUrl } : null,
        })
        .eq("id", jobId);
      return NextResponse.json(
        { pending: true, jobId, resolvedProviderId: provider.id },
        { status: 202 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      await supabase.from("generation_jobs").update({ status: "error", error: message }).eq("id", jobId);
      const status = err instanceof ProviderNotConfiguredError ? 422 : 502;
      return NextResponse.json({ error: message }, { status });
    }
  }

  try {
    const result = await provider.generate(req, ctx);
    const resolved = provider;

    // Re-host the asset in Supabase Storage so it survives (provider URLs can
    // expire) and doesn't bloat the storyboard row. Best-effort: if storage
    // fails, fall back to the provider URL so generation still succeeds.
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

    // The normalized asset the client stores on the scene — also persisted on
    // the job so it can be recovered after a disconnect.
    const asset = {
      url,
      medium: result.medium,
      providerId: resolved.id,
      posterUrl,
      createdAt: Date.now(),
    };

    if (jobId) {
      await supabase
        .from("generation_jobs")
        .update({ status: "ready", result: asset })
        .eq("id", jobId);
    }

    return NextResponse.json({ ...result, ...asset, resolvedProviderId: resolved.id });
  } catch (err) {
    const status = err instanceof ProviderNotConfiguredError ? 422 : 502;
    const message = err instanceof Error ? err.message : "Generation failed.";
    if (jobId) {
      await supabase.from("generation_jobs").update({ status: "error", error: message }).eq("id", jobId);
    }
    return NextResponse.json({ error: message }, { status });
  }
}
