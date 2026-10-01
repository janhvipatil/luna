import { describe, expect, it } from "vitest";
import { createUuid, fitDurationToAudio, formatDuration, isVideoUrl, timeAgo } from "./utils";

describe("createUuid", () => {
  it("produces an RFC-4122 v4 uuid", () => {
    expect(createUuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
  it("produces unique values", () => {
    expect(createUuid()).not.toBe(createUuid());
  });
});

describe("isVideoUrl", () => {
  it("detects video file extensions", () => {
    expect(isVideoUrl("https://x/clip.mp4")).toBe(true);
    expect(isVideoUrl("https://x/clip.webm?token=1")).toBe(true);
    expect(isVideoUrl("data:video/mp4;base64,AAAA")).toBe(true);
  });
  it("treats images and svg data urls as non-video", () => {
    expect(isVideoUrl("https://x/img.png")).toBe(false);
    expect(isVideoUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
  });
});

describe("formatDuration", () => {
  it("formats seconds as m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(75)).toBe("1:15");
  });
});

describe("fitDurationToAudio", () => {
  it("rounds up with breathing room and clamps to 1–30s", () => {
    expect(fitDurationToAudio(4.1)).toBe(5);
    expect(fitDurationToAudio(0.2)).toBe(1);
    expect(fitDurationToAudio(100)).toBe(30);
  });
  it("falls back to 3s for an unknown length", () => {
    expect(fitDurationToAudio(0)).toBe(3);
    expect(fitDurationToAudio(NaN)).toBe(3);
    expect(fitDurationToAudio(Infinity)).toBe(3);
  });
});

describe("timeAgo", () => {
  it("buckets recent times", () => {
    expect(timeAgo(Date.now())).toBe("just now");
    expect(timeAgo(Date.now() - 5 * 60_000)).toBe("5m ago");
    expect(timeAgo(Date.now() - 3 * 3_600_000)).toBe("3h ago");
  });
});
