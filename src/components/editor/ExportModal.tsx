"use client";

import { useEffect, useState } from "react";
import { Download, Film, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui";
import type { Storyboard } from "@/lib/types";
import { FORMAT_PRESETS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { useBrandKit } from "@/lib/data/UserContext";
import { downloadBlob, renderStoryboardVideo, type RenderResult } from "@/lib/export/renderVideo";

type Phase = "idle" | "rendering" | "done" | "error";

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "luna-export";
}

/**
 * Mounted only while open (see EditorWorkspace), so its state starts fresh each
 * time — no reset effect needed.
 */
export function ExportModal({
  onClose,
  storyboard,
}: {
  onClose: () => void;
  storyboard: Storyboard;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<RenderResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const brand = useBrandKit();

  const preset = FORMAT_PRESETS[storyboard.format];
  const totalDuration = storyboard.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  const ungenerated = storyboard.scenes.filter((s) => s.status !== "ready").length;

  // Revoke the object URL whenever it's replaced or the modal unmounts.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function handleRender() {
    setPhase("rendering");
    setProgress(0);
    setError(undefined);
    try {
      const res = await renderStoryboardVideo(storyboard, {
        onProgress: setProgress,
        maxDimension: 720,
        brand,
      });
      setPreviewUrl(URL.createObjectURL(res.blob));
      setResult(res);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
      setPhase("error");
    }
  }

  function handleDownload() {
    if (!result) return;
    downloadBlob(result.blob, `${slugify(storyboard.title)}.${result.extension}`);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Export video"
      description="Render your storyboard into a shareable clip, right in your browser."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-surface-2 p-3">
            <div className="text-sm font-semibold text-foreground">{storyboard.format}</div>
            <div className="text-[11px] text-muted">{preset.label}</div>
          </div>
          <div className="rounded-lg bg-surface-2 p-3">
            <div className="text-sm font-semibold text-foreground">{storyboard.scenes.length}</div>
            <div className="text-[11px] text-muted">scenes</div>
          </div>
          <div className="rounded-lg bg-surface-2 p-3">
            <div className="text-sm font-semibold text-foreground">
              {formatDuration(totalDuration)}
            </div>
            <div className="text-[11px] text-muted">runtime</div>
          </div>
        </div>

        {ungenerated > 0 && phase === "idle" && (
          <div className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {ungenerated} {ungenerated === 1 ? "scene hasn't" : "scenes haven't"} been generated
              yet — they&apos;ll show a placeholder background in the export.
            </span>
          </div>
        )}

        {phase === "rendering" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Rendering in real time…</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-muted">
              Keep this tab focused — recording runs at playback speed.
            </p>
          </div>
        )}

        {phase === "done" && result && previewUrl && (
          <div className="space-y-3">
            <video
              src={previewUrl}
              controls
              autoPlay
              loop
              className="mx-auto max-h-[40vh] rounded-lg border border-border"
            />
            <p className="text-center text-[11px] text-muted">
              Format: {result.extension.toUpperCase()}
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {phase === "done" ? (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download
            </Button>
          ) : (
            <Button onClick={handleRender} loading={phase === "rendering"}>
              <Film className="h-4 w-4" /> Render video
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
