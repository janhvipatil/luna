import { NextResponse, type NextRequest } from "next/server";
import { getProvider } from "@/lib/providers";
import { createClient } from "@/lib/supabase/server";
import { storeAsset } from "@/lib/data/storeAsset";
import { getAiContext } from "@/lib/ai/context";

// Downloading + re-hosting a finished clip can take a little while.
export const maxDuration = 120;

/** Poster stashed on the job when it started (the image-to-video start frame). */
function pendingPoster(result: unknown): string | undefined {
  const poster = (result as { posterUrl?: unknown } | null)?.posterUrl;
  return typeof poster === "string" ? poster : undefined;
}

/**
 * Polls a long-running generation job (e.g. Veo). The client calls this every
 * few seconds after /api/generate returns `pending`. When the provider reports
 * the clip is done, the video is copied into Supabase Storage (provider files
 * expire) and the job is marked ready with the final asset. Safe to call again
 * after completion — it just returns the stored result.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/generate/jobs/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You're signed out." }, { status: 401 });

  // RLS limits this to the caller's own jobs.
  const { data: job } = await supabase
    .from("generation_jobs")
    .select("id, status, result, error, provider_id, operation, storyboard_id, scene_id")
    .eq("id", id)
    .maybeSingle();
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  if (job.status === "ready") return NextResponse.json({ status: "ready", asset: job.result });
  if (job.status === "error") return NextResponse.json({ status: "error", error: job.error });

  const provider = job.provider_id ? getProvider(job.provider_id) : undefined;
  if (!provider?.poll || !job.operation) {
    return NextResponse.json({ status: "pending" });
  }

  try {
    const ctx = await getAiContext(supabase, user.id);
    const poll = await provider.poll(job.operation, ctx);
    if (!poll.done) return NextResponse.json({ status: "pending" });

    if ("error" in poll) {
      await supabase.from("generation_jobs").update({ status: "error", error: poll.error }).eq("id", id);
      return NextResponse.json({ status: "error", error: poll.error });
    }

    const url = await storeAsset(supabase, user.id, {
      url: poll.result.url,
      storyboardId: job.storyboard_id,
      sceneId: job.scene_id,
      headers: provider.downloadHeaders?.(ctx),
      contentType: poll.result.medium === "video" ? "video/mp4" : undefined,
    });
    const asset = {
      url,
      medium: poll.result.medium,
      providerId: provider.id,
      posterUrl: poll.result.posterUrl ?? pendingPoster(job.result),
      createdAt: Date.now(),
    };
    await supabase.from("generation_jobs").update({ status: "ready", result: asset }).eq("id", id);
    return NextResponse.json({ status: "ready", asset });
  } catch (err) {
    // Transient failures (network, storage) shouldn't kill the job — the next
    // poll retries. Report them so the client can surface persistent errors.
    const message = err instanceof Error ? err.message : "Polling failed.";
    console.error(`Polling job ${id} failed:`, err);
    return NextResponse.json({ status: "pending", warning: message });
  }
}
