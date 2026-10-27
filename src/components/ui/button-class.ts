import { cn } from "@/lib/utils";

/**
 * Button styling, kept outside the client UI module so server components (e.g.
 * marketing pages rendering links styled as buttons) can call it.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-strong shadow-sm shadow-accent/20",
  secondary: "bg-surface-3 text-foreground hover:bg-border-strong",
  ghost: "bg-transparent text-muted-strong hover:bg-surface-2 hover:text-foreground",
  outline: "border border-border-strong text-foreground hover:bg-surface-2",
  danger: "bg-danger/15 text-danger hover:bg-danger/25",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

/** Button classes, for links that should look like buttons. */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-0",
    "disabled:opacity-50 disabled:pointer-events-none",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
}

