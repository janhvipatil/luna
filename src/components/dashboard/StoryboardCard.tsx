"use client";

import { useState } from "react";
import Link from "next/link";
import { Clapperboard, Clock, Copy, MoreVertical, Trash2 } from "lucide-react";
import type { Storyboard } from "@/lib/types";
import { Badge, Card } from "@/components/ui";
import { useLunaStore } from "@/lib/store";
import { formatDuration, timeAgo } from "@/lib/utils";

export function StoryboardCard({ storyboard }: { storyboard: Storyboard }) {
  const duplicate = useLunaStore((s) => s.duplicateStoryboard);
  const remove = useLunaStore((s) => s.deleteStoryboard);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalDuration = storyboard.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  const readyScenes = storyboard.scenes.filter((s) => s.status === "ready");
  const thumbs = readyScenes.slice(0, 3).map((s) => s.asset?.url);

  return (
    <Card className="group relative overflow-hidden transition-colors hover:border-border-strong">
      <Link href={`/storyboard/${storyboard.id}`} className="block">
        {/* Preview strip: real frames if any exist, else a gradient placeholder. */}
        <div className="relative flex h-32 gap-0.5 bg-surface-2 p-0.5">
          {thumbs.length > 0 ? (
            thumbs.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                className="h-full flex-1 rounded-md object-cover"
              />
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-accent/20 to-surface-3">
              <Clapperboard className="h-7 w-7 text-accent-strong/70" />
            </div>
          )}
          <div className="absolute left-2 top-2">
            <Badge tone="accent">{storyboard.format}</Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="truncate font-medium text-foreground">{storyboard.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">
            {storyboard.description || "No brief yet"}
          </p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Clapperboard className="h-3 w-3" />
              {storyboard.scenes.length} {storyboard.scenes.length === 1 ? "scene" : "scenes"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(totalDuration)}
            </span>
            <span className="ml-auto">{timeAgo(storyboard.updatedAt)}</span>
          </div>
        </div>
      </Link>

      {/* Overflow menu, outside the link so clicks don't navigate. */}
      <div className="absolute right-2 top-2">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
          className="rounded-lg bg-black/30 p-1.5 text-white/80 opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 group-hover:opacity-100"
          aria-label="Storyboard actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-xl">
            <button
              onMouseDown={() => duplicate(storyboard.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-surface-2"
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
            <button
              onMouseDown={() => {
                if (confirm(`Delete "${storyboard.title}"? This can't be undone.`)) {
                  remove(storyboard.id);
                }
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
