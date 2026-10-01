import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="luna-aurora flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo size={40} />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-1 max-w-sm text-sm text-muted">
          This page doesn&apos;t exist, or the storyboard isn&apos;t shared.
        </p>
      </div>
      <Link href="/">
        <Button variant="secondary">Back to Luna</Button>
      </Link>
    </div>
  );
}
