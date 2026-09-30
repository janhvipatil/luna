"use client";

import { Sparkles, RefreshCw } from "lucide-react";
import type { Scene, Storyboard } from "@/lib/types";
import { Button } from "@/components/ui";
import { AspectFrame } from "@/components/AspectFrame";
import { StatusOverlay } from "./StatusOverlay";
import { BrandCaption, LogoWatermark } from "./BrandOverlay";
import { isVideoUrl } from "@/lib/utils";

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
            isVideoUrl(scene.asset.url) ? (
              <video
                src={scene.asset.url}
                poster={scene.asset.posterUrl}
                controls
                loop
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={scene.asset.url} alt={scene.title} className="h-full w-full object-cover" />
            )
          ) : null}
          <StatusOverlay status={scene.status} error={scene.error} />

          {/* Brand logo watermark + script caption, mimicking on-screen text. */}
          <LogoWatermark />
          <BrandCaption text={scene.script} />
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
