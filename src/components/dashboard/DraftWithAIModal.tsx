"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles, Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { FORMAT_LIST } from "@/lib/constants";
import type { AspectRatio, Template } from "@/lib/types";
import type { DraftStoryboard } from "@/lib/draft/types";
import { useLunaStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DraftWithAIModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const createFromTemplate = useLunaStore((s) => s.createFromTemplate);
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("");
  const [format, setFormat] = useState<AspectRatio>("9:16");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleDraft() {
    if (!brief.trim()) {
      setError("Describe what you want to make.");
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, tone, format }),
      });
      const data: { storyboard?: DraftStoryboard; error?: string } = await res.json();
      if (!res.ok || !data.storyboard) {
        throw new Error(data.error || "Draft failed.");
      }
      const template: Template = {
        id: "ai-draft",
        name: data.storyboard.title,
        description: data.storyboard.description,
        format,
        accent: "#8b5cf6",
        scenes: data.storyboard.scenes,
      };
      const id = createFromTemplate(template);
      onClose();
      setBrief("");
      setTone("");
      router.push(`/storyboard/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-accent-strong" /> Draft with AI
        </span>
      }
      description="Describe your idea and Luna will draft a full storyboard — scenes, prompts, and script — for you to refine."
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="brief">What are you making?</Label>
          <Textarea
            id="brief"
            autoFocus
            rows={3}
            placeholder="e.g. A 15-second ad for a reusable water bottle that keeps drinks cold for 24 hours, aimed at hikers."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tone">Tone (optional)</Label>
            <Input
              id="tone"
              placeholder="playful, premium, bold…"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />
          </div>
          <div>
            <Label>Format</Label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as AspectRatio)}
              className="h-9 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
            >
              {FORMAT_LIST.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} · {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        )}

        <div className={cn("flex justify-end gap-2 pt-1")}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDraft} loading={loading}>
            <Sparkles className="h-4 w-4" /> Draft storyboard
          </Button>
        </div>
      </div>
    </Modal>
  );
}
