"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Coffee, Plus, Sparkles, Store, Wand2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card } from "@/components/ui";
import { NewStoryboardModal } from "./NewStoryboardModal";
import { DraftWithAIModal } from "./DraftWithAIModal";
import { StoryboardCard } from "./StoryboardCard";
import { ProviderStatusChip } from "@/components/providers/ProviderStatusChip";
import { sortStoryboards, useLunaStore } from "@/lib/store";
import { TEMPLATE_CATEGORIES, TEMPLATES, personalizeTemplate } from "@/lib/templates";
import { EXAMPLE_STORYBOARDS } from "@/lib/examples";
import type { Template, TemplateCategory } from "@/lib/types";
import { displayName, useBrandKit, useUser } from "@/lib/data/UserContext";
import { cn } from "@/lib/utils";

function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col items-start gap-1.5 overflow-hidden rounded-xl border border-border bg-surface/60 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
    >
      <span
        className="absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity group-hover:opacity-100"
        style={{ background: template.accent }}
        aria-hidden
      />
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {template.emoji && <span aria-hidden>{template.emoji}</span>}
          {template.name}
        </div>
        <span className="shrink-0 text-[10px] font-medium text-muted">{template.format}</span>
      </div>
      <div className="text-xs leading-relaxed text-muted">{template.description}</div>
      <div className="mt-auto pt-1 text-[11px] text-accent-strong">
        {template.scenes.length} scenes ·{" "}
        {template.scenes.reduce((sum, s) => sum + s.durationSec, 0)}s ›
      </div>
    </button>
  );
}

export function Dashboard() {
  const hydrated = useLunaStore((s) => s.hydrated);
  const user = useUser();
  const { venue } = useBrandKit();
  const router = useRouter();
  // Select the stable record and derive the sorted list here — sorting inside
  // the store selector returns a new array each call, which trips
  // useSyncExternalStore's snapshot check.
  const storyboardsMap = useLunaStore((s) => s.storyboards);
  const storyboards = useMemo(() => sortStoryboards(storyboardsMap), [storyboardsMap]);
  const createFromTemplate = useLunaStore((s) => s.createFromTemplate);
  const [newOpen, setNewOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");

  // Templates with the user's venue details filled in.
  const templates = useMemo(
    () => TEMPLATES.map((t) => personalizeTemplate(t, venue)),
    [venue],
  );
  const visibleTemplates =
    category === "all" ? templates : templates.filter((t) => t.category === category);

  function startFrom(template: Template) {
    const id = createFromTemplate(template);
    router.push(`/storyboard/${id}`);
  }

  return (
    <>
      <AppHeader
        right={
          <>
            <ProviderStatusChip />
            <Button size="sm" variant="secondary" onClick={() => setDraftOpen(true)}>
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">Draft with AI</span>
            </Button>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </>
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <section className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-strong">
            <Sparkles className="h-3.5 w-3.5 text-accent-strong" />
            Welcome back, {displayName(user)}
            {venue?.name && <span className="text-muted">· {venue.name}</span>}
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Reels that make people hungry.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Short-form video for cafés and restaurants. Pick a proven format, tweak the shots and
            captions, and generate every scene — no film crew, no editing timeline.
          </p>
        </section>

        {/* Venue nudge */}
        {!venue?.name && (
          <Card className="mb-8 flex flex-col gap-3 border-accent/40 bg-accent-soft/60 p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Store className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Tell Luna about your venue</p>
              <p className="text-xs text-muted">
                Add your name, signature item and vibe — every template and AI draft gets written
                for you.
              </p>
            </div>
            <Button size="sm" onClick={() => router.push("/profile#venue")}>
              Set up venue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        )}

        {/* Templates */}
        <section className="mb-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-muted-strong">Start from a template</h2>
            <div className="flex flex-wrap gap-1">
              {[{ id: "all" as const, label: "All" }, ...TEMPLATE_CATEGORIES].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs transition-colors",
                    category === c.id
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface-2 text-muted-strong hover:bg-surface-3 hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category === "all" && (
              <>
                <button
                  onClick={() => setDraftOpen(true)}
                  className="flex h-full min-h-[104px] flex-col items-start justify-center gap-2 rounded-xl border border-accent/50 bg-accent-soft p-4 text-left transition-colors hover:border-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium text-foreground">Draft with AI</div>
                  <div className="text-xs text-muted">
                    Say what you&apos;re promoting — Luna writes the storyboard
                  </div>
                </button>

                <button
                  onClick={() => setNewOpen(true)}
                  className="flex h-full min-h-[104px] flex-col items-start justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface/40 p-4 text-left transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
                    <Plus className="h-4 w-4 text-accent-strong" />
                  </div>
                  <div className="text-sm font-medium text-foreground">Blank storyboard</div>
                  <div className="text-xs text-muted">Start from scratch</div>
                </button>
              </>
            )}

            {visibleTemplates.map((t) => (
              <TemplateCard key={t.id} template={t} onClick={() => startFrom(t)} />
            ))}
          </div>
        </section>

        {/* Worked example */}
        <section className="mb-10">
          <div className="mb-3">
            <h2 className="text-sm font-medium text-muted-strong">
              See it in action: <span className="text-foreground">Match Ya</span> 🍵
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              A matcha café that also does bakes, desserts, ramen and onigiri. Open one of its
              storyboards to see a finished plan.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMPLE_STORYBOARDS.map((t) => (
              <TemplateCard key={t.id} template={t} onClick={() => startFrom(t)} />
            ))}
          </div>
        </section>

        {/* Library */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-strong">Your storyboards</h2>

          {!hydrated ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 rounded-xl luna-shimmer" />
              ))}
            </div>
          ) : storyboards.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
                <Coffee className="h-6 w-6 text-accent-strong" />
              </div>
              <div>
                <p className="font-medium text-foreground">Nothing on the menu yet</p>
                <p className="mt-1 text-sm text-muted">
                  Pick a template above — the Signature Dish Spotlight is a great first reel.
                </p>
              </div>
              <Button onClick={() => setNewOpen(true)}>
                <Plus className="h-4 w-4" /> New storyboard
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {storyboards.map((sb) => (
                <StoryboardCard key={sb.id} storyboard={sb} />
              ))}
            </div>
          )}
        </section>
      </main>

      <NewStoryboardModal open={newOpen} onClose={() => setNewOpen(false)} />
      <DraftWithAIModal open={draftOpen} onClose={() => setDraftOpen(false)} />
    </>
  );
}
