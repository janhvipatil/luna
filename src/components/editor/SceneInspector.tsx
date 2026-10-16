"use client";

import { useState } from "react";
import { AudioLines, Check, Copy, Dices, Film, ImageIcon, Layers, Lock, Minus, Plus, Trash2, X } from "lucide-react";
import type { Scene, SceneMedium, VisualStyle } from "@/lib/types";
import { Button, Input, Label, Spinner, Textarea } from "@/components/ui";
import { VISUAL_STYLES } from "@/lib/constants";
import { CAPTION_PRESETS, SHOT_IDEAS } from "@/lib/presets";
import { personalize } from "@/lib/venue";
import { useBrandKit } from "@/lib/data/UserContext";
import { useLunaStore } from "@/lib/store";
import { cn, fitDurationToAudio, getAudioDuration, isVideoUrl } from "@/lib/utils";

/**
 * Right-hand editor for the selected scene. Every change writes straight to the
 * store (debouncing isn't needed — updates are local and cheap).
 */
export function SceneInspector({
  scene,
  storyboardId,
  sceneNumber,
  onDeleted,
  onDuplicated,
}: {
  scene: Scene;
  storyboardId: string;
  sceneNumber: number;
  onDeleted: () => void;
  onDuplicated: (newSceneId: string) => void;
}) {
  const updateScene = useLunaStore((s) => s.updateScene);
  const deleteScene = useLunaStore((s) => s.deleteScene);
  const duplicateScene = useLunaStore((s) => s.duplicateScene);
  const selectTake = useLunaStore((s) => s.selectTake);

  const patch = (p: Partial<Scene>) => updateScene(storyboardId, scene.id, p);
  const { venue } = useBrandKit();
  const [captionsOpen, setCaptionsOpen] = useState(false);

  function addShotIdea(text: string) {
    const base = scene.prompt.trim().replace(/[.,]$/, "");
    patch({ prompt: base ? `${base}, ${text}` : text });
  }
  const takes = scene.takes ?? [];

  const [narrating, setNarrating] = useState(false);
  const [narrateError, setNarrateError] = useState<string>();

  async function generateVoiceover() {
    if (!scene.script.trim()) {
      setNarrateError("Write a script line first.");
      return;
    }
    setNarrating(true);
    setNarrateError(undefined);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scene.script, storyboardId, sceneId: scene.id }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Narration failed.");
      // Fit the scene to the narration so it doesn't spill into the next scene.
      const seconds = await getAudioDuration(data.url);
      patch({ narrationUrl: data.url, durationSec: fitDurationToAudio(seconds) });
    } catch (err) {
      setNarrateError(err instanceof Error ? err.message : "Narration failed.");
    } finally {
      setNarrating(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent-strong">
            {sceneNumber}
          </span>
          <span className="text-sm font-medium text-foreground">Scene settings</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const newId = duplicateScene(storyboardId, scene.id);
              if (newId) onDuplicated(newId);
            }}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Duplicate scene"
            title="Duplicate scene"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this scene?")) {
                deleteScene(storyboardId, scene.id);
                onDeleted();
              }
            }}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label="Delete scene"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <Label htmlFor="scene-title">Scene name</Label>
          <Input
            id="scene-title"
            value={scene.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Hook"
          />
        </div>

        <div>
          <Label htmlFor="scene-prompt">Visual prompt</Label>
          <Textarea
            id="scene-prompt"
            rows={4}
            value={scene.prompt}
            onChange={(e) => patch({ prompt: e.target.value })}
            placeholder="Describe the shot you want the model to generate…"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {SHOT_IDEAS.map((idea) => (
              <button
                key={idea.label}
                type="button"
                onClick={() => addShotIdea(idea.text)}
                title={`Add “${idea.text}”`}
                className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-muted-strong transition-colors hover:border-accent hover:text-foreground"
              >
                + {idea.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted">
            Tap a shot idea to add it. Luna adds style modifiers automatically based on the look below.
          </p>
        </div>

        <div>
          <Label htmlFor="scene-script">Script / caption</Label>
          <Textarea
            id="scene-script"
            rows={2}
            value={scene.script}
            onChange={(e) => patch({ script: e.target.value })}
            placeholder="The line of voiceover or on-screen text for this beat."
          />
          <button
            type="button"
            onClick={() => setCaptionsOpen((o) => !o)}
            className="mt-1 text-[11px] font-medium text-accent-strong hover:underline"
          >
            {captionsOpen ? "Hide caption ideas" : "Caption ideas…"}
          </button>
          {captionsOpen && (
            <div className="mt-1.5 space-y-2 rounded-lg border border-border bg-surface-2 p-2">
              {CAPTION_PRESETS.map((group) => (
                <div key={group.group}>
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                    {group.group}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.lines.map((line) => {
                      const text = personalize(line, venue);
                      return (
                        <button
                          key={line}
                          type="button"
                          onClick={() => patch({ script: text })}
                          className="rounded-md bg-surface px-2 py-1 text-left text-[11px] text-muted-strong transition-colors hover:bg-accent-soft hover:text-foreground"
                        >
                          {text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Voiceover: synthesize the script to narration baked into the export. */}
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={generateVoiceover}
              disabled={narrating || !scene.script.trim()}
            >
              {narrating ? <Spinner className="h-3.5 w-3.5" /> : <AudioLines className="h-3.5 w-3.5" />}
              {scene.narrationUrl ? "Redo voiceover" : "Voiceover"}
            </Button>
            {scene.narrationUrl && (
              <button
                onClick={() => patch({ narrationUrl: undefined })}
                className="text-[11px] text-muted hover:text-danger"
              >
                Remove
              </button>
            )}
          </div>
          {scene.narrationUrl && (
            <>
              <audio src={scene.narrationUrl} controls className="mt-2 h-8 w-full" />
              <p className="mt-1 text-[11px] text-muted">
                Scene length fitted to the voiceover ({scene.durationSec}s).
              </p>
            </>
          )}
          {narrateError && <p className="mt-1 text-[11px] text-danger">{narrateError}</p>}
        </div>

        {/* Medium */}
        <div>
          <Label>Output</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "image", label: "Image", icon: ImageIcon },
                { id: "video", label: "Video", icon: Film },
              ] as Array<{ id: SceneMedium; label: string; icon: typeof ImageIcon }>
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => patch({ medium: id })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors",
                  scene.medium === id
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border bg-surface-2 text-muted-strong hover:border-border-strong",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <Label>Look</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => patch({ style: style.id as VisualStyle })}
                title={style.blurb}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                  scene.style === style.id
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border bg-surface-2 text-muted-strong hover:border-border-strong",
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <Label>Duration</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => patch({ durationSec: Math.max(1, scene.durationSec - 1) })}
              aria-label="Decrease duration"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm font-medium text-foreground">
              {scene.durationSec}s
            </span>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => patch({ durationSec: Math.min(30, scene.durationSec + 1) })}
              aria-label="Increase duration"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Seed */}
        <div>
          <Label>Seed</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Random"
              value={scene.seed ?? ""}
              onChange={(e) =>
                patch({ seed: e.target.value === "" ? undefined : Number(e.target.value) })
              }
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => patch({ seed: Math.floor(Math.random() * 1_000_000) })}
              aria-label="Randomize seed"
              title="Randomize"
            >
              <Dices className="h-4 w-4" />
            </Button>
            {scene.seed != null && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => patch({ seed: undefined })}
                aria-label="Clear seed"
                title="Clear (use random each time)"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted">
            <Lock className="h-3 w-3" />
            {scene.seed != null ? "Locked — re-runs are reproducible." : "Random each generation."}
          </p>
        </div>

        {/* Takes gallery */}
        {takes.length > 1 && (
          <div>
            <Label className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> Takes ({takes.length})
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
              {takes.map((take, i) => {
                const active = take.url === scene.asset?.url;
                return (
                  <button
                    key={`${take.url}-${i}`}
                    onClick={() => selectTake(storyboardId, scene.id, take)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-md border transition-colors",
                      active ? "border-accent ring-1 ring-accent" : "border-border hover:border-border-strong",
                    )}
                    title={active ? "Current take" : "Use this take"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={take.posterUrl ?? take.url}
                      alt={`Take ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {isVideoUrl(take.url) && (
                      <Film className="absolute right-0.5 top-0.5 h-3 w-3 text-white drop-shadow" />
                    )}
                    {active && (
                      <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {scene.asset && (
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px] text-muted">
            Generated by{" "}
            <span className="font-medium text-muted-strong">{scene.asset.providerId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
