"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Thin wrapper over the browser SpeechSynthesis API for scene narration.
 * Zero-config voiceover — no API key, works offline. `speak` resolves when the
 * utterance finishes (or is cancelled), so callers can sequence scenes. State
 * lives in the Web Speech engine, so there's nothing to track in React.
 */
export function useSpeech() {
  const [supported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
  );

  // Stop any in-flight speech on unmount.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  const speak = useCallback(
    (text: string, opts?: { voiceURI?: string; rate?: number }): Promise<void> => {
      return new Promise((resolve) => {
        if (!supported || !text.trim()) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (opts?.rate) utter.rate = opts.rate;
        if (opts?.voiceURI) {
          const v = window.speechSynthesis.getVoices().find((x) => x.voiceURI === opts.voiceURI);
          if (v) utter.voice = v;
        }
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        window.speechSynthesis.speak(utter);
      });
    },
    [supported],
  );

  return { supported, speak, cancel };
}
