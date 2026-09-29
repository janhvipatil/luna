import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Persists a generated asset into the `assets` storage bucket and returns its
 * public URL. Accepts either a data: URL (the mock provider) or a remote URL
 * (hosted providers like Replicate, whose URLs are often short-lived — so we
 * re-host the bytes). Runs server-side, so fetching remote URLs isn't subject
 * to CORS. Files live under the user's own folder to satisfy storage RLS.
 */

const EXT_BY_TYPE: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

async function urlToBytes(url: string): Promise<{ bytes: Buffer; contentType: string }> {
  if (url.startsWith("data:")) {
    const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(url);
    if (!match) throw new Error("Malformed data URL.");
    const contentType = match[1] || "application/octet-stream";
    const bytes = match[2]
      ? Buffer.from(match[3], "base64")
      : Buffer.from(decodeURIComponent(match[3]), "utf8");
    return { bytes, contentType };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch asset (${res.status}).`);
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  return { bytes: Buffer.from(await res.arrayBuffer()), contentType };
}

export async function storeAsset(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: { url: string; storyboardId?: string; sceneId?: string },
): Promise<string> {
  const { bytes, contentType } = await urlToBytes(opts.url);
  const ext = EXT_BY_TYPE[contentType.split(";")[0]] ?? "bin";
  const path = `${userId}/${opts.storyboardId ?? "misc"}/${opts.sceneId ?? crypto.randomUUID()}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("assets")
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw error;

  return supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;
}
