// Server-only: reads and decrypts the signed-in user's AI settings.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { decryptSecret } from "./secrets";
import type { VideoTier } from "./gemini";

/**
 * Everything a provider needs to run on the user's own account. Passed to every
 * provider call; nothing here ever reaches the browser except via AiStatus.
 */
export interface AiContext {
  /** The user's decrypted Gemini API key, if they've connected one. */
  geminiKey?: string;
  /** Opt-in: generate stills with Gemini images (paid) instead of stock photos. */
  geminiImages: boolean;
  /** Which Veo tier video scenes use. */
  videoTier: VideoTier;
}

/** Safe-to-share summary of a user's AI settings (for the UI). */
export interface AiStatus {
  geminiConnected: boolean;
  geminiKeyHint: string | null;
  geminiImages: boolean;
  videoTier: VideoTier;
}

export const EMPTY_AI_CONTEXT: AiContext = { geminiImages: false, videoTier: "fast" };

function asTier(value: string | null | undefined): VideoTier {
  return value === "lite" || value === "standard" ? value : "fast";
}

export async function getAiContext(
  supabase: SupabaseClient<Database>,
  userId: string | undefined,
): Promise<AiContext> {
  if (!userId) return EMPTY_AI_CONTEXT;
  const { data } = await supabase
    .from("user_ai_settings")
    .select("gemini_key_encrypted, gemini_images, video_model")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return EMPTY_AI_CONTEXT;
  let geminiKey: string | undefined;
  if (data.gemini_key_encrypted) {
    try {
      geminiKey = decryptSecret(data.gemini_key_encrypted);
    } catch (err) {
      console.error("Could not decrypt the stored Gemini key:", err);
    }
  }
  return { geminiKey, geminiImages: data.gemini_images, videoTier: asTier(data.video_model) };
}

export async function getAiStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AiStatus> {
  const { data } = await supabase
    .from("user_ai_settings")
    .select("gemini_key_hint, gemini_key_encrypted, gemini_images, video_model")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    geminiConnected: Boolean(data?.gemini_key_encrypted),
    geminiKeyHint: data?.gemini_key_hint ?? null,
    geminiImages: data?.gemini_images ?? false,
    videoTier: asTier(data?.video_model),
  };
}
