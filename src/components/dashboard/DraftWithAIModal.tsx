"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Lightbulb, Sparkles, Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { FORMAT_LIST } from "@/lib/constants";
import type { AspectRatio, Template } from "@/lib/types";
import type { DraftStoryboard } from "@/lib/draft/types";
import { useLunaStore } from "@/lib/store";
import { withPreviewAssets } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { useBrandKit } from "@/lib/data/UserContext";
import { personalize } from "@/lib/venue";

/** Example briefs — full sentences, so people see what a good brief looks like. */
const EXAMPLES: Array<{ label: string; brief: string }> = [
  { label: "☕ Signature drink", brief: "Show off {signature} — how it's made and why regulars love it. Cosy and inviting." },
  { label: "🍽️ New dish", brief: "Our new seasonal dish launches this week — get locals excited to come and try it." },
  { label: "🥞 Weekend brunch", brief: "Promote weekend brunch at {venue} for friends and families — relaxed, sunny, no rush." },
  { label: "🕒 Quiet afternoons", brief: "Bring more people in after lunch with an afternoon coffee-and-cake deal for remote workers." },
  { label: "🎨 Evening event", brief: "Fill our evening sip & paint workshop — fun, creative, a great night out with friends." },
  { label: "👩‍🍳 Behind the scenes", brief: "Show the real people behind {venue} and how we make everything by hand." },
];

/** A brief this short is usually a topic, not a description (user testing). */
const MIN_WORDS = 6;

type Step = "describe" | "choose";

/**
 * Draft with AI. User testing showed people didn't know what to type ("café"?)
 * and that owners wanted AI to "just make three ads to choose from" — so this
 * asks for 1–2 sentences with examples, then shows three distinct concepts to
 * pick from. Editing stays available afterwards for whoever wants it.
 */
export function DraftWithAIModal({
  open,
  onClose,
  initialBrief,
}: {
  open: boolean;
  onClose: () => void;
  /** Prefill (e.g. "Make a storyboard" from the idea bank). Callers re-key the
   * modal when this changes so it starts fresh. */
  initialBrief?: string;
}) {
  const router = useRouter();
  const createFromTemplate = useLunaStore((s) => s.createFromTemplate);
  const { venue } = useBrandKit();
  const [step, setStep] = useState<Step>("describe");
  const [brief, setBrief] = useState(initialBrief ?? "");
  const [tone, setTone] = useState("");
  const [format, setFormat] = useState<AspectRatio>("9:16");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [options, setOptions] = useState<DraftStoryboard[]>([]);

  const words = brief.trim().split(/\s+/).filter(Boolean).length;
  const tooShort = brief.trim().length > 0 && words < MIN_WORDS;

  async function handleDraft() {
    if (!brief.trim()) {
      setError("Describe what you want to promote in a sentence or two.");
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, tone, format, venue, options: true }),
      });
      const data: { options?: DraftStoryboard[]; error?: string } = await res.json();
      if (!res.ok || !data.options?.length) throw new Error(data.error || "Draft failed.");
      setOptions(data.options);
      setStep("choose");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed.");
    } finally {
      setLoading(false);
    }
  }

  function choose(option: DraftStoryboard) {
    const template: Template = {
      id: "ai-draft",
      name: option.title,
      description: option.description,
      format,
      accent: "#d9577a",
      scenes: option.scenes,
    };
    // Pre-fill each scene's still so the chosen concept opens fully illustrated.
    const id = createFromTemplate(withPreviewAssets(template));
    onClose();
    setBrief("");
    setTone("");
    setStep("describe");
    setOptions([]);
    router.push(`/storyboard/${id}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={step === "choose" ? "max-w-4xl" : undefined}
      title={
        <span className="inline-flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-accent-strong" />
          {step === "describe" ? "Draft with AI" : "Pick the one you like"}
        </span>
      }
      description={
        step === "describe"
          ? `Tell Luna what you want to promote and get three different video ideas${venue?.name ? ` for ${venue.name}` : ""} to choose from.`
          : "Three different takes on your idea. Choose one — you can still change any scene afterwards."
      }
    >
      {step === "describe" ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="brief">What do you want to promote?</Label>
            <p className="-mt-0.5 mb-2 text-[11px] leading-snug text-muted">
              Write 1–2 sentences: <span className="text-muted-strong">what</span> it is,{" "}
              <span className="text-muted-strong">who</span> it&apos;s for, and{" "}
              <span className="text-muted-strong">how it should feel</span>.
            </p>
            <Textarea
              id="brief"
              autoFocus
              rows={3}
              placeholder="e.g. Our new pistachio croissant launches Saturday — get regulars and new faces to come and try it before it sells out."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
            {tooShort && (
              <p className="mt-1 inline-flex items-start gap-1 text-[11px] text-warning">
                <Lightbulb className="mt-px h-3 w-3 shrink-0" />
                Add a bit more — which dish, offer or event, and who it&apos;s for. More detail
                gives better videos.
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-medium text-muted">Or start from an example</div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((g) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setBrief(personalize(g.brief, venue))}
                  className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted-strong transition-colors hover:border-accent hover:text-foreground"
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tone">Tone (optional)</Label>
              <Input
                id="tone"
                placeholder="cosy, playful, premium…"
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

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleDraft} loading={loading}>
              <Sparkles className="h-4 w-4" /> Show me 3 ideas
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {options.map((option, i) => {
              const total = option.scenes.reduce((s, sc) => s + sc.durationSec, 0);
              return (
                <div
                  key={i}
                  className="flex flex-col rounded-xl border border-border bg-surface-2 p-3"
                >
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted">
                    Option {i + 1} · {option.scenes.length} scenes · {total}s
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">{option.title}</div>
                  {option.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">{option.description}</p>
                  )}
                  <ol className="mt-3 flex-1 space-y-1.5">
                    {option.scenes.map((scene, n) => (
                      <li key={n} className="text-xs leading-snug">
                        <span className="font-medium text-muted-strong">
                          {n + 1}. {scene.title}
                        </span>
                        <span className="text-muted"> — {scene.script}</span>
                      </li>
                    ))}
                  </ol>
                  <Button className={cn("mt-3 w-full")} onClick={() => choose(option)}>
                    <Check className="h-4 w-4" /> Use this one
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep("describe")}>
              <ArrowLeft className="h-4 w-4" /> Change my description
            </Button>
            <Button variant="secondary" onClick={handleDraft} loading={loading}>
              <Sparkles className="h-4 w-4" /> Three new ideas
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
