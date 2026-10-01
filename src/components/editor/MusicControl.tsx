"use client";

import { useRef, useState } from "react";
import { Music, Upload, X } from "lucide-react";
import type { Storyboard } from "@/lib/types";
import { useLunaStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Upload a background-music track to the user's assets folder and store its URL
 * on the storyboard. Uploading to our bucket keeps it CORS-safe so the export's
 * Web Audio decode works.
 */
export function MusicControl({ storyboard }: { storyboard: Storyboard }) {
  const updateStoryboard = useLunaStore((s) => s.updateStoryboard);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleFile(file: File) {
    setUploading(true);
    setError(undefined);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You're signed out.");
      const ext = file.name.split(".").pop() || "mp3";
      const path = `${user.id}/${storyboard.id}/music-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("assets")
        .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: true });
      if (upErr) throw upErr;
      const url = supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;
      updateStoryboard(storyboard.id, { musicUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-muted" />
        <span className="text-sm font-medium text-foreground">Background music</span>
        {storyboard.musicUrl && (
          <button
            onClick={() => updateStoryboard(storyboard.id, { musicUrl: undefined })}
            className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted hover:text-danger"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
      </div>

      {storyboard.musicUrl ? (
        <audio src={storyboard.musicUrl} controls className="mt-2 h-8 w-full" />
      ) : (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong py-2 text-xs text-muted transition-colors hover:border-accent hover:text-accent-strong",
              uploading && "opacity-60",
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : "Upload an audio file (mixed into the export)"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </>
      )}
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}
