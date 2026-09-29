"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
import { createId } from "./utils";

/**
 * Client-side application state, persisted to localStorage. Luna is local-first
 * by design — a user's storyboards live in their browser and generation is the
 * only thing that hits the network. This keeps the tool instantly usable with
 * zero backend/auth setup while leaving room to sync later.
 */

interface LunaState {
  storyboards: Record<string, Storyboard>;
  /** Preferred generation provider id (see lib/providers). */
  providerId: string;

  // Storyboard CRUD
  createStoryboard: (input: { title: string; description?: string; format: AspectRatio }) => string;
  createFromTemplate: (template: Template, titleOverride?: string) => string;
  updateStoryboard: (id: string, patch: Partial<Pick<Storyboard, "title" | "description" | "format">>) => void;
  deleteStoryboard: (id: string) => void;
  duplicateStoryboard: (id: string) => string | undefined;

  // Scene CRUD
  addScene: (storyboardId: string, afterSceneId?: string) => string | undefined;
  updateScene: (storyboardId: string, sceneId: string, patch: Partial<Scene>) => void;
  deleteScene: (storyboardId: string, sceneId: string) => void;
  reorderScenes: (storyboardId: string, orderedIds: string[]) => void;

  // Generation lifecycle
  setSceneStatus: (storyboardId: string, sceneId: string, status: GenerationStatus, error?: string) => void;
  setSceneAsset: (storyboardId: string, sceneId: string, asset: GeneratedAsset) => void;

  setProviderId: (id: string) => void;
}

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

export const useLunaStore = create<LunaState>()(
  persist(
    (set, get) => ({
      storyboards: {},
      providerId: "mock",

      createStoryboard: ({ title, description = "", format }) => {
        const id = createId("sb");
        const now = Date.now();
        const sb: Storyboard = {
          id,
          title: title.trim() || "Untitled storyboard",
          description,
          format,
          scenes: [newScene({ title: "Opening" })],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ storyboards: { ...s.storyboards, [id]: sb } }));
        return id;
      },

      createFromTemplate: (template, titleOverride) => {
        const id = createId("sb");
        const now = Date.now();
        const sb: Storyboard = {
          id,
          title: titleOverride?.trim() || template.name,
          description: template.description,
          format: template.format,
          scenes: template.scenes.map((s) => newScene(s)),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ storyboards: { ...s.storyboards, [id]: sb } }));
        return id;
      },

      updateStoryboard: (id, patch) =>
        set((s) => withStoryboard(s, id, (sb) => ({ ...sb, ...patch }))),

      deleteStoryboard: (id) =>
        set((s) => {
          const next = { ...s.storyboards };
          delete next[id];
          return { storyboards: next };
        }),

      duplicateStoryboard: (id) => {
        const source = get().storyboards[id];
        if (!source) return undefined;
        const newId = createId("sb");
        const now = Date.now();
        const copy: Storyboard = {
          ...source,
          id: newId,
          title: `${source.title} (copy)`,
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
            scenes: sb.scenes.map((sc) =>
              sc.id === sceneId ? { ...sc, asset, status: "ready", error: undefined } : sc,
            ),
          })),
        ),

      setProviderId: (id) => set({ providerId: id }),
    }),
    {
      name: "luna-store-v1",
      version: 1,
    },
  ),
);

/** Selector helpers. */
export function selectStoryboardList(state: LunaState): Storyboard[] {
  return Object.values(state.storyboards).sort((a, b) => b.updatedAt - a.updatedAt);
}
