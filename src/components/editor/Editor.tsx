"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui";
import { EditorWorkspace } from "./EditorWorkspace";
import { useLunaStore } from "@/lib/store";

/**
 * Loads a storyboard by id and handles the not-found / not-yet-hydrated states.
 * Once a storyboard is guaranteed present, rendering (and all generation hooks)
 * are delegated to EditorWorkspace so those hooks never sit behind a return.
 */
export function Editor({ storyboardId }: { storyboardId: string }) {
  const hydrated = useLunaStore((s) => s.hydrated);
  const storyboard = useLunaStore((s) => s.storyboards[storyboardId]);

  if (!hydrated) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-64 w-40 rounded-xl luna-shimmer" />
        </div>
      </>
    );
  }

  if (!storyboard) {
    return (
      <>
        <AppHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-medium text-foreground">Storyboard not found</p>
          <p className="max-w-sm text-sm text-muted">
            It may have been deleted, or this link is from a different browser — storyboards are
            stored locally.
          </p>
          <Link href="/">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Back to library
            </Button>
          </Link>
        </main>
      </>
    );
  }

  return <EditorWorkspace storyboard={storyboard} />;
}
