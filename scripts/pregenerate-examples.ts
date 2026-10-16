/**
 * Pre-generates the example storyboards' video clips and stores them as static
 * files, so the Match Ya examples open with real footage at no per-user cost.
 *
 * Free route (open-source LTX-Video on a free Colab GPU):
 *   npm run pregenerate:examples -- --notebook          # writes notebooks/luna-example-clips.ipynb
 *   …run it on Colab, download matchya-clips.zip, then:
 *   npm run pregenerate:examples -- --import ~/Downloads/matchya-clips.zip
 *
 * Paid route (Google Veo 3.1 Fast, needs GEMINI_API_KEY):
 *   npm run pregenerate:examples -- --veo [--dry] [--force]
 *
 * Every clip animates the same preview still the app shows for that scene
 * (image-to-video). Clips land in public/examples/matchya/ and are recorded in
 * src/lib/examples.media.json, which lib/templates reads at runtime.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { EXAMPLE_STORYBOARDS } from "@/lib/examples";
import { previewStillFor } from "@/lib/templates";
import { buildStyledPrompt } from "@/lib/providers/prompt";
import { veoClipLength, veoProvider } from "@/lib/providers/veo";
import type { AspectRatio } from "@/lib/types";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "src/lib/examples.media.json");
const OUT_DIR = path.join(ROOT, "public/examples/matchya");
const NOTEBOOK = path.join(ROOT, "notebooks/luna-example-clips.ipynb");
const VEO_COST_PER_SECOND = 0.1; // Veo 3.1 Fast, 720p

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const valueOf = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

type Manifest = Record<string, Record<string, { url: string; posterUrl?: string }>>;
const manifest: Manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const saveManifest = () => writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

/** LTX-Video sizes: multiples of 32, close to each format. */
const LTX_SIZE: Record<AspectRatio, [number, number]> = {
  "9:16": [480, 832],
  "4:5": [544, 672],
  "1:1": [608, 608],
  "16:9": [832, 480],
};

interface ClipJob {
  templateId: string;
  index: number;
  file: string;
  label: string;
  /** Prompt for the model, styled the same way the app styles it. */
  prompt: string;
  rawPrompt: string;
  style: Parameters<typeof buildStyledPrompt>[0]["style"];
  still: string;
  aspect: AspectRatio;
  durationSec: number;
}

function clipJobs(force: boolean): ClipJob[] {
  const jobs: ClipJob[] = [];
  for (const template of EXAMPLE_STORYBOARDS) {
    // Mirror withPreviewAssets: each scene's still is picked avoiding earlier
    // scenes' photos (only photo scenes count, as in the app).
    const usedStills: string[] = [];
    const stills = template.scenes.map((scene) => {
      const pick = previewStillFor(scene, template.format, usedStills);
      if (pick) usedStills.push(pick.id);
      return pick?.url;
    });
    template.scenes.forEach((scene, index) => {
      if (scene.medium !== "video") return;
      if (!force && manifest[template.id]?.[index]) return;
      const still = stills.at(index);
      if (!still) return;
      jobs.push({
        templateId: template.id,
        index,
        file: `${template.id}-${index + 1}.mp4`,
        label: `${template.name} · ${index + 1} ${scene.title}`,
        prompt: buildStyledPrompt({ prompt: scene.prompt, style: scene.style, medium: "video", aspect: template.format }),
        rawPrompt: scene.prompt,
        style: scene.style,
        still,
        aspect: template.format,
        durationSec: scene.durationSec,
      });
    });
  }
  return jobs;
}

function record(job: ClipJob) {
  (manifest[job.templateId] ??= {})[job.index] = { url: `/examples/matchya/${job.file}`, posterUrl: job.still };
  saveManifest();
}

// ── Notebook (free: LTX-Video on Colab) ─────────────────────────────────────

function writeNotebook(jobs: ClipJob[]) {
  const ltxJobs = jobs.map((j) => {
    const [width, height] = LTX_SIZE[j.aspect];
    const seconds = Math.max(3, Math.min(5, j.durationSec));
    return {
      file: j.file,
      label: j.label,
      image: j.still,
      // LTX likes long, literal descriptions with explicit motion.
      prompt: `${j.prompt} Gentle, natural motion; the camera slowly pushes in. The scene is captured in real-life footage.`,
      width,
      height,
      num_frames: Math.round((seconds * 24) / 8) * 8 + 1,
    };
  });
  const md = (src: string) => ({ cell_type: "markdown", metadata: {}, source: src.split(/(?<=\n)/) });
  const code = (src: string) => ({
    cell_type: "code",
    execution_count: null,
    metadata: {},
    outputs: [],
    source: src.split(/(?<=\n)/),
  });
  const notebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      accelerator: "GPU",
      colab: { gpuType: "T4", provenance: [] },
      kernelspec: { display_name: "Python 3", name: "python3" },
      language_info: { name: "python" },
    },
    cells: [
      md(`# Luna — example clips (free, LTX-Video)

Generates the Match Ya example video clips with the open-source **LTX-Video 2B (0.9.5)** model on a free GPU, then downloads them as \`matchya-clips.zip\`.

1. **Runtime → Change runtime type → T4 GPU**, then **Runtime → Run all**.
2. The first run downloads the model (~10 GB, a few minutes). Each clip then takes a few minutes.
3. When it finishes, \`matchya-clips.zip\` downloads. Import it into Luna with:
   \`npm run pregenerate:examples -- --import ~/Downloads/matchya-clips.zip\`

If the session disconnects, just **Run all** again — finished clips are skipped.
`),
      code(`!nvidia-smi --query-gpu=name,memory.total --format=csv
!pip -q install -U diffusers transformers accelerate sentencepiece imageio imageio-ffmpeg`),
      code(`JOBS = ${JSON.stringify(ltxJobs, null, 2)}`),
      code(`import os, gc, torch
from diffusers import LTXConditionPipeline
from diffusers.pipelines.ltx.pipeline_ltx_condition import LTXVideoCondition
from diffusers.utils import export_to_video, load_image

pipe = LTXConditionPipeline.from_pretrained("Lightricks/LTX-Video-0.9.5", torch_dtype=torch.bfloat16)
pipe.enable_model_cpu_offload()   # fits the free T4's 15 GB
pipe.vae.enable_tiling()
NEGATIVE = "worst quality, inconsistent motion, blurry, jittery, distorted, deformed food, text, watermark"
os.makedirs("clips", exist_ok=True)`),
      code(`import time
for i, job in enumerate(JOBS, 1):
    out = f"clips/{job['file']}"
    if os.path.exists(out):
        print(f"skip  {job['label']}")
        continue
    t0 = time.time()
    image = load_image(job["image"]).convert("RGB")
    video = pipe(
        conditions=[LTXVideoCondition(image=image, frame_index=0)],
        prompt=job["prompt"],
        negative_prompt=NEGATIVE,
        width=job["width"],
        height=job["height"],
        num_frames=job["num_frames"],
        num_inference_steps=30,
        generator=torch.Generator("cuda").manual_seed(42),
    ).frames[0]
    export_to_video(video, out, fps=24)
    del video; gc.collect(); torch.cuda.empty_cache()
    print(f"[{i}/{len(JOBS)}] {job['label']}  ({time.time() - t0:.0f}s)")`),
      code(`import shutil
shutil.make_archive("matchya-clips", "zip", "clips")
try:
    from google.colab import files
    files.download("matchya-clips.zip")
except ImportError:
    print("Download matchya-clips.zip from the file browser.")`),
    ],
  };
  mkdirSync(path.dirname(NOTEBOOK), { recursive: true });
  writeFileSync(NOTEBOOK, `${JSON.stringify(notebook, null, 1)}\n`);
  console.log(`Wrote ${path.relative(ROOT, NOTEBOOK)} with ${jobs.length} clip(s).`);
  console.log("Open https://colab.research.google.com → File → Upload notebook, pick a T4 GPU, Run all.");
}

// ── Import clips produced by the notebook ───────────────────────────────────

function importClips(source: string, jobs: ClipJob[]) {
  let dir = source;
  if (source.endsWith(".zip")) {
    dir = mkdtempSync(path.join(tmpdir(), "luna-clips-"));
    execFileSync("unzip", ["-q", "-o", source, "-d", dir]);
  }
  const available = new Set(readdirSync(dir));
  mkdirSync(OUT_DIR, { recursive: true });
  let imported = 0;
  for (const job of jobs) {
    if (!available.has(job.file)) continue;
    copyFileSync(path.join(dir, job.file), path.join(OUT_DIR, job.file));
    record(job);
    imported++;
    console.log(`✓ ${job.label}`);
  }
  const missing = jobs.length - imported;
  console.log(`Imported ${imported} clip(s)${missing ? `, ${missing} missing — re-run the notebook for those` : ""}.`);
}

// ── Veo (paid) ───────────────────────────────────────────────────────────────

function loadEnvLocal() {
  const envFile = path.join(ROOT, ".env.local");
  if (!existsSync(envFile)) return;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function runVeo(jobs: ClipJob[], dry: boolean) {
  const seconds = jobs.reduce((sum, j) => sum + veoClipLength(j.durationSec), 0);
  console.log(
    `${jobs.length} clip(s), ${seconds}s of video, est. $${(seconds * VEO_COST_PER_SECOND).toFixed(2)} on Veo 3.1 Fast.`,
  );
  if (dry || jobs.length === 0) return;
  loadEnvLocal();
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set (env or .env.local).");
  // The script runs on the operator's own key, at Veo Fast.
  const ctx = { geminiKey: process.env.GEMINI_API_KEY, geminiImages: false, videoTier: "fast" as const };

  mkdirSync(OUT_DIR, { recursive: true });
  const queue = [...jobs];
  let failed = 0;
  await Promise.all(
    Array.from({ length: Math.min(3, queue.length) }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        try {
          const { operation } = await veoProvider.start!({
            prompt: job.rawPrompt,
            style: job.style,
            medium: "video",
            aspect: job.aspect,
            durationSec: job.durationSec,
            startImageUrl: job.still,
          }, ctx);
          console.log(`▶ started  ${job.label}`);
          for (;;) {
            await new Promise((r) => setTimeout(r, 10_000));
            const poll = await veoProvider.poll!(operation, ctx);
            if (!poll.done) continue;
            if ("error" in poll) throw new Error(poll.error);
            const res = await fetch(poll.result.url, { headers: veoProvider.downloadHeaders!(ctx) });
            if (!res.ok) throw new Error(`download failed (${res.status})`);
            writeFileSync(path.join(OUT_DIR, job.file), Buffer.from(await res.arrayBuffer()));
            record(job);
            console.log(`✓ saved    ${job.label}`);
            break;
          }
        } catch (err) {
          failed++;
          console.error(`✗ ${job.label}: ${err instanceof Error ? err.message : err}`);
        }
      }
    }),
  );
  console.log(failed ? `Done with ${failed} failure(s) — re-run to retry.` : "All clips saved.");
}

// ── Entry ────────────────────────────────────────────────────────────────────

const force = flag("--force");
const importFrom = valueOf("--import");

if (importFrom) {
  importClips(importFrom.replace(/^~/, process.env.HOME ?? "~"), clipJobs(true));
} else if (flag("--veo")) {
  await runVeo(clipJobs(force), flag("--dry"));
} else {
  // Default: the free route.
  writeNotebook(clipJobs(force));
}
