"use client";

import { useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLunaStore } from "@/lib/store";
import type { Storyboard } from "@/lib/types";
import type { StoryboardRow } from "@/lib/supabase/types";
import { rowToStoryboard, storyboardToRow } from "./mappers";

const AUTOSAVE_MS = 800;

/** Best-effort removal of a storyboard's files from the assets bucket. */
async function removeStoryboardAssets(
  supabase: ReturnType<typeof createClient>,
  userId: string | null,
  storyboardId: string,
) {
  if (!userId) return;
  const prefix = `${userId}/${storyboardId}`;
  const { data: files, error } = await supabase.storage.from("assets").list(prefix, {
    limit: 1000,
  });
  if (error || !files?.length) return;
  const paths = files.map((f) => `${prefix}/${f.name}`);
  const { error: rmErr } = await supabase.storage.from("assets").remove(paths);
  if (rmErr) console.error("Failed to clean up storyboard assets:", rmErr.message);
}

/**
 * Keeps the client store and the user's Supabase rows in sync.
 *
 * On mount it fetches the user's storyboards and hydrates the store. Then it
 * subscribes to the store and mirrors every change back to Postgres:
 *   - new storyboard  → upsert immediately (durability before navigation),
 *   - edited storyboard → debounced upsert (coalesces keystrokes / drags),
 *   - removed storyboard → delete.
 *
 * `knownRef` tracks the last persisted updatedAt per id, and is seeded before
 * hydrate() so loading server data isn't mistaken for local edits. RLS scopes
 * every query to the signed-in user, so no user_id handling is needed here.
 */
export function StoreSync() {
  const supabase = useMemo(() => createClient(), []);
  const hydrate = useLunaStore((s) => s.hydrate);
  const knownRef = useRef<Map<string, number>>(new Map());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const userIdRef = useRef<string | null>(null);

  // Initial load.
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userIdRef.current = user?.id ?? null;

      const { data, error } = await supabase
        .from("storyboards")
        .select("*")
        .order("updated_at", { ascending: false });
      if (!active) return;
      if (error) {
        console.error("Failed to load storyboards:", error.message);
        hydrate([]);
        return;
      }
      const list = (data as StoryboardRow[]).map(rowToStoryboard);
      knownRef.current = new Map(list.map((sb) => [sb.id, sb.updatedAt]));
      hydrate(list);
    })();
    return () => {
      active = false;
    };
  }, [supabase, hydrate]);

  // Mirror store → Supabase.
  useEffect(() => {
    const timers = timersRef.current;

    const setStatus = (s: "saving" | "saved" | "error") =>
      useLunaStore.getState().setSaveStatus(s);

    const upsert = async (sb: Storyboard) => {
      setStatus("saving");
      const { error } = await supabase.from("storyboards").upsert(storyboardToRow(sb));
      if (error) {
        console.error("Failed to save storyboard:", error.message);
        setStatus("error");
      } else {
        setStatus("saved");
      }
    };

    const scheduleUpsert = (sb: Storyboard) => {
      setStatus("saving");
      const existing = timers.get(sb.id);
      if (existing) clearTimeout(existing);
      timers.set(
        sb.id,
        setTimeout(() => {
          timers.delete(sb.id);
          void upsert(sb);
        }, AUTOSAVE_MS),
      );
    };

    const unsub = useLunaStore.subscribe((state) => {
      const current = state.storyboards;

      for (const id in current) {
        const sb = current[id];
        const known = knownRef.current.get(id);
        if (known === undefined) {
          knownRef.current.set(id, sb.updatedAt);
          void upsert(sb); // new → persist now
        } else if (known !== sb.updatedAt) {
          knownRef.current.set(id, sb.updatedAt);
          scheduleUpsert(sb); // edited → debounce
        }
      }

      for (const id of Array.from(knownRef.current.keys())) {
        if (!(id in current)) {
          knownRef.current.delete(id);
          const t = timers.get(id);
          if (t) {
            clearTimeout(t);
            timers.delete(id);
          }
          setStatus("saving");
          void supabase
            .from("storyboards")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) {
                console.error("Failed to delete storyboard:", error.message);
                setStatus("error");
              } else {
                setStatus("saved");
                // Clean up the storyboard's generated assets (best-effort) so
                // Storage doesn't accumulate orphans. The DB rows (jobs) cascade
                // automatically; Storage files don't.
                void removeStoryboardAssets(supabase, userIdRef.current, id);
              }
            });
        }
      }
    });

    return () => {
      unsub();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [supabase]);

  return null;
}
