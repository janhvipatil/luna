import type { AspectRatio, SceneMedium, VisualStyle } from "@/lib/types";

/** The shape the drafter returns — mirrors the store's template scenes. */
export interface DraftScene {
  title: string;
  prompt: string;
  script: string;
  style: VisualStyle;
  medium: SceneMedium;
  durationSec: number;
}

export interface DraftStoryboard {
  title: string;
  description: string;
  scenes: DraftScene[];
}

export interface DraftRequest {
  brief: string;
  format: AspectRatio;
  tone?: string;
}
