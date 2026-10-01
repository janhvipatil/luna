import type { Json, StoryboardRow } from "@/lib/supabase/types";
import type {
  AspectRatio,
  GenerationStatus,
  Scene,
  SceneMedium,
  Storyboard,
  VisualStyle,
} from "@/lib/types";
import { createId } from "@/lib/utils";

const ASPECTS: AspectRatio[] = ["9:16", "1:1", "16:9", "4:5"];
const MEDIA: SceneMedium[] = ["image", "video"];
const STYLES: VisualStyle[] = [
  "cinematic",
  "3d-render",
  "anime",
  "photographic",
  "flat-illustration",
  "retro",
  "product-shot",
];

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/** Coerce arbitrary JSONB into a well-formed Scene. */
function parseScene(raw: unknown): Scene {
  const o = (raw ?? {}) as Record<string, unknown>;
  const style = STYLES.includes(o.style as VisualStyle) ? (o.style as VisualStyle) : "cinematic";
  const medium = MEDIA.includes(o.medium as SceneMedium) ? (o.medium as SceneMedium) : "image";
  const status: GenerationStatus =
    o.asset && typeof o.asset === "object" ? "ready" : "idle";

  return {
    id: asString(o.id) || createId("scene"),
    title: asString(o.title, "Scene"),
    prompt: asString(o.prompt),
    script: asString(o.script),
    style,
    medium,
    durationSec: typeof o.durationSec === "number" ? o.durationSec : 3,
    status,
    asset: o.asset as Scene["asset"],
    takes: Array.isArray(o.takes) ? (o.takes as Scene["takes"]) : undefined,
    seed: typeof o.seed === "number" ? o.seed : undefined,
    narrationUrl: typeof o.narrationUrl === "string" ? o.narrationUrl : undefined,
  };
}

export function rowToStoryboard(row: StoryboardRow): Storyboard {
  const scenesRaw = Array.isArray(row.scenes) ? row.scenes : [];
  const format = ASPECTS.includes(row.format as AspectRatio)
    ? (row.format as AspectRatio)
    : "9:16";

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    format,
    scenes: scenesRaw.map(parseScene),
    isShared: Boolean(row.is_shared),
    musicUrl: row.music_url ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

/**
 * Serialize a storyboard for persistence. Transient generation statuses
 * ("generating"/"queued") are dropped to "idle" — a page reload can't resume an
 * in-flight generation, so we never store one as if it were still running.
 */
export function storyboardToRow(
  sb: Storyboard,
): Pick<StoryboardRow, "id" | "title" | "description" | "format" | "is_shared" | "music_url"> & {
  scenes: Json;
} {
  const scenes = sb.scenes.map((sc) => ({
    id: sc.id,
    title: sc.title,
    prompt: sc.prompt,
    script: sc.script,
    style: sc.style,
    medium: sc.medium,
    durationSec: sc.durationSec,
    status: sc.status === "generating" || sc.status === "queued" ? "idle" : sc.status,
    asset: sc.asset ?? null,
    takes: sc.takes ?? null,
    seed: sc.seed ?? null,
    narrationUrl: sc.narrationUrl ?? null,
  }));

  return {
    id: sb.id,
    title: sb.title,
    description: sb.description,
    format: sb.format,
    is_shared: sb.isShared,
    music_url: sb.musicUrl ?? null,
    scenes: scenes as unknown as Json,
  };
}
