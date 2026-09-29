import type { Scene, Storyboard } from "@/lib/types";
import { FORMAT_PRESETS } from "@/lib/constants";

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

/** Cover-fit an image into the canvas (like CSS object-fit: cover). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
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

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: Scene,
  img: HTMLImageElement | null,
) {
  // Background.
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, w, h);

  if (img) {
    drawCover(ctx, img, w, h);
  } else {
    // Fallback gradient when a scene has no generated asset.
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#4338ca");
    g.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Caption (script) at the bottom with a legibility scrim.
  const script = scene.script?.trim();
  if (script) {
    const pad = Math.round(w * 0.06);
    const fontSize = Math.round(w * 0.05);
    ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
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

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;
    lines.forEach((ln, i) => {
      const y = h - pad - (lines.length - 1 - i) * lineHeight;
      ctx.fillText(ln, w / 2, y);
    });
    ctx.shadowBlur = 0;
  }
}

export async function renderStoryboardVideo(
  storyboard: Storyboard,
  { onProgress, maxDimension = 720, fps = 30 }: RenderOptions = {},
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

  // Preload every scene's image up front so playback is smooth.
  const images = await Promise.all(scenes.map((s) => (s.asset ? loadImage(s.asset.url) : null)));

  const { mimeType, extension } = pickMimeType();
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  // Draw the first frame before starting so we never record a blank frame.
  drawScene(ctx, w, h, scenes[0], images[0]);
  recorder.start();

  const totalMs = scenes.reduce((sum, s) => sum + s.durationSec, 0) * 1000;
  const start = performance.now();

  await new Promise<void>((resolve) => {
    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= totalMs) {
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
      drawScene(ctx, w, h, scenes[idx], images[idx]);
      onProgress?.(Math.min(0.99, elapsed / totalMs));
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  recorder.stop();
  await stopped;
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
