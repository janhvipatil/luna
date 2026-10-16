import { describe, expect, it } from "vitest";
import { describeVenue, parseVenue, personalize } from "./venue";
import { parseBrandKit } from "./brand";
import { TEMPLATES, personalizeTemplate } from "./templates";
import { EXAMPLE_STORYBOARDS, EXAMPLE_VENUE } from "./examples";
import { VISUAL_STYLES } from "./constants";

describe("parseVenue", () => {
  it("returns undefined for empty/invalid input", () => {
    expect(parseVenue(null)).toBeUndefined();
    expect(parseVenue({})).toBeUndefined();
    expect(parseVenue({ name: "  " })).toBeUndefined();
  });
  it("keeps valid fields and drops an unknown type", () => {
    expect(parseVenue({ name: " Match Ya ", type: "spaceship", signature: "matcha" })).toEqual({
      name: "Match Ya",
      signature: "matcha",
    });
  });
  it("is read from the brand kit", () => {
    expect(parseBrandKit({ venue: { name: "Match Ya", type: "cafe" } }).venue).toEqual({
      name: "Match Ya",
      type: "cafe",
    });
  });
});

describe("personalize", () => {
  it("fills tokens from the venue", () => {
    expect(personalize("Only at {venue}.", { name: "Match Ya" })).toBe("Only at Match Ya.");
  });
  it("falls back gracefully and capitalises at sentence start", () => {
    expect(personalize("Welcome to {venue}.")).toBe("Welcome to our café.");
    expect(personalize("{venue} is open.", { type: "bakery" })).toBe("Our bakery is open.");
  });
  it("leaves unknown tokens alone", () => {
    expect(personalize("Hi {nope}")).toBe("Hi {nope}");
  });
});

describe("templates", () => {
  const styleIds = VISUAL_STYLES.map((s) => s.id);

  it("leaves no unfilled tokens after personalising", () => {
    for (const t of TEMPLATES) {
      const p = personalizeTemplate(t, EXAMPLE_VENUE);
      const text = JSON.stringify(p.scenes) + p.name + p.description;
      expect(text, t.id).not.toMatch(/\{\w+\}/);
    }
  });

  it("uses only known styles and unique ids", () => {
    const all = [...TEMPLATES, ...EXAMPLE_STORYBOARDS];
    expect(new Set(all.map((t) => t.id)).size).toBe(all.length);
    for (const t of all) for (const s of t.scenes) expect(styleIds).toContain(s.style);
  });
});

describe("describeVenue", () => {
  it("is empty without a venue and lists fields with one", () => {
    expect(describeVenue()).toBe("");
    expect(describeVenue(EXAMPLE_VENUE)).toMatch(/Name: Match Ya/);
  });
});
