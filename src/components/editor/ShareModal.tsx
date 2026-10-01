"use client";

import { useState } from "react";
import { Check, Copy, Globe, Lock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui";
import type { Storyboard } from "@/lib/types";
import { useLunaStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Toggle public read-only sharing for a storyboard and copy the link. Sharing
 * flips `is_shared`, which a public RLS policy honors for anon viewers.
 */
export function ShareModal({ storyboard, onClose }: { storyboard: Storyboard; onClose: () => void }) {
  const setShared = useLunaStore((s) => s.setStoryboardShared);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/share/${storyboard.id}` : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Share storyboard"
      description="Publish a read-only link anyone can open — no account needed."
    >
      <div className="space-y-4">
        <button
          onClick={() => setShared(storyboard.id, !storyboard.isShared)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
            storyboard.isShared
              ? "border-accent bg-accent-soft"
              : "border-border bg-surface-2 hover:border-border-strong",
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              storyboard.isShared ? "bg-accent text-accent-foreground" : "bg-surface-3 text-muted",
            )}
          >
            {storyboard.isShared ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">
              {storyboard.isShared ? "Public — anyone with the link" : "Private — only you"}
            </div>
            <div className="text-xs text-muted">
              {storyboard.isShared ? "Tap to make private" : "Tap to publish a read-only link"}
            </div>
          </div>
        </button>

        {storyboard.isShared && (
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="h-9 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-xs text-muted-strong focus:outline-none"
            />
            <Button variant="secondary" size="sm" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
