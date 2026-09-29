"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * `draft` is only meaningful while editing; display mode renders `value`
 * directly, so we seed the draft when entering edit mode rather than syncing it
 * from props in an effect.
 */

/** Inline-editable storyboard title used in the editor header. */
export function EditableTitle({
  value,
  onCommit,
  className,
}: {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.select();
  }, [editing]);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onCommit(trimmed);
    else setDraft(value);
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(
          "min-w-0 rounded-md border border-accent bg-surface-2 px-1.5 py-0.5 text-sm font-medium text-foreground focus:outline-none",
          className,
        )}
      />
    );
  }

  return (
    <button
      onClick={startEditing}
      className={cn(
        "truncate rounded-md px-1.5 py-0.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2",
        className,
      )}
      title="Click to rename"
    >
      {value}
    </button>
  );
}
