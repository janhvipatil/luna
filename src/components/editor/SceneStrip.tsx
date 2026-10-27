"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { AudioLines, Plus } from "lucide-react";
import type { Storyboard } from "@/lib/types";
import { SceneThumb } from "./SceneThumb";
import { cn, formatDuration } from "@/lib/utils";
import { useLunaStore } from "@/lib/store";

/**
 * Horizontal, drag-to-reorder timeline of scenes. Reordering commits the new
 * order to the store; clicking a thumb selects it in the inspector.
 *
 * From user testing: a duration bar shows each scene's length against the
 * whole reel, and a Script view shows each scene's exact caption / voiceover.
 */
export function SceneStrip({
  storyboard,
  selectedId,
  onSelect,
}: {
  storyboard: Storyboard;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const reorderScenes = useLunaStore((s) => s.reorderScenes);
  const addScene = useLunaStore((s) => s.addScene);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = storyboard.scenes.map((s) => s.id);
    const from = ids.indexOf(active.id as string);
    const to = ids.indexOf(over.id as string);
    if (from < 0 || to < 0) return;
    reorderScenes(storyboard.id, arrayMove(ids, from, to));
  }

  const totalDuration = storyboard.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  const [view, setView] = useState<"frames" | "script">("frames");

  return (
    <div className="border-t border-border bg-surface/60 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <h2 className="text-xs font-medium text-muted-strong">
          Timeline · {storyboard.scenes.length} scenes ·{" "}
          <span className="text-foreground">{formatDuration(totalDuration)} total</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] text-muted lg:inline">
            <kbd className="font-mono">G</kbd> generate · <kbd className="font-mono">N</kbd> new ·{" "}
            <kbd className="font-mono">P</kbd> play
          </span>
          <div className="inline-flex rounded-md bg-surface-2 p-0.5 text-[11px]">
            {(["frames", "script"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded px-2 py-0.5 capitalize transition-colors",
                  view === v ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration bar: each segment's width is its share of the whole reel. */}
      {totalDuration > 0 && (
        <div className="mx-4 mb-2 flex h-6 overflow-hidden rounded-md border border-border text-[10px]">
          {storyboard.scenes.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => onSelect(scene.id)}
              title={`${i + 1}. ${scene.title} · ${scene.durationSec}s`}
              style={{ flexGrow: scene.durationSec, flexBasis: 0 }}
              className={cn(
                "flex min-w-0 items-center justify-center gap-1 truncate border-r border-border px-1 last:border-r-0 transition-colors",
                scene.id === selectedId
                  ? "bg-accent text-accent-foreground"
                  : i % 2
                    ? "bg-surface-2 text-muted-strong hover:bg-surface-3"
                    : "bg-surface-3/60 text-muted-strong hover:bg-surface-3",
              )}
            >
              <span className="truncate">
                {i + 1} · {scene.durationSec}s
              </span>
            </button>
          ))}
        </div>
      )}

      {view === "script" && (
        <div className="flex items-stretch gap-2 overflow-x-auto px-4 pb-4">
          {storyboard.scenes.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => onSelect(scene.id)}
              className={cn(
                "flex w-52 shrink-0 flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors",
                scene.id === selectedId
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="font-medium text-muted-strong">
                  {i + 1}. {scene.title}
                </span>
                <span className="ml-auto">{scene.durationSec}s</span>
              </div>
              <p className="line-clamp-3 text-xs leading-snug text-foreground">
                {scene.script.trim() || <span className="italic text-muted">No caption or voiceover</span>}
              </p>
              <span
                className={cn(
                  "mt-auto inline-flex items-center gap-1 text-[10px]",
                  scene.narrationUrl ? "text-matcha-strong" : "text-muted",
                )}
              >
                <AudioLines className="h-3 w-3" />
                {scene.narrationUrl ? "Voiceover recorded" : "Caption only"}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className={cn("flex items-start gap-2 overflow-x-auto px-4 pb-4", view === "script" && "hidden")}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={storyboard.scenes.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            {storyboard.scenes.map((scene, i) => (
              <SceneThumb
                key={scene.id}
                scene={scene}
                index={i}
                ratio={storyboard.format}
                selected={scene.id === selectedId}
                onSelect={() => onSelect(scene.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button
          onClick={() => {
            const last = storyboard.scenes.at(-1)?.id;
            const newId = addScene(storyboard.id, last);
            if (newId) onSelect(newId);
          }}
          className="flex h-full min-h-[7rem] w-[4.5rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong text-muted transition-colors hover:border-accent hover:text-accent-strong"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px]">Add</span>
        </button>
      </div>
    </div>
  );
}
