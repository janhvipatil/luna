import { describe, expect, it } from "vitest";
import { fontFamily, parseBrandKit } from "./brand";

describe("parseBrandKit", () => {
  it("returns empty object for null/invalid input", () => {
    expect(parseBrandKit(null)).toEqual({});
    expect(parseBrandKit("nope" as never)).toEqual({});
    expect(parseBrandKit([] as never)).toEqual({});
  });
  it("keeps valid fields and drops invalid ones", () => {
    expect(
      parseBrandKit({ color: "#abc", font: "serif", logoUrl: "https://x/l.png" }),
    ).toEqual({ color: "#abc", font: "serif", logoUrl: "https://x/l.png" });
  });
  it("rejects a malformed color and unknown font", () => {
    expect(parseBrandKit({ color: "red", font: "comic" })).toEqual({});
  });
});

describe("fontFamily", () => {
  it("maps choices to families, defaulting to sans", () => {
    expect(fontFamily("serif")).toMatch(/Georgia/);
    expect(fontFamily("mono")).toMatch(/mono/i);
    expect(fontFamily(undefined)).toMatch(/system-ui/);
  });
});
