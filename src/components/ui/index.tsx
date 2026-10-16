"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button-class";

export { buttonClass };

/**
 * A small, self-contained set of UI primitives styled with the Luna design
 * tokens (see globals.css). Kept in one file to stay easy to scan — this is a
 * product surface, not a component library.
 */

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={buttonClass({ variant, size, className })}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-surface/80 backdrop-blur-sm", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const FIELD_BASE =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted " +
  "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(FIELD_BASE, "h-9", className)} {...props} />
  ),
);
Input.displayName = "Input";

/** Password field with an eye toggle to reveal / hide the value. */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-lg text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(FIELD_BASE, "resize-none leading-relaxed", className)} {...props} />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium text-muted-strong mb-1.5", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

type BadgeTone = "default" | "accent" | "success" | "warning" | "danger";

const BADGE_TONES: Record<BadgeTone, string> = {
  default: "bg-surface-3 text-muted-strong",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        BADGE_TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin text-accent", className)} aria-hidden />;
}
