import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Luna storyboard";

/**
 * Open Graph preview image for a shared storyboard. Renders the title + scene
 * count on Luna's dark brand card. Crawlers are unauthenticated, so the
 * public-read RLS policy returns the row only when the board is actually
 * shared; otherwise we show a generic card.
 */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("storyboards")
    .select("title, format, scenes")
    .eq("id", id)
    .maybeSingle();

  const title = data?.title ?? "A storyboard on Luna";
  const sceneCount = Array.isArray(data?.scenes) ? data!.scenes.length : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 100%)",
          color: "#ececf1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, color: "#a78bfa" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "linear-gradient(135deg, #a78bfa, #6366f1)",
            }}
          />
          <span style={{ fontWeight: 600 }}>Luna</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
          <div style={{ fontSize: 30, color: "#9a9aa6" }}>
            {sceneCount > 0 ? `${sceneCount}-scene storyboard` : "Short-form storyboard"}
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#9a9aa6" }}>Storyboard → short-form video</div>
      </div>
    ),
    size,
  );
}
