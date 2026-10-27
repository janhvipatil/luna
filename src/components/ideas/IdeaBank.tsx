"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Lightbulb,
  Mic,
  MicOff,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Spinner, Textarea } from "@/components/ui";
import { DraftWithAIModal } from "@/components/dashboard/DraftWithAIModal";
import { createClient } from "@/lib/supabase/client";
import { useAiStatus } from "@/lib/data/UserContext";
import { cn, timeAgo } from "@/lib/utils";
import { useDictation } from "./useDictation";
import type { IdeaTheme } from "@/app/api/ideas/organize/route";

interface Idea {
  id: string;
  text: string;
  source: "typed" | "dictated";
  used: boolean;
  created_at: string;
}

/**
 * Idea bank. From user testing: owners share ad ideas in scattered voice notes
 * and the marketer struggles to piece the vision together. Here anyone can jot
 * or dictate an idea in seconds, AI groups them into themes with a summary, and
 * any idea or theme becomes a storyboard in one tap.
 */
export function IdeaBank() {
  const supabase = useMemo(() => createClient(), []);
  const ai = useAiStatus();
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [draft, setDraft] = useState("");
  const [dictated, setDictated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [themes, setThemes] = useState<IdeaTheme[] | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [brief, setBrief] = useState<{ key: string; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("ideas")
      .select("id, text, source, used, created_at")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    setIdeas((data as Idea[] | null) ?? []);
  }, [supabase]);

  useEffect(() => {
    // Initial fetch; setState happens after the await, not synchronously.
    void (async () => load())();
  }, [load]);

  const appendDictation = useCallback((text: string) => {
    setDraft((d) => (d ? `${d} ${text}` : text));
    setDictated(true);
  }, []);
  const dictation = useDictation(appendDictation);

  async function save() {
    const text = draft.trim();
    if (!text) return;
    setSaving(true);
    setError(undefined);
    dictation.stop();
    const { error: err } = await supabase
      .from("ideas")
      .insert({ text: text.slice(0, 2000), source: dictated ? "dictated" : "typed" });
    setSaving(false);
    if (err) return setError(err.message);
    setDraft("");
    setDictated(false);
    setThemes(null);
    void load();
  }

  async function remove(id: string) {
    setIdeas((list) => list?.filter((i) => i.id !== id) ?? null);
    setThemes(null);
    await supabase.from("ideas").delete().eq("id", id);
  }

  async function toggleUsed(idea: Idea) {
    setIdeas((list) => list?.map((i) => (i.id === idea.id ? { ...i, used: !i.used } : i)) ?? null);
    await supabase.from("ideas").update({ used: !idea.used }).eq("id", idea.id);
  }

  async function organize() {
    setOrganizing(true);
    setError(undefined);
    try {
      const res = await fetch("/api/ideas/organize", { method: "POST" });
      const data: { themes?: IdeaTheme[]; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't organise ideas.");
      setThemes(data.themes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't organise ideas.");
    } finally {
      setOrganizing(false);
    }
  }

  const open = ideas?.filter((i) => !i.used) ?? [];
  const used = ideas?.filter((i) => i.used) ?? [];
  const byId = new Map((ideas ?? []).map((i) => [i.id, i]));

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
            <span className="text-sm font-medium text-foreground">Ideas</span>
          </>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Idea bank</h1>
        <p className="mt-1 text-sm text-muted">
          Jot down ad ideas the moment they come up — type or just talk. Luna keeps them in one
          place, groups them into themes, and turns any idea into a storyboard.
        </p>

        {/* Capture */}
        <Card className="mt-6 p-4">
          <Textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Film the morning bread coming out of the oven — people love the smell when they walk past"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void save();
            }}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {dictation.supported && (
                <Button
                  variant={dictation.listening ? "primary" : "secondary"}
                  size="sm"
                  onClick={dictation.listening ? dictation.stop : dictation.start}
                >
                  {dictation.listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {dictation.listening ? "Stop" : "Dictate"}
                </Button>
              )}
              {dictation.listening && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-accent-strong">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Listening…
                </span>
              )}
              {dictation.error && <span className="text-[11px] text-danger">{dictation.error}</span>}
            </div>
            <Button size="sm" onClick={save} loading={saving} disabled={!draft.trim()}>
              <Lightbulb className="h-3.5 w-3.5" /> Save idea
            </Button>
          </div>
        </Card>

        {error && (
          <div className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>
        )}

        {/* Organise */}
        {open.length >= 2 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-muted-strong">
              {themes ? "Themes" : `Your ideas (${open.length})`}
            </h2>
            <div className="flex items-center gap-2">
              {themes && (
                <Button size="sm" variant="ghost" onClick={() => setThemes(null)}>
                  Show list
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={organize}
                disabled={organizing || !ai.geminiConnected}
                title={ai.geminiConnected ? undefined : "Connect your Gemini key in Profile to use AI"}
              >
                {organizing ? <Spinner className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                {themes ? "Re-organise" : "Organise with AI"}
              </Button>
            </div>
          </div>
        )}
        {!ai.geminiConnected && open.length >= 2 && (
          <p className="mt-1 text-[11px] text-muted">
            <Link href="/profile#gemini" className="text-accent-strong hover:underline">
              Connect your Gemini key
            </Link>{" "}
            to group ideas into themes with AI.
          </p>
        )}

        {/* Themes view */}
        {themes && (
          <div className="mt-3 space-y-3">
            {themes.map((t) => (
              <Card key={t.title} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{t.title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{t.summary}</p>
                  </div>
                  <Button size="sm" onClick={() => setBrief({ key: `theme-${t.title}`, text: t.brief })}>
                    <Wand2 className="h-3.5 w-3.5" /> Make a storyboard
                  </Button>
                </div>
                <ul className="mt-3 space-y-1 border-t border-border pt-3">
                  {t.ideaIds.map((id) => (
                    <li key={id} className="text-xs text-muted-strong">
                      “{byId.get(id)?.text}”
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}

        {/* List view */}
        {!themes && (
          <div className="mt-3 space-y-2">
            {ideas === null && <div className="h-20 rounded-xl luna-shimmer" />}
            {ideas?.length === 0 && (
              <Card className="p-6 text-center text-sm text-muted">
                No ideas yet. Save the first one above — even half a sentence is fine.
              </Card>
            )}
            {[...open, ...used].map((idea) => (
              <Card key={idea.id} className={cn("flex items-start gap-3 p-3", idea.used && "opacity-60")}>
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-matcha-soft">
                  {idea.source === "dictated" ? (
                    <Mic className="h-3.5 w-3.5 text-matcha-strong" />
                  ) : (
                    <Lightbulb className="h-3.5 w-3.5 text-matcha-strong" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm text-foreground", idea.used && "line-through")}>{idea.text}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {timeAgo(new Date(idea.created_at).getTime())}
                    {idea.source === "dictated" && " · dictated"}
                    {idea.used && " · used"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!idea.used && (
                    <Button size="sm" variant="secondary" onClick={() => setBrief({ key: idea.id, text: idea.text })}>
                      <Wand2 className="h-3.5 w-3.5" /> Storyboard
                    </Button>
                  )}
                  <button
                    onClick={() => toggleUsed(idea)}
                    className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
                    title={idea.used ? "Mark as not used" : "Mark as used"}
                    aria-label={idea.used ? "Mark as not used" : "Mark as used"}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(idea.id)}
                    className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete idea"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {brief && (
        <DraftWithAIModal
          key={brief.key}
          open
          initialBrief={brief.text}
          onClose={() => setBrief(null)}
        />
      )}
    </>
  );
}
