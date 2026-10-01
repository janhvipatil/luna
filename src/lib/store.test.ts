import { beforeEach, describe, expect, it } from "vitest";
import { useLunaStore } from "./store";
import type { GeneratedAsset } from "./types";

const reset = () => useLunaStore.setState({ storyboards: {}, hydrated: false, saveStatus: "idle" });

function asset(url: string): GeneratedAsset {
  return { url, medium: "image", providerId: "mock", createdAt: Date.now() };
}

describe("storyboard CRUD", () => {
  beforeEach(reset);

  it("creates a storyboard with a uuid id and one scene", () => {
    const id = useLunaStore.getState().createStoryboard({ title: "My SB", format: "9:16" });
    const sb = useLunaStore.getState().storyboards[id];
    expect(sb.title).toBe("My SB");
    expect(sb.isShared).toBe(false);
    expect(sb.scenes).toHaveLength(1);
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("adds and reorders scenes", () => {
    const store = useLunaStore.getState();
    const id = store.createStoryboard({ title: "x", format: "1:1" });
    const first = useLunaStore.getState().storyboards[id].scenes[0].id;
    const second = store.addScene(id, first)!;
    const ids = useLunaStore.getState().storyboards[id].scenes.map((s) => s.id);
    expect(ids).toEqual([first, second]);
    store.reorderScenes(id, [second, first]);
    expect(useLunaStore.getState().storyboards[id].scenes.map((s) => s.id)).toEqual([second, first]);
  });

  it("duplicates a scene after it, copying settings but not the asset", () => {
    const store = useLunaStore.getState();
    const id = store.createStoryboard({ title: "x", format: "1:1" });
    const first = useLunaStore.getState().storyboards[id].scenes[0].id;
    store.updateScene(id, first, { prompt: "a dog", seed: 42 });
    store.setSceneAsset(id, first, asset("u1"));
    const dupId = store.duplicateScene(id, first)!;
    const scenes = useLunaStore.getState().storyboards[id].scenes;
    expect(scenes.map((s) => s.id)).toEqual([first, dupId]);
    const dup = scenes[1];
    expect(dup.prompt).toBe("a dog");
    expect(dup.seed).toBe(42);
    expect(dup.asset).toBeUndefined();
  });

  it("duplicate resets sharing and clears generated assets", () => {
    const store = useLunaStore.getState();
    const id = store.createStoryboard({ title: "orig", format: "1:1" });
    store.setStoryboardShared(id, true);
    const sceneId = useLunaStore.getState().storyboards[id].scenes[0].id;
    store.setSceneAsset(id, sceneId, asset("u1"));
    const copyId = store.duplicateStoryboard(id)!;
    const copy = useLunaStore.getState().storyboards[copyId];
    expect(copy.isShared).toBe(false);
    expect(copy.scenes[0].asset).toBeUndefined();
    expect(copy.scenes[0].status).toBe("idle");
  });
});

describe("takes accumulation", () => {
  beforeEach(reset);

  it("keeps deduped history newest-first and caps the count", () => {
    const store = useLunaStore.getState();
    const id = store.createStoryboard({ title: "x", format: "1:1" });
    const sceneId = useLunaStore.getState().storyboards[id].scenes[0].id;

    store.setSceneAsset(id, sceneId, asset("u1"));
    store.setSceneAsset(id, sceneId, asset("u2"));
    store.setSceneAsset(id, sceneId, asset("u1")); // dupe of first
    const scene = useLunaStore.getState().storyboards[id].scenes[0];

    expect(scene.asset!.url).toBe("u1");
    expect(scene.takes!.map((t) => t.url)).toEqual(["u1", "u2"]);

    for (let i = 0; i < 12; i++) store.setSceneAsset(id, sceneId, asset(`v${i}`));
    expect(useLunaStore.getState().storyboards[id].scenes[0].takes!.length).toBeLessThanOrEqual(8);
  });
});
