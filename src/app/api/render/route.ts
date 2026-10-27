import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rowToStoryboard } from "@/lib/data/mappers";
import type { StoryboardRow } from "@/lib/supabase/types";
import { FORMAT_PRESETS } from "@/lib/constants";
import { isVideoUrl } from "@/lib/utils";
import { buildPlaceholderSvg } from "@/lib/providers/placeholder";
import { composeStoryboard, toTempFile, type RenderScene } from "@/lib/render/compose";
import { buildEndCard, END_CARD_SEC, hasEndCard } from "@/lib/render/endCard";
import { parseBrandKit } from "@/lib/brand";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Longest edge of the server render (keeps encode time reasonable). */
const MAX_EDGE = 1080;

function fitDimensions(width: number, height: number): { w: number; h: number } {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  // libx264 needs even dimensions.
  const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { w: even(width), h: even(height) };
}

async function fetchBytes(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch asset (${res.status}).`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Renders a storyboard to an MP4 server-side (ffmpeg) and returns its URL.
 * Composites real video clips + images with background music and per-scene
 * narration. Requires an ffmpeg-capable runtime.
 */
export async function POST(request: Request) {
  let storyboardId: string | undefined;
  try {
    ({ storyboardId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!storyboardId) {
    return NextResponse.json({ error: "storyboardId is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data } = await supabase.from("storyboards").select("*").eq("id", storyboardId).maybeSingle();
  if (!data) return NextResponse.json({ error: "Storyboard not found." }, { status: 404 });

  const sb = rowToStoryboard(data as StoryboardRow);
  if (sb.scenes.length === 0) {
    return NextResponse.json({ error: "Nothing to render." }, { status: 400 });
  }

  const preset = FORMAT_PRESETS[sb.format];
  const { w, h } = fitDimensions(preset.width, preset.height);

  try {
    // Build render scenes: download video assets to temp files; fetch image
    // bytes (or synthesize a placeholder for ungenerated scenes).
    const scenes: RenderScene[] = [];
    const narration: Array<{ path: string; offsetSec: number }> = [];
    let offset = 0;

    for (const scene of sb.scenes) {
      if (scene.asset && isVideoUrl(scene.asset.url)) {
        const bytes = await fetchBytes(scene.asset.url);
        const ext = scene.asset.url.includes(".webm") ? "webm" : "mp4";
        scenes.push({ videoPath: await toTempFile(bytes, ext), durationSec: scene.durationSec });
      } else if (scene.asset) {
        scenes.push({ image: await fetchBytes(scene.asset.url), durationSec: scene.durationSec });
      } else {
        const svg = buildPlaceholderSvg({
          prompt: scene.prompt,
          style: scene.style,
          aspect: sb.format,
          label: scene.title,
        });
        scenes.push({ image: Buffer.from(svg, "utf8"), durationSec: scene.durationSec });
      }

      if (scene.narrationUrl) {
        const bytes = await fetchBytes(scene.narrationUrl);
        narration.push({ path: await toTempFile(bytes, "mp3"), offsetSec: offset });
      }
      offset += scene.durationSec;
    }

    // Close on the café's branded card, like the browser export.
    const { data: profile } = await supabase
      .from("profiles")
      .select("brand_kit")
      .eq("id", user.id)
      .maybeSingle();
    const brand = parseBrandKit(profile?.brand_kit);
    if (hasEndCard(brand)) {
      scenes.push({ image: await buildEndCard(brand, w, h), durationSec: END_CARD_SEC });
    }

    const musicPath = sb.musicUrl
      ? await toTempFile(await fetchBytes(sb.musicUrl), "mp3")
      : undefined;

    const mp4 = await composeStoryboard({ width: w, height: h, scenes, musicPath, narration });

    const path = `${user.id}/${sb.id}/render-${Date.now()}.mp4`;
    const { error: upErr } = await supabase.storage
      .from("assets")
      .upload(path, mp4, { contentType: "video/mp4", upsert: true });
    if (upErr) throw upErr;

    const url = supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Render failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
