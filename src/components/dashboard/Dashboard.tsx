"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Plus, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card } from "@/components/ui";
import { NewStoryboardModal } from "./NewStoryboardModal";
import { StoryboardCard } from "./StoryboardCard";
import { ProviderStatusChip } from "@/components/providers/ProviderStatusChip";
import { sortStoryboards, useLunaStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/constants";
import { displayName, useUser } from "@/lib/data/UserContext";

export function Dashboard() {
  const hydrated = useLunaStore((s) => s.hydrated);
  const user = useUser();
  const router = useRouter();
  // Select the stable record and derive the sorted list here — sorting inside
  // the store selector returns a new array each call, which trips
  // useSyncExternalStore's snapshot check.
  const storyboardsMap = useLunaStore((s) => s.storyboards);
  const storyboards = useMemo(() => sortStoryboards(storyboardsMap), [storyboardsMap]);
  const createFromTemplate = useLunaStore((s) => s.createFromTemplate);
  const [newOpen, setNewOpen] = useState(false);

  function startFromTemplate(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const id = createFromTemplate(template);
    router.push(`/storyboard/${id}`);
  }

  return (
    <>
      <AppHeader
        right={
          <>
            <ProviderStatusChip />
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </>
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <section className="mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-strong">
            <Sparkles className="h-3.5 w-3.5 text-accent-strong" />
            Welcome back, {displayName(user)}
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Turn an idea into short-form video, one scene at a time.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Luna is the UI layer over the AI models you already use. Draft the flow, write the
            script, pick a look — then generate every scene with your chosen backend.
          </p>
        </section>

        {/* Templates */}
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-muted-strong">Start from a template</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => startFromTemplate(t.id)}
                className="flex h-full flex-col items-start gap-1.5 rounded-xl border border-border bg-surface/60 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <span className="text-[10px] font-medium text-muted">{t.format}</span>
                </div>
                <div className="text-xs leading-relaxed text-muted">{t.description}</div>
                <div className="mt-1 text-[11px] text-accent-strong">{t.scenes.length} scenes ›</div>
              </button>
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
                <Moon className="h-6 w-6 text-accent-strong" />
              </div>
              <div>
                <p className="font-medium text-foreground">No storyboards yet</p>
                <p className="mt-1 text-sm text-muted">
                  Create your first one or start from a template above.
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
    </>
  );
}
