"use client";

import { Film, ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import type { Scene, SceneMedium, VisualStyle } from "@/lib/types";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { VISUAL_STYLES } from "@/lib/constants";
import { useLunaStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Right-hand editor for the selected scene. Every change writes straight to the
 * store (debouncing isn't needed — updates are local and cheap).
 */
export function SceneInspector({
  scene,
  storyboardId,
  sceneNumber,
  onDeleted,
}: {
  scene: Scene;
  storyboardId: string;
  sceneNumber: number;
  onDeleted: () => void;
}) {
  const updateScene = useLunaStore((s) => s.updateScene);
  const deleteScene = useLunaStore((s) => s.deleteScene);

  const patch = (p: Partial<Scene>) => updateScene(storyboardId, scene.id, p);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent-strong">
            {sceneNumber}
          </span>
          <span className="text-sm font-medium text-foreground">Scene settings</span>
        </div>
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
          <p className="mt-1 text-[11px] text-muted">
            Luna adds style modifiers automatically based on the look below.
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
