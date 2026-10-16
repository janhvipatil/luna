import { execFile } from "node:child_process";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

/**
 * Server-side video compositing with ffmpeg.
 *
 * Unlike the client exporter (real-time Canvas + MediaRecorder), this renders
 * deterministically and can stitch real video clips, not just frames. Images
 * (including the mock provider's SVGs) are normalized to the target size with
 * sharp; video scenes are scaled/cropped to fit. A single ffmpeg filter_complex
 * concatenates the visuals and mixes audio (background music + per-scene
 * narration at offsets). v1 does not burn in captions (that needs a bundled
 * font in the render runtime).
 *
 * Requires an ffmpeg-capable runtime — fine locally and in a container/worker;
 * not the Vercel serverless deploy.
 */

export interface RenderScene {
  /** Raster or SVG image bytes (normalized via sharp), OR a local video path. */
  image?: Buffer;
  videoPath?: string;
  durationSec: number;
}

export interface RenderInput {
  width: number;
  height: number;
  fps?: number;
  scenes: RenderScene[];
  musicPath?: string;
  narration?: Array<{ path: string; offsetSec: number }>;
}

function run(args: string[]): Promise<void> {
  if (!ffmpegPath) return Promise.reject(new Error("ffmpeg binary unavailable."));
  return new Promise((resolve, reject) => {
    execFile(ffmpegPath as string, args, { maxBuffer: 1 << 26 }, (err, _out, stderr) => {
      if (err) reject(new Error(`ffmpeg failed: ${stderr?.slice(-800) || err.message}`));
      else resolve();
    });
  });
}

/** Composite a storyboard into an MP4, returned as a Buffer. */
export async function composeStoryboard(input: RenderInput): Promise<Buffer> {
  const fps = input.fps ?? 30;
  const { width: w, height: h } = input;
  const totalSec = input.scenes.reduce((s, sc) => s + sc.durationSec, 0);
  const dir = await mkdtemp(path.join(tmpdir(), "luna-render-"));

  try {
    const inputArgs: string[] = [];
    const filters: string[] = [];
    const videoLabels: string[] = [];
    let inputIndex = 0;

    // --- Visual inputs (one per scene) ---
    for (let i = 0; i < input.scenes.length; i++) {
      const scene = input.scenes[i];
      if (scene.videoPath) {
        inputArgs.push("-t", String(scene.durationSec), "-i", scene.videoPath);
        filters.push(
          `[${inputIndex}:v]scale=${w}:${h}:force_original_aspect_ratio=increase,` +
            `crop=${w}:${h},fps=${fps},format=yuv420p,setsar=1[v${i}]`,
        );
      } else {
        // Normalize the image (incl. SVG) to an exact WxH PNG with sharp.
        const png = path.join(dir, `frame-${i}.png`);
        await sharp(scene.image ?? Buffer.alloc(0))
          .resize(w, h, { fit: "cover" })
          .png()
          .toFile(png);
        inputArgs.push("-loop", "1", "-t", String(scene.durationSec), "-i", png);
        filters.push(`[${inputIndex}:v]fps=${fps},format=yuv420p,setsar=1[v${i}]`);
      }
      videoLabels.push(`[v${i}]`);
      inputIndex++;
    }

    filters.push(
      `${videoLabels.join("")}concat=n=${input.scenes.length}:v=1:a=0[vout]`,
    );

    // --- Audio inputs ---
    const audioLabels: string[] = [];
    if (input.musicPath) {
      inputArgs.push("-stream_loop", "-1", "-i", input.musicPath);
      const fadeStart = Math.max(0, totalSec - 0.5);
      filters.push(
        `[${inputIndex}:a]atrim=0:${totalSec},volume=0.28,` +
          `afade=t=out:st=${fadeStart}:d=0.5[amus]`,
      );
      audioLabels.push("[amus]");
      inputIndex++;
    }
    for (let k = 0; k < (input.narration?.length ?? 0); k++) {
      const n = input.narration![k];
      const ms = Math.round(n.offsetSec * 1000);
      inputArgs.push("-i", n.path);
      filters.push(`[${inputIndex}:a]adelay=${ms}|${ms}[an${k}]`);
      audioLabels.push(`[an${k}]`);
      inputIndex++;
    }

    const hasAudio = audioLabels.length > 0;
    if (audioLabels.length === 1) {
      filters.push(`${audioLabels[0]}anull[aout]`);
    } else if (audioLabels.length > 1) {
      filters.push(
        `${audioLabels.join("")}amix=inputs=${audioLabels.length}:duration=longest:normalize=0[aout]`,
      );
    }

    const out = path.join(dir, "out.mp4");
    const args = [
      "-y",
      ...inputArgs,
      "-filter_complex",
      filters.join(";"),
      "-map",
      "[vout]",
      ...(hasAudio ? ["-map", "[aout]"] : []),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      ...(hasAudio ? ["-c:a", "aac", "-b:a", "128k"] : []),
      "-t",
      String(totalSec),
      "-movflags",
      "+faststart",
      out,
    ];

    await run(args);
    return await readFile(out);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Write a Buffer to a temp file and return its path (for ffmpeg video inputs). */
export async function toTempFile(bytes: Buffer, ext: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "luna-asset-"));
  const p = path.join(dir, `asset.${ext}`);
  await writeFile(p, bytes);
  return p;
}
