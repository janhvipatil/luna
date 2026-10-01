/**
 * Text-to-speech synthesis for scene narration.
 *
 * Pluggable like the image/video providers: it activates when a TTS key is set
 * and otherwise reports not-configured so the UI can explain. OpenAI's speech
 * endpoint is the default backend (Anthropic has no TTS API); called over plain
 * fetch so there's no extra SDK dependency. Returns raw audio bytes that the
 * route stores in the assets bucket.
 */

export interface SynthesizedAudio {
  bytes: Buffer;
  contentType: string;
  ext: string;
}

export class TtsNotConfiguredError extends Error {
  constructor() {
    super("Voiceover isn't configured. Set OPENAI_API_KEY to enable narration.");
    this.name = "TtsNotConfiguredError";
  }
}

export function isTtsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function synthesizeSpeech(text: string): Promise<SynthesizedAudio> {
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
