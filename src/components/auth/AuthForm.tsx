"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, MailCheck } from "lucide-react";
import { signIn, signUp, type AuthState } from "@/app/(auth)/actions";
import { Button, Card, Input, Label } from "@/components/ui";

/**
 * Shared sign-in / sign-up card. Uses React 19's useActionState so pending and
 * error states come straight from the server action with no extra plumbing.
 */
export function AuthForm({
  mode,
  redirectTo = "/",
}: {
  mode: "signin" | "signup";
  redirectTo?: string;
}) {
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  if (state.needsConfirmation) {
    return (
      <Card className="p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft">
          <MailCheck className="h-5 w-5 text-accent-strong" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Check your inbox</h1>
        <p className="mt-1.5 text-sm text-muted">
          We sent a confirmation link to{" "}
          <span className="text-foreground">{state.email}</span>. Click it to activate your
          account, then sign in.
        </p>
        <Link href="/login" className="mt-4 inline-block">
          <Button variant="secondary" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </Card>
    );
  }

  const isSignup = mode === "signup";

  return (
    <Card className="p-6">
      <h1 className="text-lg font-semibold text-foreground">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {isSignup ? "Start building storyboards in seconds." : "Sign in to your storyboards."}
      </p>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        {isSignup && (
          <div>
            <Label htmlFor="fullName">Name</Label>
            <Input id="fullName" name="fullName" type="text" placeholder="Ada Lovelace" autoComplete="name" />
          </div>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            defaultValue={state.email}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder={isSignup ? "At least 6 characters" : "••••••••"}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <Button type="submit" loading={pending} size="lg" className="w-full">
          {isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent-strong hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Luna?{" "}
            <Link href="/signup" className="text-accent-strong hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
