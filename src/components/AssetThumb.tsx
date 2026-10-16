import type { GeneratedAsset } from "@/lib/types";
import { cn, isVideoUrl } from "@/lib/utils";

/**
 * Lightweight still for an asset: its poster or image, or — for a video with no
 * poster (e.g. a text-to-video Veo clip) — the clip's first frame.
 */
export function AssetThumb({
  asset,
  alt = "",
  className,
}: {
  asset: Pick<GeneratedAsset, "url" | "posterUrl">;
  alt?: string;
  className?: string;
}) {
  const classes = cn("h-full w-full object-cover", className);
  if (!asset.posterUrl && isVideoUrl(asset.url)) {
    return (
      <video
        src={`${asset.url}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
        className={classes}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset.posterUrl ?? asset.url} alt={alt} className={classes} />;
}
