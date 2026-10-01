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
import { Plus } from "lucide-react";
import type { Storyboard } from "@/lib/types";
import { SceneThumb } from "./SceneThumb";
import { formatDuration } from "@/lib/utils";
import { useLunaStore } from "@/lib/store";

/**
 * Horizontal, drag-to-reorder timeline of scenes. Reordering commits the new
 * order to the store; clicking a thumb selects it in the inspector.
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

  return (
    <div className="border-t border-border bg-surface/60 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-xs font-medium text-muted-strong">
          Timeline · {storyboard.scenes.length} scenes · {formatDuration(totalDuration)}
        </h2>
        <span className="hidden text-[10px] text-muted md:inline">
          <kbd className="font-mono">G</kbd> generate · <kbd className="font-mono">N</kbd> new ·{" "}
          <kbd className="font-mono">P</kbd> play
        </span>
      </div>
      <div className="flex items-start gap-2 overflow-x-auto px-4 pb-4">
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
          className="flex h-full min-h-[7rem] w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong text-muted transition-colors hover:border-accent hover:text-accent-strong"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[11px]">Add scene</span>
        </button>
      </div>
    </div>
  );
}
