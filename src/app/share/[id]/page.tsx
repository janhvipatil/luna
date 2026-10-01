import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rowToStoryboard } from "@/lib/data/mappers";
import type { StoryboardRow } from "@/lib/supabase/types";
import { AspectFrame } from "@/components/AspectFrame";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui";
import { formatDuration, isVideoUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/share/[id]">): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("storyboards")
    .select("title, description")
    .eq("id", id)
    .maybeSingle();

  if (!data) return { title: "Luna" };
  const title = `${data.title} · Luna`;
  const description = data.description || "A short-form storyboard made with Luna.";
  // The opengraph-image.tsx file convention supplies the image automatically.
  return { title, description, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

/**
 * Public, read-only storyboard view. RLS ("Anyone can view shared storyboards")
 * returns the row only when is_shared is true, so an anon visitor sees shared
 * boards and nothing else.
 */
export default async function SharePage({ params }: PageProps<"/share/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("storyboards").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();

  const storyboard = rowToStoryboard(data as StoryboardRow);
  const totalDuration = storyboard.scenes.reduce((sum, s) => sum + s.durationSec, 0);

  return (
    <div className="luna-aurora min-h-screen">
      <header className="flex h-14 items-center justify-between border-b border-border/70 bg-background/70 px-4 backdrop-blur-md sm:px-6">
        <Link href="/" aria-label="Luna">
          <Logo />
        </Link>
        <Link href="/signup" className="text-xs text-accent-strong hover:underline">
          Make your own →
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {storyboard.title}
            </h1>
            <Badge tone="accent">{storyboard.format}</Badge>
          </div>
          {storyboard.description && (
            <p className="mt-1 text-sm text-muted">{storyboard.description}</p>
          )}
          <p className="mt-1 text-xs text-muted">
            {storyboard.scenes.length} scenes · {formatDuration(totalDuration)} · shared with Luna
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storyboard.scenes.map((scene, i) => (
            <div key={scene.id}>
              <AspectFrame ratio={storyboard.format} className="w-full border border-border">
                {scene.asset ? (
                  isVideoUrl(scene.asset.url) ? (
                    <video
                      src={scene.asset.url}
                      poster={scene.asset.posterUrl}
                      controls
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={scene.asset.url} alt={scene.title} className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-surface-3 text-xs text-muted">
                    {scene.title}
                  </div>
                )}
                {scene.script && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                    <p className="text-center text-xs font-semibold leading-snug text-white drop-shadow">
                      {scene.script}
                    </p>
                  </div>
                )}
              </AspectFrame>
              <div className="mt-1.5 flex items-center gap-2 px-0.5">
                <span className="text-[10px] font-medium text-muted">{i + 1}</span>
                <span className="truncate text-xs text-muted-strong">{scene.title}</span>
                <span className="ml-auto text-[10px] text-muted">{scene.durationSec}s</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
