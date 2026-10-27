"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { Button, Spinner, Textarea } from "@/components/ui";
import type { Storyboard } from "@/lib/types";
import { useLunaStore } from "@/lib/store";
import { useBrandKit } from "@/lib/data/UserContext";
import { formatPostCaption, type PostCaption as Caption } from "@/lib/caption-format";

/**
 * "Caption for your post": the text a café pastes under the video when it posts
 * it. Named and explained plainly because user testing showed a generic
 * "Advertising content" label wasn't understood. Saved with the storyboard.
 */
export function PostCaption({ storyboard }: { storyboard: Storyboard }) {
  const updateStoryboard = useLunaStore((s) => s.updateStoryboard);
  const { venue } = useBrandKit();
  const [writing, setWriting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();
  const caption = storyboard.postCaption ?? "";

  async function write() {
    setWriting(true);
    setError(undefined);
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyboard.title,
          description: storyboard.description,
          scripts: storyboard.scenes.map((s) => s.script),
          venue,
        }),
      });
      const data: Caption & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't write a caption.");
      updateStoryboard(storyboard.id, { postCaption: formatPostCaption(data) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't write a caption.");
    } finally {
      setWriting(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy — select the text and copy it manually.");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-foreground">Caption for your post</div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={write} disabled={writing}>
            {writing ? <Spinner className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {caption ? "Rewrite" : "Write it for me"}
          </Button>
          <Button size="sm" variant="secondary" onClick={copy} disabled={!caption}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <p className="mb-2 text-[11px] leading-snug text-muted">
        Paste this under the video when you post it on Instagram or TikTok.
      </p>
      <Textarea
        rows={4}
        value={caption}
        onChange={(e) => updateStoryboard(storyboard.id, { postCaption: e.target.value })}
        placeholder="Tap “Write it for me”, or type your own caption and hashtags."
      />
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}
