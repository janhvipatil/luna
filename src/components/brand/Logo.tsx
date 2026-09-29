import { cn } from "@/lib/utils";

/** Luna wordmark: a crescent glyph + name. */
export function Logo({
  className,
  showWordmark = true,
  size = 28,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="luna-moon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill="url(#luna-moon)" opacity="0.18" />
        <path
          d="M22 6a11 11 0 1 0 4 12.5A9 9 0 0 1 22 6Z"
          fill="url(#luna-moon)"
        />
      </svg>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">Luna</span>
      )}
    </span>
  );
}
