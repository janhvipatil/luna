"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { FORMAT_LIST } from "@/lib/constants";
import type { AspectRatio } from "@/lib/types";
import { useLunaStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NewStoryboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const createStoryboard = useLunaStore((s) => s.createStoryboard);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<AspectRatio>("9:16");

  function handleCreate() {
    const id = createStoryboard({ title, description, format });
    onClose();
    setTitle("");
    setDescription("");
    router.push(`/storyboard/${id}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New storyboard"
      description="Give it a name and pick a format. You can change these later."
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="sb-title">Title</Label>
          <Input
            id="sb-title"
            autoFocus
            placeholder="e.g. Pumpkin spice is back"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>

        <div>
          <Label htmlFor="sb-desc">Brief (optional)</Label>
          <Textarea
            id="sb-desc"
            rows={2}
            placeholder="What are you promoting? A dish, a deal, an event…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label>Format</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FORMAT_LIST.map((f) => {
              const active = f.id === format;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "relative rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-accent bg-accent-soft"
                      : "border-border bg-surface-2 hover:border-border-strong",
                  )}
                >
                  {active && (
                    <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-accent-strong" />
                  )}
                  <div className="text-sm font-medium text-foreground">{f.id}</div>
                  <div className="text-[11px] text-muted">{f.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create storyboard</Button>
        </div>
      </div>
    </Modal>
  );
}
