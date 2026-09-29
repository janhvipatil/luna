"use client";

import { Sparkles, RefreshCw } from "lucide-react";
import type { Scene, Storyboard } from "@/lib/types";
import { Button } from "@/components/ui";
import { AspectFrame } from "@/components/AspectFrame";
import { StatusOverlay } from "./StatusOverlay";

/**
 * The large canvas: a full-size preview of the selected scene with its script
 * rendered as an on-screen caption, plus the primary generate/regenerate action.
 */
export function ScenePreview({
  scene,
  storyboard,
  onGenerate,
}: {
  scene: Scene;
  storyboard: Storyboard;
  onGenerate: () => void;
}) {
  const busy = scene.status === "generating" || scene.status === "queued";
  const hasAsset = Boolean(scene.asset);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="w-full max-w-[min(46vh,420px)]">
        <AspectFrame ratio={storyboard.format} className="w-full shadow-2xl">
          {scene.asset ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scene.asset.url}
              alt={scene.title}
              className="h-full w-full object-cover"
            />
          ) : null}
          <StatusOverlay status={scene.status} error={scene.error} />

          {/* Script caption overlay, mimicking on-screen text. */}
          {scene.script && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
              <p className="text-center text-sm font-semibold leading-snug text-white drop-shadow">
                {scene.script}
              </p>
            </div>
          )}
        </AspectFrame>
      </div>

      <Button onClick={onGenerate} loading={busy} size="lg">
        {hasAsset ? (
          <>
            <RefreshCw className="h-4 w-4" /> Regenerate scene
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Generate scene
          </>
        )}
      </Button>
    </div>
  );
}
