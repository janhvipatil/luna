import type { AspectRatio } from "@/lib/types";
import { cn } from "@/lib/utils";

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "9:16": "aspect-[9/16]",
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
};

/** A fixed-aspect container for scene previews, matching the storyboard format. */
export function AspectFrame({
  ratio,
  className,
  children,
}: {
  ratio: AspectRatio;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-surface-2",
        ASPECT_CLASS[ratio],
        className,
      )}
    >
      {children}
    </div>
  );
}
