"use client";

import { Check, CloudOff, RefreshCw } from "lucide-react";
import { useLunaStore } from "@/lib/store";

/** Small autosave status pill for the editor header. */
export function SaveIndicator() {
  const status = useLunaStore((s) => s.saveStatus);

  if (status === "idle") return null;

  const map = {
    saving: { icon: <RefreshCw className="h-3 w-3 animate-spin" />, label: "Saving…", cls: "text-muted" },
    saved: { icon: <Check className="h-3 w-3" />, label: "Saved", cls: "text-success" },
    error: { icon: <CloudOff className="h-3 w-3" />, label: "Save failed", cls: "text-danger" },
  } as const;
  const s = map[status];

  return (
    <span className={`hidden items-center gap-1 text-[11px] sm:inline-flex ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}
