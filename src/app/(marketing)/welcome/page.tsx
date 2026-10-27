import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AudioLines, Clapperboard, Film, Palette, Sparkles, Wand2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button-class";
import { TEMPLATES } from "@/lib/templates";
import { EXAMPLE_STORYBOARDS } from "@/lib/examples";
import { photoUrl } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Luna — Short-form video for cafés & restaurants",
  description:
    "Turn an idea into short-form video, one scene at a time. Food-first templates, AI-drafted storyboards and AI-generated clips for cafés and restaurants.",
};

const MOSAIC = ["latte-art", "noodle-pull", "weekend-brunch", "dessert-pull", "bake-of-the-day", "happy-hour"];

const STEPS = [
  {
    icon: Clapperboard,
    title: "Pick a format",
    body: "Start from 30 proven café & restaurant templates — signature dish, new menu drop, happy hour, behind the scenes — or describe your idea and let AI draft it.",
  },
  {
    icon: Palette,
    title: "Make it yours",
    body: "Tweak each scene's shot and caption. Your venue's name, signature dish and brand colours flow into every template automatically.",
  },
  {
    icon: Film,
    title: "Generate & post",
    body: "Generate every scene as video with Google's Gemini Omni Flash — or animate photos of your real dishes — then export a vertical reel ready for Instagram and TikTok.",
  },
];

const FEATURES = [
  { icon: Wand2, title: "AI storyboards", body: "Describe what you're promoting; get scenes, shots and captions written for hospitality." },
  { icon: Film, title: "AI video", body: "Google's newest video model, Gemini Omni Flash, generating vertical clips with natural sound." },
  { icon: Sparkles, title: "Animate real dishes", body: "Upload a photo of your latte or croissant and bring it to life — no fake food." },
  { icon: AudioLines, title: "Voiceover & music", body: "Add narration and a background track, mixed straight into the export." },
];

export default function WelcomePage() {
  const mosaic = MOSAIC.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-strong">
            <Sparkles className="h-3.5 w-3.5 text-matcha-strong" />
            Made for cafés &amp; restaurants
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Turn an idea into short-form video, one scene at a time.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Plan, script and generate Reels and TikToks that make people hungry — without a film
            crew or an editing timeline.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonClass({ size: "lg" })}>
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className={buttonClass({ size: "lg", variant: "secondary" })}>
              See pricing
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted">Free plan · no card needed</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {mosaic.map((t, i) => (
            <div
              key={t!.id}
              className={`overflow-hidden rounded-xl border border-border bg-surface-2 ${i % 2 ? "translate-y-5" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(t!.cover!, 360, 640)}
                alt={t!.name}
                className="aspect-[9/16] w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-t border-border/70 bg-surface/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-accent-strong">
                    {i + 1}
                  </span>
                  <step.icon className="h-4 w-4 text-matcha-strong" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-matcha-soft">
                <f.icon className="h-4 w-4 text-matcha-strong" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example */}
      <section className="border-t border-border/70 bg-surface/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Example café: Match Ya
            </h2>
            <span className="rounded-full bg-matcha-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-matcha-strong">
              Example
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            A matcha café with bakes, desserts, ramen and onigiri — four storyboards planned in
            minutes, from the morning whisk ritual to ramen nights.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMPLE_STORYBOARDS.map((t) => (
              <div key={t.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl(t.cover!, 640, 360)} alt="" className="aspect-[16/9] w-full object-cover" />
                <div className="p-4">
                  <div className="text-sm font-medium text-foreground">{t.name.replace("Match Ya · ", "")}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Your next reel is one scene away.
        </h2>
        <p className="mt-2 text-sm text-muted">Start free — upgrade when you&apos;re posting every week.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/signup" className={buttonClass({ size: "lg" })}>
            Start free
          </Link>
          <Link href="/pricing" className={buttonClass({ size: "lg", variant: "ghost" })}>
            Compare plans
          </Link>
        </div>
      </section>
    </>
  );
}
