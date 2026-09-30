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
      <Link href="/" className="mb-8">
        <Logo size={36} />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 max-w-sm text-center text-xs leading-relaxed text-muted">
        Luna is the UI layer over the AI models you already use — storyboard,
        script, and generate short-form content.
      </p>
    </div>
  );
}
