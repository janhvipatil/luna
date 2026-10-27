"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";

/** The slice of the Web Speech API we use (not in TypeScript's DOM lib). */
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noop = () => () => {};

/**
 * Dictation with the browser's built-in speech recognition (Chrome, Edge,
 * Safari). Owners used voice messages for ideas (user testing); this lets them
 * talk instead of type, with nothing uploaded. Unsupported browsers hide it.
 */
export function useDictation(onText: (text: string) => void) {
  const supported = useSyncExternalStore(noop, () => Boolean(recognitionCtor()), () => false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string>();
  const rec = useRef<Recognition | null>(null);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = navigator.language || "en-GB";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      // Continuous mode re-sends earlier results; only take the new final ones.
      const text = Array.from(e.results)
        .slice(e.resultIndex)
        .filter((res) => res.isFinal)
        .map((res) => res[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onText(text);
    };
    r.onerror = (e) => {
      setError(e.error === "not-allowed" ? "Allow microphone access to dictate." : "Dictation stopped.");
      setListening(false);
    };
    r.onend = () => setListening(false);
    rec.current = r;
    setError(undefined);
    setListening(true);
    r.start();
  }, [onText]);

  const stop = useCallback(() => {
    rec.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, error, start, stop };
}
