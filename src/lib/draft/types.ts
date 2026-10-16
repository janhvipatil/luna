import type { AspectRatio, SceneMedium, VisualStyle } from "@/lib/types";
import type { VenueProfile } from "@/lib/venue";

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
  /** The café / restaurant the content is for, if the user has set one up. */
  venue?: VenueProfile;
}
