"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Coffee, KeyRound, Lightbulb, Plus, Sparkles, Store, Wand2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card } from "@/components/ui";
import { NewStoryboardModal } from "./NewStoryboardModal";
import { DraftWithAIModal } from "./DraftWithAIModal";
import { StoryboardCard } from "./StoryboardCard";
import { ProviderStatusChip } from "@/components/providers/ProviderStatusChip";
import { sortStoryboards, useLunaStore } from "@/lib/store";
import { TEMPLATE_CATEGORIES, TEMPLATES, personalizeTemplate, withPreviewAssets } from "@/lib/templates";
import { EXAMPLE_STORYBOARDS } from "@/lib/examples";
import { photoUrl, pickPhoto } from "@/lib/photos";
import type { Template, TemplateCategory } from "@/lib/types";
import { displayName, useAiStatus, useBrandKit, useUser } from "@/lib/data/UserContext";
import { cn } from "@/lib/utils";

function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
  const cover = template.cover ?? pickPhoto(template.scenes[0]?.prompt ?? template.name);
  const duration = template.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  return (
    <button
      onClick={onClick}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface/60 text-left transition-colors hover:border-border-strong"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl(cover, 640, 360)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute right-2 top-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {template.format}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="text-sm font-medium text-foreground">{template.name}</div>
        <div className="text-xs leading-relaxed text-muted">{template.description}</div>
        <div className="mt-auto pt-1 text-[11px] text-accent-strong">
          {template.scenes.length} scenes · {duration}s ›
        </div>
      </div>
    </button>
  );
}

export function Dashboard() {
  const hydrated = useLunaStore((s) => s.hydrated);
  const user = useUser();
  const { venue } = useBrandKit();
  const ai = useAiStatus();
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
    const id = createFromTemplate(withPreviewAssets(template));
    router.push(`/storyboard/${id}`);
  }

  return (
    <>
      <AppHeader
        right={
          <>
            <ProviderStatusChip />
            <Button size="sm" variant="ghost" onClick={() => router.push("/ideas")}>
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Ideas</span>
            </Button>
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
            <Sparkles className="h-3.5 w-3.5 text-matcha-strong" />
            Welcome back, {displayName(user)}
            {venue?.name && <span className="text-muted">· {venue.name}</span>}
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Turn an idea into short-form video, one scene at a time.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Made for cafés and restaurants. Draft the flow, write the script, pick a look — then
            generate every scene and post the reel.
          </p>
        </section>

        {/* Gemini nudge: AI features run on the user's own key */}
        {!ai.geminiConnected && (
          <Card
            className={cn(
              "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
              venue?.name ? "mb-8" : "mb-3",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
              <KeyRound className="h-4 w-4 text-accent-strong" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Connect your Gemini key</p>
              <p className="text-xs text-muted">
                Unlocks AI drafts and voiceovers (free tier) and AI video. You pay Google directly
                for what you generate.
              </p>
            </div>
            <Button size="sm" onClick={() => router.push("/profile#gemini")}>
              Connect Gemini <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        )}

        {/* Venue nudge */}
        {!venue?.name && (
          <Card className="mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-matcha-soft">
              <Store className="h-4 w-4 text-matcha-strong" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Tell Luna about your café</p>
              <p className="text-xs text-muted">
                Add your name, signature item and vibe — every template and AI draft gets written
                for you.
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push("/profile#venue")}>
              Set up venue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        )}

        {/* Library */}
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-muted-strong">Your storyboards</h2>

          {!hydrated ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 rounded-xl luna-shimmer" />
              ))}
            </div>
          ) : storyboards.length === 0 ? (
            <Card className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                <Coffee className="h-4 w-4 text-accent-strong" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">No storyboards yet</p>
                <p className="text-xs text-muted">
                  Pick a template below — the Signature Dish Spotlight is a great first reel.
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setNewOpen(true)}>
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
        {/* Worked example */}
        <section className="mb-10">
          <div className="mb-3">
            <h2 className="flex items-center gap-2 text-sm font-medium text-muted-strong">
              Example café: Match Ya
              <span className="rounded-full bg-matcha-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-matcha-strong">
                Example
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              A matcha café with bakes, desserts, ramen and onigiri — see what finished
              storyboards look like, then open one as a starting point.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMPLE_STORYBOARDS.map((t) => (
              <TemplateCard key={t.id} template={t} onClick={() => startFrom(t)} />
            ))}
          </div>
        </section>

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
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setDraftOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-accent/50 bg-accent-soft p-4 text-left transition-colors hover:border-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Wand2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Draft with AI</div>
                <div className="text-xs text-muted">
                  Say what you&apos;re promoting — Luna writes the storyboard
                </div>
              </div>
            </button>
            <button
              onClick={() => setNewOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface/40 p-4 text-left transition-colors hover:border-accent hover:bg-accent-soft"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-matcha-soft">
                <Plus className="h-4 w-4 text-matcha-strong" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Blank storyboard</div>
                <div className="text-xs text-muted">Start from scratch</div>
              </div>
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTemplates.map((t) => (
              <TemplateCard key={t.id} template={t} onClick={() => startFrom(t)} />
            ))}
          </div>
        </section>

      </main>

      <NewStoryboardModal open={newOpen} onClose={() => setNewOpen(false)} />
      <DraftWithAIModal open={draftOpen} onClose={() => setDraftOpen(false)} />
    </>
  );
}
