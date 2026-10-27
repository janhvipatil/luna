"use client";

import { useActionState } from "react";
import { AlertCircle, Check, ExternalLink, KeyRound, Sparkles } from "lucide-react";
import { Button, Card, Label, PasswordInput } from "@/components/ui";
import { useAiStatus } from "@/lib/data/UserContext";
import { cn } from "@/lib/utils";
import {
  removeGeminiKey,
  saveGeminiKey,
  updateAiPreferences,
  type ProfileFormState,
} from "@/app/(app)/profile/actions";

const TIERS = [
  { id: "omni", name: "Omni Flash", price: "$0.10/s", note: "Recommended · Google's newest" },
  { id: "lite", name: "Veo Lite", price: "$0.05/s", note: "Cheapest, good for drafts" },
  { id: "fast", name: "Veo Fast", price: "$0.10/s", note: "Veo 3.1" },
  { id: "standard", name: "Veo Standard", price: "$0.40/s", note: "Highest quality" },
] as const;

function Feedback({ state }: { state: ProfileFormState }) {
  if (state.error) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
        <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" /> {state.error}
      </div>
    );
  }
  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
        <Check className="h-3.5 w-3.5" /> {state.message}
      </div>
    );
  }
  return null;
}

/**
 * Bring-your-own-key: the user connects their own Gemini API key, which powers
 * AI drafting, voiceover, AI images and video on their own Google bill.
 * The key is verified and encrypted server-side; only its last 4 characters
 * ever come back to the browser.
 */
export function GeminiSettings() {
  const ai = useAiStatus();
  const [keyState, keyAction, savingKey] = useActionState<ProfileFormState, FormData>(saveGeminiKey, {});
  const [removeState, removeAction, removing] = useActionState<ProfileFormState, FormData>(
    () => removeGeminiKey(),
    {},
  );
  const [prefState, prefAction, savingPrefs] = useActionState<ProfileFormState, FormData>(
    updateAiPreferences,
    {},
  );

  return (
    <Card id="gemini" className="mb-5 scroll-mt-20 p-5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-strong">
          <KeyRound className="h-4 w-4" /> Gemini (your AI key)
        </h2>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            ai.geminiConnected ? "bg-matcha-soft text-matcha-strong" : "bg-surface-3 text-muted",
          )}
        >
          {ai.geminiConnected ? `Connected · ${ai.geminiKeyHint}` : "Not connected"}
        </span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-muted">
        Luna runs on your own Google Gemini API key, so you only pay Google for what you generate.
        Your key is encrypted and never shown again.
      </p>

      <div className="mb-4 grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <div className="font-medium text-foreground">Free on Google&apos;s free tier</div>
          <div className="mt-0.5 text-muted">AI storyboard drafts · voiceovers</div>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <div className="font-medium text-foreground">Needs billing on your Google project</div>
          <div className="mt-0.5 text-muted">AI video · AI images</div>
        </div>
      </div>

      <form action={keyAction} className="space-y-3">
        <div>
          <Label htmlFor="gemini_key">{ai.geminiConnected ? "Replace key" : "API key"}</Label>
          <PasswordInput
            id="gemini_key"
            name="gemini_key"
            placeholder="Paste your Gemini API key"
            autoComplete="off"
            spellCheck={false}
          />
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent-strong hover:underline"
          >
            Get a key in Google AI Studio <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Feedback state={keyState} />
        <div className="flex justify-end gap-2">
          <Button type="submit" loading={savingKey}>
            {ai.geminiConnected ? "Test & replace" : "Test & connect"}
          </Button>
        </div>
      </form>

      {ai.geminiConnected && (
        <>
          <form action={prefAction} className="mt-5 space-y-4 border-t border-border pt-5">
            <div>
              <Label>Video model</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {TIERS.map((t) => (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
                  >
                    <input
                      type="radio"
                      name="video_model"
                      value={t.id}
                      defaultChecked={ai.videoTier === t.id}
                      className="mt-0.5 accent-[var(--accent)]"
                    />
                    <span>
                      <span className="font-medium text-foreground">
                        {t.name} · {t.price}
                      </span>
                      <span className="block text-muted">{t.note}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Per generated second at 720p, billed by Google. A typical 4-second clip on
                Omni Flash costs about $0.40.
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-xs">
              <input
                type="checkbox"
                name="gemini_images"
                defaultChecked={ai.geminiImages}
                className="mt-0.5 accent-[var(--accent)]"
              />
              <span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Sparkles className="h-3 w-3 text-matcha-strong" /> Generate stills with AI
                  (Nano Banana)
                </span>
                <span className="block text-muted">
                  About $0.03 per image. Off = free matched stock photos.
                </span>
              </span>
            </label>
            <Feedback state={prefState} />
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" loading={savingPrefs}>
                Save preferences
              </Button>
            </div>
          </form>

          <form action={removeAction} className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-[11px] text-muted">
              Free-tier requests may be used by Google to improve its products.
            </p>
            <Button type="submit" variant="ghost" size="sm" loading={removing} className="text-danger">
              Remove key
            </Button>
          </form>
          {removeState.error && <Feedback state={removeState} />}
        </>
      )}
    </Card>
  );
}
