import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isTtsConfigured, synthesizeSpeech, TtsNotConfiguredError } from "@/lib/narrate/tts";
import { getAiContext } from "@/lib/ai/context";

export const maxDuration = 60;

interface Body {
  text?: string;
  storyboardId?: string;
  sceneId?: string;
}

/**
 * Synthesizes a scene's script to narration audio, stores it in the user's
 * assets folder, and returns the public URL. Returns 422 when no TTS backend is
 * configured so the UI can prompt for a key.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Nothing to narrate." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // Voiceover runs on the user's own Gemini key (or the server's OpenAI key).
  const ctx = await getAiContext(supabase, user.id);
  if (!isTtsConfigured(ctx)) {
    return NextResponse.json({ error: new TtsNotConfiguredError().message }, { status: 422 });
  }

  try {
    const audio = await synthesizeSpeech(text, ctx);
    const folder = body.storyboardId ?? "misc";
    const scene = body.sceneId ?? crypto.randomUUID();
    const path = `${user.id}/${folder}/narration-${scene}-${Date.now()}.${audio.ext}`;

    const { error: upErr } = await supabase.storage
      .from("assets")
      .upload(path, audio.bytes, { contentType: audio.contentType, upsert: true });
    if (upErr) throw upErr;

    const url = supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof TtsNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    const message = err instanceof Error ? err.message : "Narration failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
