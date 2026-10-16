import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonClass } from "@/components/ui/button-class";

/** Public site chrome: slim header + footer, same clean look as the app. */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/welcome" aria-label="Luna home">
            <Logo />
          </Link>
          <nav className="ml-2 hidden items-center gap-1 text-sm text-muted-strong sm:flex">
            <Link href="/welcome#how" className="rounded-md px-2.5 py-1.5 hover:text-foreground">
              How it works
            </Link>
            <Link href="/pricing" className="rounded-md px-2.5 py-1.5 hover:text-foreground">
              Pricing
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden px-2 text-sm text-muted-strong hover:text-foreground sm:inline">
              Sign in
            </Link>
            <Link href="/signup" className={buttonClass({ size: "sm" })}>
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <Logo size={20} showWordmark={false} />
            <span>Short-form video for cafés &amp; restaurants.</span>
          </div>
          <nav className="flex flex-wrap gap-4 sm:ml-auto">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </nav>
          <span className="sm:ml-4">© {new Date().getFullYear()} Luna</span>
        </div>
      </footer>
    </div>
  );
}
