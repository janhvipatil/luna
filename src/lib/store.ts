"use client";

import { create } from "zustand";
import type {
  AspectRatio,
  GeneratedAsset,
  GenerationStatus,
  Scene,
  Storyboard,
  Template,
  VisualStyle,
} from "./types";
import { DEFAULT_SCENE_PROMPT } from "./constants";
import { createId, createUuid } from "./utils";

/**
 * Client-side application state — the source of truth the UI renders from.
 *
 * Data is owned per-user in Supabase (see lib/data). This store is hydrated
 * from the server on load and mirrored back by the StoreSync reconciler, so the
 * editor stays snappy (local mutations) while every change is persisted.
 */

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface LunaState {
  storyboards: Record<string, Storyboard>;
  /** True once the initial server fetch has populated the store. */
  hydrated: boolean;
  /** Persistence status surfaced by StoreSync (for the autosave indicator). */
  saveStatus: SaveStatus;
  /** Preferred generation provider id (see lib/providers). */
  providerId: string;

  /** Replace all storyboards with server data (initial load / re-fetch). */
  hydrate: (storyboards: Storyboard[]) => void;
  /** Clear all state (on sign-out). */
  reset: () => void;
  setSaveStatus: (status: SaveStatus) => void;

  // Storyboard CRUD
  createStoryboard: (input: { title: string; description?: string; format: AspectRatio }) => string;
  createFromTemplate: (template: Template, titleOverride?: string) => string;
  updateStoryboard: (
    id: string,
    patch: Partial<Pick<Storyboard, "title" | "description" | "format" | "musicUrl">>,
  ) => void;
  deleteStoryboard: (id: string) => void;
  duplicateStoryboard: (id: string) => string | undefined;
  setStoryboardShared: (id: string, shared: boolean) => void;

  // Scene CRUD
  addScene: (storyboardId: string, afterSceneId?: string) => string | undefined;
  duplicateScene: (storyboardId: string, sceneId: string) => string | undefined;
  updateScene: (storyboardId: string, sceneId: string, patch: Partial<Scene>) => void;
  deleteScene: (storyboardId: string, sceneId: string) => void;
  reorderScenes: (storyboardId: string, orderedIds: string[]) => void;

  // Generation lifecycle
  setSceneStatus: (storyboardId: string, sceneId: string, status: GenerationStatus, error?: string) => void;
  setSceneAsset: (storyboardId: string, sceneId: string, asset: GeneratedAsset) => void;
  /** Make a previous take the active asset for a scene. */
  selectTake: (storyboardId: string, sceneId: string, asset: GeneratedAsset) => void;

  setProviderId: (id: string) => void;
}

/** Cap on how many prior takes to keep per scene. */
const MAX_TAKES = 8;

function newScene(overrides: Partial<Scene> = {}): Scene {
  return {
    id: createId("scene"),
    title: "New scene",
    prompt: DEFAULT_SCENE_PROMPT,
    script: "",
    style: "cinematic" as VisualStyle,
    medium: "image",
    durationSec: 3,
    status: "idle",
    ...overrides,
  };
}

/** Immutably update one storyboard, bumping its updatedAt. */
function withStoryboard(
  state: LunaState,
  id: string,
  fn: (sb: Storyboard) => Storyboard,
): Pick<LunaState, "storyboards"> {
  const sb = state.storyboards[id];
  if (!sb) return { storyboards: state.storyboards };
  const next = fn(sb);
  next.updatedAt = Date.now();
  return { storyboards: { ...state.storyboards, [id]: next } };
}

export const useLunaStore = create<LunaState>()((set, get) => ({
      storyboards: {},
      hydrated: false,
      saveStatus: "idle",
      providerId: "auto",

      hydrate: (list) =>
        set({
          storyboards: Object.fromEntries(list.map((sb) => [sb.id, sb])),
          hydrated: true,
        }),

      reset: () => set({ storyboards: {}, hydrated: false }),
      setSaveStatus: (saveStatus) => set({ saveStatus }),

      createStoryboard: ({ title, description = "", format }) => {
        const id = createUuid();
        const now = Date.now();
        const sb: Storyboard = {
          id,
          title: title.trim() || "Untitled storyboard",
          description,
          format,
          scenes: [newScene({ title: "Opening" })],
          isShared: false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ storyboards: { ...s.storyboards, [id]: sb } }));
        return id;
      },

      createFromTemplate: (template, titleOverride) => {
        const id = createUuid();
        const now = Date.now();
        const sb: Storyboard = {
          id,
          title: titleOverride?.trim() || template.name,
          description: template.description,
          format: template.format,
          // Pre-generated assets arrive ready, with the asset as the first take.
          scenes: template.scenes.map((s) =>
            newScene(s.asset ? { ...s, status: "ready", takes: [s.asset] } : s),
          ),
          isShared: false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ storyboards: { ...s.storyboards, [id]: sb } }));
        return id;
      },

      updateStoryboard: (id, patch) =>
        set((s) => withStoryboard(s, id, (sb) => ({ ...sb, ...patch }))),

      setStoryboardShared: (id, shared) =>
        set((s) => withStoryboard(s, id, (sb) => ({ ...sb, isShared: shared }))),

      deleteStoryboard: (id) =>
        set((s) => {
          const next = { ...s.storyboards };
          delete next[id];
          return { storyboards: next };
        }),

      duplicateStoryboard: (id) => {
        const source = get().storyboards[id];
        if (!source) return undefined;
        const newId = createUuid();
        const now = Date.now();
        const copy: Storyboard = {
          ...source,
          id: newId,
          title: `${source.title} (copy)`,
          isShared: false,
          scenes: source.scenes.map((sc) => ({
            ...sc,
            id: createId("scene"),
            // A copy starts fresh — assets belong to the original run.
            status: "idle",
            asset: undefined,
            error: undefined,
          })),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ storyboards: { ...s.storyboards, [newId]: copy } }));
        return newId;
      },

      addScene: (storyboardId, afterSceneId) => {
        const sb = get().storyboards[storyboardId];
        if (!sb) return undefined;
        const scene = newScene();
        const idx = afterSceneId ? sb.scenes.findIndex((s) => s.id === afterSceneId) : -1;
        set((s) =>
          withStoryboard(s, storyboardId, (cur) => {
            const scenes = [...cur.scenes];
            if (idx >= 0) scenes.splice(idx + 1, 0, scene);
            else scenes.push(scene);
            return { ...cur, scenes };
          }),
        );
        return scene.id;
      },

      duplicateScene: (storyboardId, sceneId) => {
        const sb = get().storyboards[storyboardId];
        if (!sb) return undefined;
        const source = sb.scenes.find((s) => s.id === sceneId);
        if (!source) return undefined;
        // Copy the creative settings but start fresh — a duplicate is a new
        // take to generate, not a copy of the generated asset.
        const copy = newScene({
          title: `${source.title} copy`,
          prompt: source.prompt,
          script: source.script,
          style: source.style,
          medium: source.medium,
          durationSec: source.durationSec,
          seed: source.seed,
        });
        const idx = sb.scenes.findIndex((s) => s.id === sceneId);
        set((s) =>
          withStoryboard(s, storyboardId, (cur) => {
            const scenes = [...cur.scenes];
            scenes.splice(idx + 1, 0, copy);
            return { ...cur, scenes };
          }),
        );
        return copy.id;
      },

      updateScene: (storyboardId, sceneId, patch) =>
        set((s) =>
          withStoryboard(s, storyboardId, (sb) => ({
            ...sb,
            scenes: sb.scenes.map((sc) => (sc.id === sceneId ? { ...sc, ...patch } : sc)),
          })),
        ),

      deleteScene: (storyboardId, sceneId) =>
        set((s) =>
          withStoryboard(s, storyboardId, (sb) => ({
            ...sb,
            scenes: sb.scenes.filter((sc) => sc.id !== sceneId),
          })),
        ),

      reorderScenes: (storyboardId, orderedIds) =>
        set((s) =>
          withStoryboard(s, storyboardId, (sb) => {
            const byId = new Map(sb.scenes.map((sc) => [sc.id, sc]));
            const scenes = orderedIds.map((id) => byId.get(id)).filter((x): x is Scene => Boolean(x));
            // Guard against dropped ids: keep any scene not present in the list.
            const missing = sb.scenes.filter((sc) => !orderedIds.includes(sc.id));
            return { ...sb, scenes: [...scenes, ...missing] };
          }),
        ),

      setSceneStatus: (storyboardId, sceneId, status, error) =>
        set((s) =>
          withStoryboard(s, storyboardId, (sb) => ({
            ...sb,
            scenes: sb.scenes.map((sc) =>
              sc.id === sceneId ? { ...sc, status, error: status === "error" ? error : undefined } : sc,
            ),
          })),
        ),

      setSceneAsset: (storyboardId, sceneId, asset) =>
        set((s) =>
          withStoryboard(s, storyboardId, (sb) => ({
            ...sb,
            scenes: sb.scenes.map((sc) => {
              if (sc.id !== sceneId) return sc;
              // Keep the new asset plus recent prior takes (newest first, deduped).
              const history = [asset, ...(sc.takes ?? [])]
                .filter((a, i, arr) => arr.findIndex((b) => b.url === a.url) === i)
                .slice(0, MAX_TAKES);
              return { ...sc, asset, takes: history, status: "ready", error: undefined };
            }),
          })),
        ),

      selectTake: (storyboardId, sceneId, asset) =>
        set((s) =>
          withStoryboard(s, storyboardId, (sb) => ({
            ...sb,
            scenes: sb.scenes.map((sc) =>
              sc.id === sceneId ? { ...sc, asset, status: "ready", error: undefined } : sc,
            ),
          })),
        ),

      setProviderId: (id) => set({ providerId: id }),
}));

/**
 * Sort storyboards newest-first. Not a hook selector — it allocates a new array
 * each call, so pass `state.storyboards` through `useMemo` in the component
 * rather than handing this to `useLunaStore` directly.
 */
export function sortStoryboards(map: Record<string, Storyboard>): Storyboard[] {
  return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
}
