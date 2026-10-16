"use client";

import { useEffect, useState } from "react";
import { Download, Film, Server, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui";
import type { Storyboard } from "@/lib/types";
import { FORMAT_PRESETS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { useBrandKit } from "@/lib/data/UserContext";
import { MusicControl } from "./MusicControl";
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
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"browser" | "server" | null>(null);
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
    setMode("browser");
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

  async function handleServerRender() {
    setPhase("rendering");
    setMode("server");
    setProgress(0);
    setError(undefined);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyboardId: storyboard.id }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Server render failed.");
      setRemoteUrl(data.url);
      setPreviewUrl(data.url);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Server render failed.");
      setPhase("error");
    }
  }

  async function handleDownload() {
    const name = `${slugify(storyboard.title)}.${result?.extension ?? "mp4"}`;
    if (result?.blob) {
      downloadBlob(result.blob, name);
    } else if (remoteUrl) {
      // Server render lives at a remote URL — fetch it to force a download.
      const blob = await fetch(remoteUrl).then((r) => r.blob());
      downloadBlob(blob, name);
    }
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

        {phase === "idle" && <MusicControl storyboard={storyboard} />}

        {ungenerated > 0 && phase === "idle" && (
          <div className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {ungenerated} {ungenerated === 1 ? "scene hasn't" : "scenes haven't"} been generated
              yet — they&apos;ll show a placeholder background in the export.
            </span>
          </div>
        )}

        {phase === "rendering" && mode === "browser" && (
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

        {phase === "rendering" && mode === "server" && (
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-3 text-xs text-muted">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Rendering on the server — stitching clips and mixing audio. You can keep working.
          </div>
        )}

        {phase === "done" && previewUrl && (
          <div className="space-y-3">
            <video
              src={previewUrl}
              controls
              autoPlay
              loop
              className="mx-auto max-h-[40vh] rounded-lg border border-border"
            />
            <p className="text-center text-[11px] text-muted">
              {mode === "server" ? "Server-rendered MP4 (video clips + audio)" : "Recorded in your browser"}
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {phase === "done" ? (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleRender}
                loading={phase === "rendering" && mode === "browser"}
                disabled={phase === "rendering"}
              >
                <Film className="h-4 w-4" /> Quick export
              </Button>
              <Button
                onClick={handleServerRender}
                loading={phase === "rendering" && mode === "server"}
                disabled={phase === "rendering"}
                title="Stitches real video clips and mixes audio into an MP4"
              >
                <Server className="h-4 w-4" /> Render MP4
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
