"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import type { Storyboard } from "@/lib/types";
import { AspectFrame } from "@/components/AspectFrame";
import { isVideoUrl } from "@/lib/utils";
import { useSpeech } from "@/lib/useSpeech";
import { cn } from "@/lib/utils";

const MIN_SCENE_MS = 1200;

/**
 * Full-screen reel player: steps through scenes on their timing and narrates
 * each scene's script with the browser's speech synthesis. Mounted only while
 * open, so playback state starts fresh each time.
 */
export function PreviewPlayer({
  storyboard,
  onClose,
}: {
  storyboard: Storyboard;
  onClose: () => void;
}) {
  const { supported, speak, cancel } = useSpeech();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);

  const scenes = storyboard.scenes;
  const scene = scenes[index];
  const atEnd = index >= scenes.length;

  // Drive playback: show a scene, narrate it, advance after its duration.
  // When we run past the last scene the effect simply no-ops (atEnd), so there's
  // no state write here — the controls switch to "Replay" on their own.
  useEffect(() => {
    if (!playing || !scene) return;
    if (!muted && supported) void speak(scene.script, { rate: 1 });
    const ms = Math.max(scene.durationSec * 1000, MIN_SCENE_MS);
    const timer = setTimeout(() => setIndex((i) => i + 1), ms);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [playing, index, scene, muted, supported, speak, cancel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function restart() {
    setIndex(0);
    setPlaying(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="Close player"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-[min(60vh,440px)]">
        <AspectFrame ratio={storyboard.format} className="w-full shadow-2xl">
          {scene?.asset ? (
            isVideoUrl(scene.asset.url) ? (
              <video src={scene.asset.url} poster={scene.asset.posterUrl} autoPlay muted loop className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={scene.asset.url} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/30 to-surface-3" />
          )}
          {scene?.script && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
              <p className="text-center text-sm font-semibold leading-snug text-white drop-shadow">
                {scene.script}
              </p>
            </div>
          )}
          {atEnd && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white/80">
              End of reel
            </div>
          )}
        </AspectFrame>
      </div>

      {/* Progress segments */}
      <div className="mt-4 flex w-full max-w-[min(60vh,440px)] gap-1">
        {scenes.map((s, i) => (
          <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className={cn("h-full bg-white transition-all", i < index ? "w-full" : "w-0")}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2">
        {atEnd ? (
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            <RotateCcw className="h-4 w-4" /> Replay
          </button>
        ) : (
          <button
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </button>
        )}
        <button
          onClick={() => setMuted((m) => !m)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          disabled={!supported}
          title={supported ? "Toggle narration" : "Narration not supported in this browser"}
        >
          {muted || !supported ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-white/50">
        {supported ? "Narration uses your browser's voice" : "Narration unavailable in this browser"}
      </p>
    </div>
  );
}
