import Link from "next/link";
import { Logo } from "./brand/Logo";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Top app bar. `left` is rendered after the logo (breadcrumbs/title), `right`
 * holds page actions. Sticky and translucent so content scrolls under it.
 */
export function AppHeader({
  left,
  right,
  className,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/70 px-4 backdrop-blur-md sm:px-6",
        className,
      )}
    >
      <Link href="/" className="shrink-0" aria-label="Luna home">
        <Logo />
      </Link>
      {left && (
        <>
          <span className="h-5 w-px bg-border" aria-hidden />
          <div className="flex min-w-0 items-center gap-2">{left}</div>
        </>
      )}
      <div className="ml-auto flex items-center gap-2">
        {right}
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
