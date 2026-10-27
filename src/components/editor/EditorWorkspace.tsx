"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Play, Share2, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button } from "@/components/ui";
import { ProviderStatusChip } from "@/components/providers/ProviderStatusChip";
import { EditableTitle } from "./EditableTitle";
import { ScenePreview } from "./ScenePreview";
import { SceneInspector } from "./SceneInspector";
import { SceneStrip } from "./SceneStrip";
import { ExportModal } from "./ExportModal";
import { PreviewPlayer } from "./PreviewPlayer";
import { ShareModal } from "./ShareModal";
import { SaveIndicator } from "./SaveIndicator";
import type { Storyboard } from "@/lib/types";
import { useLunaStore } from "@/lib/store";
import { useGeneration } from "@/lib/useGeneration";
import { useRecoverJobs } from "@/lib/data/useRecoverJobs";

/**
 * The editor's working surface. Receives a guaranteed-present storyboard, so it
 * can freely use generation hooks. Layout: header → (preview | inspector) →
 * timeline strip.
 */
export function EditorWorkspace({ storyboard }: { storyboard: Storyboard }) {
  const updateStoryboard = useLunaStore((s) => s.updateStoryboard);
  useRecoverJobs(storyboard.id);
  const { generateScene, generateAll, busy } = useGeneration(storyboard);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const addScene = useLunaStore((s) => s.addScene);

  const selectedScene =
    storyboard.scenes.find((s) => s.id === selectedId) ?? storyboard.scenes[0] ?? null;
  const sceneNumber = selectedScene
    ? storyboard.scenes.findIndex((s) => s.id === selectedScene.id) + 1
    : 0;

  // Keyboard shortcuts — ignored while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "g":
          if (selectedScene) {
            e.preventDefault();
            void generateScene(selectedScene);
          }
          break;
        case "n": {
          e.preventDefault();
          const id = addScene(storyboard.id, selectedScene?.id);
          if (id) setSelectedId(id);
          break;
        }
        case "p":
          if (storyboard.scenes.length) {
            e.preventDefault();
            setPlayerOpen(true);
          }
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedScene, generateScene, addScene, storyboard.id, storyboard.scenes.length]);

  return (
    // On desktop the editor fills exactly one screen so the inspector and
    // timeline can scroll independently instead of growing the page.
    <div className="flex flex-1 flex-col lg:h-dvh lg:flex-none lg:overflow-hidden">
      <AppHeader
        className="shrink-0"
        left={
          <>
            <Link
              href="/"
              className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              aria-label="Back to library"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <EditableTitle
              value={storyboard.title}
              onCommit={(title) => updateStoryboard(storyboard.id, { title })}
              className="max-w-[12rem] sm:max-w-[16rem] xl:max-w-[24rem]"
            />
            <Badge tone="accent">{storyboard.format}</Badge>
            <SaveIndicator />
          </>
        }
        right={
          <>
            <ProviderStatusChip />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPlayerOpen(true)}
              disabled={storyboard.scenes.length === 0}
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Play</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setExportOpen(true)}
              disabled={storyboard.scenes.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              size="sm"
              onClick={() => generateAll(storyboard.scenes)}
              loading={busy}
              disabled={storyboard.scenes.length === 0}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Generate all</span>
            </Button>
          </>
        }
      />

      {exportOpen && (
        <ExportModal onClose={() => setExportOpen(false)} storyboard={storyboard} />
      )}
      {playerOpen && (
        <PreviewPlayer storyboard={storyboard} onClose={() => setPlayerOpen(false)} />
      )}
      {shareOpen && <ShareModal storyboard={storyboard} onClose={() => setShareOpen(false)} />}

      {/* Preview + timeline on the left; the inspector is a full-height sidebar. */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {selectedScene ? (
              <ScenePreview
                scene={selectedScene}
                storyboard={storyboard}
                onGenerate={() => generateScene(selectedScene)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Add a scene to get started.
              </div>
            )}
          </div>

          <SceneStrip
            storyboard={storyboard}
            selectedId={selectedScene?.id ?? null}
            onSelect={setSelectedId}
          />
        </div>

        <aside className="shrink-0 border-t border-border bg-surface/40 lg:min-h-0 lg:w-[340px] lg:border-l lg:border-t-0">
          {selectedScene ? (
            <SceneInspector
              scene={selectedScene}
              storyboardId={storyboard.id}
              sceneNumber={sceneNumber}
              onDeleted={() => setSelectedId(null)}
              onDuplicated={(id) => setSelectedId(id)}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
