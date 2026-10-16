import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Centered, chrome-free layout for the pre-auth screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/welcome" className="mb-8">
        <Logo size={36} />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 max-w-sm text-center text-xs leading-relaxed text-muted">
        Turn an idea into short-form video, one scene at a time — made for
        cafés and restaurants.
      </p>
      <nav className="mt-3 flex gap-4 text-xs text-muted">
        <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
        <Link href="/terms" className="hover:text-foreground">Terms</Link>
        <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
      </nav>
    </div>
  );
}
