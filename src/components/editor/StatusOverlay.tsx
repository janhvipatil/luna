"use client";

import { AlertCircle, ImageOff } from "lucide-react";
import type { GenerationStatus } from "@/lib/types";
import { Spinner } from "@/components/ui";

/** Overlay shown on top of a scene frame reflecting its generation status. */
export function StatusOverlay({
  status,
  error,
  compact = false,
}: {
  status: GenerationStatus;
  error?: string;
  compact?: boolean;
}) {
  if (status === "generating" || status === "queued") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-2/80 backdrop-blur-sm">
        <Spinner className={compact ? "h-4 w-4" : "h-6 w-6"} />
        {!compact && (
          <span className="text-xs text-muted">
            {status === "queued" ? "Queued…" : "Generating…"}
          </span>
        )}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-danger/10 p-3 text-center">
        <AlertCircle className={compact ? "h-4 w-4 text-danger" : "h-6 w-6 text-danger"} />
        {!compact && <span className="line-clamp-3 text-[11px] text-danger">{error}</span>}
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
        <ImageOff className={compact ? "h-4 w-4" : "h-7 w-7"} />
        {!compact && <span className="text-[11px]">Not generated yet</span>}
      </div>
    );
  }

  return null;
}
