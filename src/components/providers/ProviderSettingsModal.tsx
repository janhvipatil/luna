"use client";

import { Check, CircleDot, ExternalLink, Film, ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui";
import { useProviders } from "./useProviders";
import { useLunaStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Lets the user pick which backend generates their scenes and shows whether
 * each one is connected. Reinforces Luna's model: it's the UI over backends
 * you bring yourself.
 */
export function ProviderSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { providers, loading } = useProviders();
  const selected = useLunaStore((s) => s.providerId);
  const setProviderId = useLunaStore((s) => s.setProviderId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generation backend"
      description="Luna orchestrates the model — pick which one runs your scenes. Connect a real backend with environment variables."
    >
      <div className="space-y-2">
        {loading && <div className="h-20 rounded-lg luna-shimmer" />}

        {providers.map((p) => {
          const active = p.id === selected;
          const selectable = p.configured;
          return (
            <button
              key={p.id}
              disabled={!selectable}
              onClick={() => {
                setProviderId(p.id);
                onClose();
              }}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                active
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface-2 hover:border-border-strong",
                !selectable && "cursor-not-allowed opacity-60 hover:border-border",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {active ? (
                    <Check className="h-4 w-4 text-accent-strong" />
                  ) : (
                    <CircleDot className="h-4 w-4 text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    {p.configured ? (
                      <Badge tone="success">Connected</Badge>
                    ) : (
                      <Badge tone="warning">Not configured</Badge>
                    )}
                    {p.capabilities.image && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                        <ImageIcon className="h-3 w-3" /> image
                      </span>
                    )}
                    {p.capabilities.video && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                        <Film className="h-3 w-3" /> video
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{p.description}</p>
                  {!p.configured && p.configHint && (
                    <p className="mt-1.5 rounded bg-surface-3 px-2 py-1 font-mono text-[10px] text-muted-strong">
                      {p.configHint}
                    </p>
                  )}
                  {p.homepage && (
                    <a
                      href={p.homepage}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-accent-strong hover:underline"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
