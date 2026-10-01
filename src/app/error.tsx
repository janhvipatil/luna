"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui";

/** Route-segment error boundary. Lets the user retry or head home. */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Surface for monitoring; wire to Sentry/etc. here when configured.
    console.error(error);
  }, [error]);

  return (
    <div className="luna-aurora flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo size={40} />
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger/15">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted">
          An unexpected error occurred. Your storyboards are saved — try again.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="secondary">Back to Luna</Button>
        </Link>
      </div>
    </div>
  );
}
