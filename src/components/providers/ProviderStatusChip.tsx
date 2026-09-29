"use client";

import { useState } from "react";
import { Cpu } from "lucide-react";
import { useProviders } from "./useProviders";
import { ProviderSettingsModal } from "./ProviderSettingsModal";
import { useLunaStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { cn } from "@/lib/utils";

/** Header chip showing the active backend; opens provider settings. */
export function ProviderStatusChip() {
  const mounted = useMounted();
  const { providers } = useProviders();
  const providerId = useLunaStore((s) => s.providerId);
  const [open, setOpen] = useState(false);

  const active = providers.find((p) => p.id === providerId);
  const label = mounted ? active?.name ?? "Backend" : "Backend";
  const connected = active?.configured ?? true;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/60 px-2.5 py-1.5 text-xs text-muted-strong transition-colors hover:border-border-strong hover:text-foreground"
      >
        <Cpu className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{label}</span>
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            connected ? "bg-success" : "bg-warning",
          )}
          aria-hidden
        />
      </button>
      <ProviderSettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
