import { describe, expect, it } from "vitest";
import { NON_PHOTO_STYLES, PHOTOS, photoUrlForAspect, pickPhoto } from "./photos";
import { TEMPLATES } from "./templates";
import { EXAMPLE_STORYBOARDS } from "./examples";

const ids = new Set(PHOTOS.map((p) => p.id));
const tagged = (id: string) => PHOTOS.find((p) => p.id === id)!.tags;

describe("pickPhoto", () => {
  it("matches prompts to the right subject", () => {
    expect(tagged(pickPhoto("Chopsticks lifting ramen noodles, steam"))).toContain("ramen");
    expect(tagged(pickPhoto("Matcha whisked in a chawan"))).toContain("matcha");
    expect(tagged(pickPhoto("Hands tearing a croissant in half"))).toContain("croissant");
    // The subject beats incidental words like "pour" / "ice".
    expect(tagged(pickPhoto("Matcha poured over oat milk and ice in a tall clear glass"))).toContain("matcha");
  });
  it("falls back by style when nothing matches", () => {
    expect(ids.has(pickPhoto("zzz qqq", { style: "cozy-ambient" }))).toBe(true);
  });
  it("is deterministic for the same text and seed", () => {
    expect(pickPhoto("latte art", { seed: 3 })).toBe(pickPhoto("latte art", { seed: 3 }));
  });
});

describe("photo library", () => {
  it("has unique ids", () => {
    expect(ids.size).toBe(PHOTOS.length);
  });
  it("every template cover is a known photo", () => {
    for (const t of [...TEMPLATES, ...EXAMPLE_STORYBOARDS]) {
      expect(t.cover, t.id).toBeDefined();
      expect(ids.has(t.cover!), t.id).toBe(true);
    }
  });
  it("crops to the storyboard aspect", () => {
    expect(photoUrlForAspect("1-a", "9:16")).toContain("w=608&h=1080");
  });
});

describe("pre-generated template assets", () => {
  it("gives every photo-style scene a ready still in the template's format", async () => {
    const { withPreviewAssets } = await import("./templates");
    for (const t of [...TEMPLATES, ...EXAMPLE_STORYBOARDS]) {
      const filled = withPreviewAssets(t);
      filled.scenes.forEach((s) => {
        // Illustration looks are generated on demand, not pre-filled.
        if (NON_PHOTO_STYLES.includes(s.style)) return expect(s.asset).toBeUndefined();
        expect(s.asset?.url, `${t.id}: ${s.title}`).toMatch(/fm=jpg|\/examples\//);
      });
    }
  });

  it("creates storyboards whose pre-filled scenes are ready", async () => {
    const { withPreviewAssets } = await import("./templates");
    const { useLunaStore } = await import("./store");
    const id = useLunaStore.getState().createFromTemplate(withPreviewAssets(TEMPLATES[0]));
    const sb = useLunaStore.getState().storyboards[id];
    const photoScenes = sb.scenes.filter((s) => !NON_PHOTO_STYLES.includes(s.style));
    expect(photoScenes.every((s) => s.status === "ready" && s.takes?.length === 1)).toBe(true);
  });
});
