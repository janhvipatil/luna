import type { Scene, Storyboard } from "@/lib/types";
import { FORMAT_PRESETS } from "@/lib/constants";
import { brandName, watermarkColor, type BrandKit } from "@/lib/brand";
import { isVideoUrl } from "@/lib/utils";

function canvasFont(font: BrandKit["font"]): string {
  if (font === "serif") return "Georgia, serif";
  if (font === "mono") return "ui-monospace, monospace";
  return "ui-sans-serif, system-ui, sans-serif";
}

/**
 * Renders a storyboard into a video entirely in the browser.
 *
 * We draw each scene (image + caption) onto a canvas for its duration, capture
 * the canvas as a MediaStream, and record it with MediaRecorder. This needs no
 * server or ffmpeg — the trade-off is that recording happens in real time, so a
 * 20s storyboard takes ~20s to export. Output is WebM (or MP4 where the browser
 * supports it).
 */

export interface RenderOptions {
  /** 0..1 progress callback. */
  onProgress?: (p: number) => void;
  /** Longest edge of the output in px (keeps exports fast). */
  maxDimension?: number;
  fps?: number;
  /** Brand styling applied to captions and a logo watermark. */
  brand?: BrandKit;
  /** false = a silent export ("video only": no music or voiceover). */
  includeAudio?: boolean;
}

export interface RenderResult {
  blob: Blob;
  mimeType: string;
  extension: string;
}

function pickMimeType(): { mimeType: string; extension: string } {
  const candidates: Array<{ mimeType: string; extension: string }> = [
    { mimeType: "video/mp4;codecs=avc1.42E01E", extension: "mp4" },
    { mimeType: "video/webm;codecs=vp9", extension: "webm" },
    { mimeType: "video/webm;codecs=vp8", extension: "webm" },
    { mimeType: "video/webm", extension: "webm" },
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c.mimeType)) {
      return c;
    }
  }
  return { mimeType: "video/webm", extension: "webm" };
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    // Needed so remote (Supabase Storage) images don't taint the canvas.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** A scene's visual: a still image or a video clip (e.g. from Veo). */
type SceneMedia = HTMLImageElement | HTMLVideoElement;

function loadVideo(url: string): Promise<HTMLVideoElement | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.loop = true; // scenes longer than the clip keep moving
    video.preload = "auto";
    video.onloadeddata = () => resolve(video);
    video.onerror = () => resolve(null);
    video.src = url;
  });
}

function loadMedia(url: string): Promise<SceneMedia | null> {
  return isVideoUrl(url) ? loadVideo(url) : loadImage(url);
}

function mediaSize(media: SceneMedia): { width: number; height: number } {
  return media instanceof HTMLVideoElement
    ? { width: media.videoWidth, height: media.videoHeight }
    : { width: media.width, height: media.height };
}

/** Cover-fit an image or video frame into the canvas (like object-fit: cover). */
function drawCover(ctx: CanvasRenderingContext2D, media: SceneMedia, w: number, h: number) {
  const { width, height } = mediaSize(media);
  if (!width || !height) return;
  const scale = Math.max(w / width, h / height);
  const dw = width * scale;
  const dh = height * scale;
  ctx.drawImage(media, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Seconds of the branded end card appended to exports. */
const END_CARD_SEC = 2.5;

/** Closing card: logo (or name) on the brand's accent color, plus the location. */
function drawEndCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brand: BrandKit,
  logo: HTMLImageElement | null,
) {
  ctx.fillStyle = brand.colors?.[0] ?? "#1f2a24";
  ctx.fillRect(0, 0, w, h);
  const ink = brand.color ?? "#ffffff";
  const name = brandName(brand);
  let y = h * 0.42;
  if (logo) {
    const lw = Math.round(w * 0.46);
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, (w - lw) / 2, y - lh / 2, lw, lh);
    y += lh / 2 + w * 0.08;
  } else if (name) {
    ctx.font = `700 ${Math.round(w * 0.085)}px ${canvasFont(brand.font)}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    ctx.fillText(name, w / 2, y, w * 0.86);
    y += w * 0.1;
  }
  const line = brand.venue?.location ?? (logo ? name : undefined);
  if (line) {
    ctx.font = `600 ${Math.round(w * 0.038)}px ${canvasFont(brand.font)}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.85;
    ctx.fillText(line.toUpperCase(), w / 2, y, w * 0.86);
    ctx.globalAlpha = 1;
  }
  // A thin rule in each extra brand color.
  const colors = brand.colors?.slice(1) ?? [];
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, h - (colors.length - i) * Math.round(h * 0.012), w, Math.round(h * 0.012));
  });
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: Scene,
  img: SceneMedia | null,
  brand: BrandKit,
  logo: HTMLImageElement | null,
) {
  // Background.
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, w, h);

  if (img) {
    drawCover(ctx, img, w, h);
  } else {
    // Fallback gradient when a scene has no generated asset.
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#e8738f");
    g.addColorStop(1, "#5f7a45");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Brand logo watermark, top-left.
  if (logo) {
    const lw = Math.round(w * 0.16);
    const lh = (logo.height / logo.width) * lw;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(logo, Math.round(w * 0.05), Math.round(w * 0.05), lw, lh);
    ctx.globalAlpha = 1;
  } else if (brandName(brand)) {
    // No logo: the brand name on a pill in the brand's accent color.
    const name = brandName(brand)!.toUpperCase();
    const fs = Math.round(w * 0.03);
    ctx.font = `700 ${fs}px ${canvasFont(brand.font)}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const px = Math.round(fs * 0.8), ph = Math.round(fs * 2), x = Math.round(w * 0.05), y = Math.round(w * 0.05);
    const tw = Math.min(ctx.measureText(name).width, w * 0.6);
    ctx.fillStyle = watermarkColor(brand);
    ctx.beginPath();
    ctx.roundRect(x, y, tw + px * 2, ph, ph / 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, x + px, y + ph / 2, w * 0.6);
  }

  // Caption (script) at the bottom with a legibility scrim.
  const script = scene.script?.trim();
  if (script) {
    const pad = Math.round(w * 0.06);
    const fontSize = Math.round(w * 0.05);
    ctx.font = `600 ${fontSize}px ${canvasFont(brand.font)}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const lines = wrapText(ctx, script, w - pad * 2);
    const lineHeight = fontSize * 1.3;
    const blockHeight = lines.length * lineHeight;

    const scrim = ctx.createLinearGradient(0, h - blockHeight - pad * 2.5, 0, h);
    scrim.addColorStop(0, "rgba(0,0,0,0)");
    scrim.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, h - blockHeight - pad * 2.5, w, blockHeight + pad * 2.5);

    ctx.fillStyle = brand.color ?? "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;
    lines.forEach((ln, i) => {
      const y = h - pad - (lines.length - 1 - i) * lineHeight;
      ctx.fillText(ln, w / 2, y);
    });
    ctx.shadowBlur = 0;
  }
}

interface PreparedAudio {
  track: MediaStreamTrack;
  ctx: AudioContext;
  start: (t0: number) => void;
  stop: () => void;
}

const MUSIC_GAIN = 0.28;

/**
 * Builds a mixed audio track for the export: background music (looped/trimmed to
 * length, with a short fade-out) plus per-scene narration scheduled at each
 * scene's start offset. Returns null when there's no audio or the browser lacks
 * Web Audio. Decoding needs CORS-enabled URLs (our Storage bucket sends CORS *).
 */
async function prepareAudio(
  musicUrl: string | undefined,
  narrations: Array<{ url: string; offsetSec: number }>,
  totalSec: number,
): Promise<PreparedAudio | null> {
  const AC: typeof AudioContext | undefined =
    typeof window !== "undefined"
      ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  if (!AC) return null;

  const ctx = new AC();
  try {
    await ctx.resume();
  } catch {
    /* resumes on first user gesture; export is user-triggered */
  }

  const dest = ctx.createMediaStreamDestination();
  const load = async (url: string): Promise<AudioBuffer | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await ctx.decodeAudioData(await res.arrayBuffer());
    } catch {
      return null;
    }
  };

  const narrationNodes: Array<{ node: AudioBufferSourceNode; offset: number }> = [];
  for (const n of narrations) {
    const buf = await load(n.url);
    if (!buf) continue;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(dest);
    narrationNodes.push({ node: src, offset: n.offsetSec });
  }

  let musicNode: AudioBufferSourceNode | null = null;
  let musicGain: GainNode | null = null;
  if (musicUrl) {
    const buf = await load(musicUrl);
    if (buf) {
      musicNode = ctx.createBufferSource();
      musicNode.buffer = buf;
      musicNode.loop = true;
      musicGain = ctx.createGain();
      musicGain.gain.value = MUSIC_GAIN;
      musicNode.connect(musicGain).connect(dest);
    }
  }

  const track = dest.stream.getAudioTracks()[0];
  if (!track || (!musicNode && narrationNodes.length === 0)) {
    void ctx.close();
    return null;
  }

  return {
    track,
    ctx,
    start: (t0) => {
      for (const { node, offset } of narrationNodes) {
        try {
          node.start(t0 + offset);
        } catch {
          /* ignore */
        }
      }
      if (musicNode && musicGain) {
        try {
          musicNode.start(t0);
          const end = t0 + totalSec;
          musicGain.gain.setValueAtTime(MUSIC_GAIN, Math.max(t0, end - 0.5));
          musicGain.gain.linearRampToValueAtTime(0.0001, end);
          musicNode.stop(end + 0.05);
        } catch {
          /* ignore */
        }
      }
    },
    stop: () => {
      for (const { node } of narrationNodes) {
        try {
          node.stop();
        } catch {
          /* already stopped */
        }
      }
      try {
        musicNode?.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

export async function renderStoryboardVideo(
  storyboard: Storyboard,
  { onProgress, maxDimension = 720, fps = 30, brand = {}, includeAudio = true }: RenderOptions = {},
): Promise<RenderResult> {
  const scenes = storyboard.scenes.filter((s) => s.durationSec > 0);
  if (scenes.length === 0) throw new Error("This storyboard has no scenes to export.");

  const preset = FORMAT_PRESETS[storyboard.format];
  const scale = Math.min(1, maxDimension / Math.max(preset.width, preset.height));
  const w = Math.round(preset.width * scale);
  const h = Math.round(preset.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  // Preload every scene's image or clip (and the brand logo) up front.
  const images = await Promise.all(scenes.map((s) => (s.asset ? loadMedia(s.asset.url) : null)));
  const logo = brand.logoUrl ? await loadImage(brand.logoUrl) : null;

  const scenesSec = scenes.reduce((sum, s) => sum + s.durationSec, 0);
  // Close on a branded card when the café has set a logo or name.
  const endCardSec = brand.logoUrl || brandName(brand) ? END_CARD_SEC : 0;
  const totalSec = scenesSec + endCardSec;

  // Build the mixed audio track (music + per-scene narration), if any.
  const narrations: Array<{ url: string; offsetSec: number }> = [];
  let acc = 0;
  for (const s of scenes) {
    if (s.narrationUrl) narrations.push({ url: s.narrationUrl, offsetSec: acc });
    acc += s.durationSec;
  }
  const audio = includeAudio ? await prepareAudio(storyboard.musicUrl, narrations, totalSec) : null;

  const { mimeType, extension } = pickMimeType();
  const stream = canvas.captureStream(fps);
  if (audio) stream.addTrack(audio.track);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  // Draw the first frame before starting so we never record a blank frame.
  // (A video's first frame is already decoded by loadVideo.)
  drawScene(ctx, w, h, scenes[0], images[0], brand, logo);
  recorder.start();
  if (audio) audio.start(audio.ctx.currentTime);

  const totalMs = totalSec * 1000;
  const start = performance.now();

  // Video scenes play in real time from their first frame while on screen.
  let playing = -1;
  const enterScene = (idx: number) => {
    if (idx === playing) return;
    const prev = images[playing];
    if (prev instanceof HTMLVideoElement) prev.pause();
    const next = images[idx];
    if (next instanceof HTMLVideoElement) {
      next.currentTime = 0;
      void next.play().catch(() => {});
    }
    playing = idx;
  };

  await new Promise<void>((resolve) => {
    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= totalMs) {
        enterScene(-1);
        resolve();
        return;
      }
      let acc = 0;
      let idx = scenes.length - 1;
      for (let i = 0; i < scenes.length; i++) {
        const d = scenes[i].durationSec * 1000;
        if (elapsed < acc + d) {
          idx = i;
          break;
        }
        acc += d;
      }
      if (elapsed >= scenesSec * 1000) {
        enterScene(-1);
        drawEndCard(ctx, w, h, brand, logo);
      } else {
        enterScene(idx);
        drawScene(ctx, w, h, scenes[idx], images[idx], brand, logo);
      }
      onProgress?.(Math.min(0.99, elapsed / totalMs));
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  recorder.stop();
  await stopped;
  if (audio) {
    audio.stop();
    void audio.ctx.close();
  }
  onProgress?.(1);

  return { blob: new Blob(chunks, { type: mimeType }), mimeType, extension };
}

/** Trigger a browser download for a rendered clip. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
