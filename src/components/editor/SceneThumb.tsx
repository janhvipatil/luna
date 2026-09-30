"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Film, GripVertical } from "lucide-react";
import type { AspectRatio, Scene } from "@/lib/types";
import { StatusOverlay } from "./StatusOverlay";
import { AspectFrame } from "@/components/AspectFrame";
import { cn } from "@/lib/utils";

/** A single draggable, selectable card in the scene strip. */
export function SceneThumb({
  scene,
  index,
  ratio,
  selected,
  onSelect,
}: {
  scene: Scene;
  index: number;
  ratio: AspectRatio;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group/thumb w-28 shrink-0", isDragging && "z-10")}
    >
      <button
        onClick={onSelect}
        className={cn(
          "block w-full rounded-lg border p-1 text-left transition-colors",
          selected
            ? "border-accent bg-accent-soft"
            : "border-transparent hover:border-border-strong",
        )}
      >
        <AspectFrame ratio={ratio} className="w-full">
          {scene.asset ? (
            // Thumbnails stay lightweight: show the poster (or the frame) as an
            // image even for video assets.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scene.asset.posterUrl ?? scene.asset.url}
              alt={scene.title}
              className="h-full w-full object-cover"
            />
          ) : null}
          <StatusOverlay status={scene.status} error={scene.error} compact />
          {scene.medium === "video" && scene.status === "ready" && (
            <div className="absolute right-1 top-1 rounded bg-black/50 p-0.5">
              <Film className="h-3 w-3 text-white" />
            </div>
          )}
          <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[9px] font-medium text-white">
            {scene.durationSec}s
          </div>
        </AspectFrame>
      </button>
      <div className="mt-1 flex items-center gap-1 px-1">
        <span className="text-[10px] font-medium text-muted">{index + 1}</span>
        <span className="truncate text-[11px] text-muted-strong">{scene.title}</span>
        <button
          className="ml-auto cursor-grab text-muted opacity-0 transition-opacity group-hover/thumb:opacity-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
