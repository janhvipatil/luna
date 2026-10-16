import type { AiContext } from "@/lib/ai/context";
import { createInteraction, GEMINI_MODELS, outputMedia } from "@/lib/ai/gemini";

/**
 * Text-to-speech synthesis for scene narration.
 *
 * Pluggable like the image/video providers: Gemini TTS on the user's own key
 * (free tier) first, then OpenAI when OPENAI_API_KEY is set on the server;
 * otherwise reports not-configured so the UI can explain. Called over plain
 * fetch so there's no extra SDK dependency. Returns raw audio bytes that the
 * route stores in the assets bucket.
 */

/** Gemini voice for narration (a warm, clear prebuilt voice). */
const GEMINI_VOICE = process.env.GEMINI_TTS_VOICE ?? "Kore";

export interface SynthesizedAudio {
  bytes: Buffer;
  contentType: string;
  ext: string;
}

export class TtsNotConfiguredError extends Error {
  constructor() {
    super("Voiceover needs a Gemini key — connect yours in Profile → Gemini.");
    this.name = "TtsNotConfiguredError";
  }
}

export function isTtsConfigured(ctx: AiContext): boolean {
  return Boolean(ctx.geminiKey || process.env.OPENAI_API_KEY);
}

/** Gemini TTS: a complete WAV file (24 kHz mono 16-bit PCM) for unary calls. */
async function synthesizeWithGemini(text: string, apiKey: string): Promise<SynthesizedAudio> {
  const res = await createInteraction(apiKey, {
    model: GEMINI_MODELS.tts,
    input: [
      {
        type: "user_input",
        content: [
          {
            type: "text",
            text: text.slice(0, 2000),
            annotations: [{ type: "speech_metadata", style: "warm, upbeat and inviting, like a café's social video" }],
          },
        ],
      },
    ],
    response_format: { type: "audio", mime_type: "audio/wav" },
    generation_config: { speech_config: [{ voice: GEMINI_VOICE }] },
  });
  const audio = outputMedia(res, "audio", "audio/wav");
  if (!audio) throw new Error("Gemini returned no audio.");
  return { bytes: Buffer.from(audio.data, "base64"), contentType: "audio/wav", ext: "wav" };
}

export async function synthesizeSpeech(text: string, ctx: AiContext): Promise<SynthesizedAudio> {
  if (ctx.geminiKey) return synthesizeWithGemini(text, ctx.geminiKey);

  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new TtsNotConfiguredError();

  const model = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
  const voice = process.env.OPENAI_TTS_VOICE ?? "alloy";

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text.slice(0, 2000),
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    throw new Error(`TTS error ${res.status}: ${await res.text()}`);
  }

  return {
    bytes: Buffer.from(await res.arrayBuffer()),
    contentType: "audio/mpeg",
    ext: "mp3",
  };
}
