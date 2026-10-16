"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight modal. Renders an overlay + centered panel, traps Escape, and
 * locks body scroll while open. Deliberately dependency-free.
 *
 * Portaled to <body>: a modal opened from inside the sticky header would
 * otherwise be trapped in it (the header's backdrop-filter makes it the
 * containing block for `position: fixed`), clipping the panel and overlay.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_150ms_ease]"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border border-border-strong bg-surface shadow-2xl",
          // Tall content scrolls inside the panel instead of overflowing the screen.
          "max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain",
          "animate-[popIn_160ms_ease]",
          className,
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {(title || description) && (
          <div className="px-6 pt-6 pb-2">
            {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
        )}
        <div className="px-6 pb-6 pt-3">{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
      `}</style>
    </div>,
    document.body,
  );
}
