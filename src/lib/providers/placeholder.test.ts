import { describe, expect, it } from "vitest";
import { buildPlaceholderSvg, svgToDataUrl } from "./placeholder";

describe("buildPlaceholderSvg", () => {
  it("produces an svg sized to the aspect ratio", () => {
    const svg = buildPlaceholderSvg({ prompt: "a cat", style: "cinematic", aspect: "1:1" });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('width="400"');
    expect(svg).toContain('height="400"');
  });

  it("escapes XML-unsafe characters in the caption", () => {
    const svg = buildPlaceholderSvg({ prompt: "a <b> & \"c\"", style: "anime", aspect: "9:16" });
    expect(svg).toContain("&lt;b&gt;");
    expect(svg).toContain("&amp;");
    expect(svg).not.toMatch(/<b>/);
  });

  it("varies with the seed", () => {
    const a = buildPlaceholderSvg({ prompt: "x", style: "retro", aspect: "16:9", seed: 1 });
    const b = buildPlaceholderSvg({ prompt: "x", style: "retro", aspect: "16:9", seed: 2 });
    expect(a).not.toBe(b);
  });
});

describe("svgToDataUrl", () => {
  it("wraps svg as a base64 data url", () => {
    expect(svgToDataUrl("<svg/>")).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});
