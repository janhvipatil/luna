import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { veoAspect, veoClipLength, veoProvider } from "./veo";
import { resolveProvider } from "./index";

const ctx = { geminiKey: "test-key", geminiImages: false, videoTier: "fast" as const };
const noKey = { geminiImages: false, videoTier: "fast" as const };
const req = { prompt: "Matcha whisked into foam", style: "food-closeup" as const, medium: "video" as const, aspect: "4:5" as const };

describe("veo helpers", () => {
  it("picks the shortest clip that covers the scene", () => {
    expect(veoClipLength(2)).toBe(4);
    expect(veoClipLength(5)).toBe(6);
    expect(veoClipLength(8)).toBe(8);
    expect(veoClipLength(12)).toBe(8);
  });
  it("maps every format onto Veo's two aspect ratios", () => {
    expect(veoAspect("16:9")).toBe("16:9");
    expect(veoAspect("9:16")).toBe("9:16");
    expect(veoAspect("4:5")).toBe("9:16");
    expect(veoAspect("1:1")).toBe("9:16");
  });
});

describe("veo provider", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("starts a text-to-video operation with the right body", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ name: "models/veo/operations/abc" })));
    const { operation } = await veoProvider.start!({ ...req, durationSec: 3 }, ctx);
    expect(operation).toBe("models/veo/operations/abc");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("models/veo-3.1-fast-generate-preview:predictLongRunning");
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    const body = JSON.parse(init.body);
    expect(body.parameters).toEqual({ aspectRatio: "9:16", durationSeconds: "4", resolution: "720p" });
    expect(body.instances[0].prompt).toMatch(/^Matcha whisked into foam/);
    expect(body.instances[0].image).toBeUndefined();
  });

  it("sends the start frame for image-to-video", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/jpeg" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: "op/1" })));
    await veoProvider.start!({ ...req, startImageUrl: "https://x/photo.jpg" }, ctx);
    const body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body.instances[0].image.inlineData).toEqual({ mimeType: "image/jpeg", data: "AQID" });
    expect(body.parameters.personGeneration).toBe("allow_adult");
  });

  it("rejects start frames Veo can't use", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } }));
    await expect(veoProvider.start!({ ...req, startImageUrl: "https://x/a.svg" }, ctx)).rejects.toThrow(/JPEG or PNG/);
  });

  it("reports pending, done and filtered operations", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ name: "op/1", done: false })));
    expect(await veoProvider.poll!("op/1", ctx)).toEqual({ done: false });

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ name: "op/1", done: true, response: { generateVideoResponse: { generatedSamples: [{ video: { uri: "https://g/v.mp4" } }] } } })),
    );
    expect(await veoProvider.poll!("op/1", ctx)).toEqual({ done: true, result: { url: "https://g/v.mp4", medium: "video", providerId: "veo" } });

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ name: "op/1", done: true, response: { generateVideoResponse: { raiMediaFilteredReasons: ["unsafe"] } } })),
    );
    expect(await veoProvider.poll!("op/1", ctx)).toMatchObject({ done: true, error: expect.stringContaining("unsafe") });
  });

  it("surfaces API errors", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: "API key not valid" } }), { status: 400 }));
    await expect(veoProvider.start!(req, ctx)).rejects.toThrow(/isn't valid/);
  });
});

describe("auto routing", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("sends video to Veo and stills elsewhere when a key is set", () => {
    expect(resolveProvider("auto", req, ctx).id).toBe("veo");
    expect(resolveProvider("auto", { ...req, medium: "image" }, ctx).id).not.toBe("veo");
  });
  it("falls back to the preview without a key", () => {
    expect(resolveProvider("auto", req, noKey).id).toBe("mock");
  });
});
