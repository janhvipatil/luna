"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button } from "@/components/ui";
import { ProviderStatusChip } from "@/components/providers/ProviderStatusChip";
import { EditableTitle } from "./EditableTitle";
import { ScenePreview } from "./ScenePreview";
import { SceneInspector } from "./SceneInspector";
import { SceneStrip } from "./SceneStrip";
import { ExportModal } from "./ExportModal";
import type { Storyboard } from "@/lib/types";
import { useLunaStore } from "@/lib/store";
import { useGeneration } from "@/lib/useGeneration";

/**
 * The editor's working surface. Receives a guaranteed-present storyboard, so it
 * can freely use generation hooks. Layout: header → (preview | inspector) →
 * timeline strip.
 */
export function EditorWorkspace({ storyboard }: { storyboard: Storyboard }) {
  const updateStoryboard = useLunaStore((s) => s.updateStoryboard);
  const { generateScene, generateAll, busy } = useGeneration(storyboard);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const selectedScene =
    storyboard.scenes.find((s) => s.id === selectedId) ?? storyboard.scenes[0] ?? null;
  const sceneNumber = selectedScene
    ? storyboard.scenes.findIndex((s) => s.id === selectedScene.id) + 1
    : 0;

  return (
    <>
      <AppHeader
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
            />
            <Badge tone="accent">{storyboard.format}</Badge>
          </>
        }
        right={
          <>
            <ProviderStatusChip />
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

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="min-h-0 min-w-0 flex-1">
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

          <aside className="shrink-0 border-t border-border bg-surface/40 lg:w-[340px] lg:border-l lg:border-t-0">
            {selectedScene ? (
              <SceneInspector
                scene={selectedScene}
                storyboardId={storyboard.id}
                sceneNumber={sceneNumber}
                onDeleted={() => setSelectedId(null)}
              />
            ) : null}
          </aside>
        </div>

        <SceneStrip
          storyboard={storyboard}
          selectedId={selectedScene?.id ?? null}
          onSelect={setSelectedId}
        />
      </div>
    </>
  );
}
