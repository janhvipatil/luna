import { describe, expect, it } from "vitest";
import type { StoryboardRow } from "@/lib/supabase/types";
import type { Storyboard } from "@/lib/types";
import { rowToStoryboard, storyboardToRow } from "./mappers";

function row(overrides: Partial<StoryboardRow> = {}): StoryboardRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "u1",
    title: "Test",
    description: "",
    format: "9:16",
    is_shared: false,
    music_url: null,
    scenes: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    ...overrides,
  };
}

describe("rowToStoryboard", () => {
  it("maps core fields and timestamps", () => {
    const sb = rowToStoryboard(row({ title: "Hello", is_shared: true }));
    expect(sb.title).toBe("Hello");
    expect(sb.isShared).toBe(true);
    expect(sb.createdAt).toBe(Date.parse("2026-01-01T00:00:00Z"));
  });

  it("falls back to 9:16 for an invalid format", () => {
    expect(rowToStoryboard(row({ format: "bogus" })).format).toBe("9:16");
  });

  it("derives scene status from the asset and coerces bad styles", () => {
    const sb = rowToStoryboard(
      row({
        scenes: [
          { id: "s1", title: "A", prompt: "p", style: "???", medium: "image", durationSec: 3 },
          { id: "s2", title: "B", prompt: "p", style: "anime", medium: "video", durationSec: 4, asset: { url: "u" } },
        ],
      }),
    );
    expect(sb.scenes[0].style).toBe("cinematic");
    expect(sb.scenes[0].status).toBe("idle");
    expect(sb.scenes[1].status).toBe("ready");
    expect(sb.scenes[1].medium).toBe("video");
  });
});

describe("storyboardToRow", () => {
  const base: Storyboard = {
    id: "sb1",
    title: "T",
    description: "d",
    format: "1:1",
    isShared: true,
    createdAt: 0,
    updatedAt: 0,
    scenes: [
      { id: "s1", title: "A", prompt: "p", script: "", style: "cinematic", medium: "image", durationSec: 3, status: "generating" },
    ],
  };

  it("normalizes transient status to idle and includes is_shared", () => {
    const r = storyboardToRow(base);
    expect(r.is_shared).toBe(true);
    const scenes = r.scenes as Array<{ status: string }>;
    expect(scenes[0].status).toBe("idle");
  });

  it("round-trips through rowToStoryboard", () => {
    const r = storyboardToRow(base);
    const back = rowToStoryboard(row({ ...r, user_id: "u", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" } as StoryboardRow));
    expect(back.title).toBe("T");
    expect(back.format).toBe("1:1");
    expect(back.isShared).toBe(true);
  });
});
