"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  /** Set when signup succeeded but the account needs email confirmation. */
  needsConfirmation?: boolean;
  email?: string;
}

/**
 * Plain-language auth errors. A sleeping or unreachable database surfaces as a
 * network/5xx error — say so instead of showing a raw message or hanging.
 */
function friendlyAuthError(error: { message?: string; code?: string; status?: number; name?: string }): string {
  const unreachable =
    error.name === "AuthRetryableFetchError" ||
    error.status === 0 ||
    (typeof error.status === "number" && error.status >= 500) ||
    /fetch failed|network|timeout|ENOTFOUND|ECONNREFUSED/i.test(error.message ?? "");
  if (unreachable) {
    return "We can't reach the server right now — it may be waking up. Please try again in a minute.";
  }
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match. Check for typos, or create an account.";
    case "email_not_confirmed":
      return "Please confirm your email first — check your inbox for the link we sent.";
    case "user_already_exists":
      return "An account with this email already exists. Sign in instead.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim(),
    redirectTo: String(formData.get("redirect") ?? "/"),
  };
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, redirectTo } = readCredentials(formData);
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: friendlyAuthError(error), email };
  } catch (err) {
    return { error: friendlyAuthError(err as Error), email };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, fullName } = readCredentials(formData);
  if (!email || !password) return { error: "Enter your email and password." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  let result: Awaited<ReturnType<typeof supabase.auth.signUp>>;
  try {
    result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || undefined },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
  } catch (err) {
    return { error: friendlyAuthError(err as Error), email };
  }
  const { data, error } = result;
  if (error) return { error: friendlyAuthError(error), email };

  // When email confirmation is enabled, no session is returned yet.
  if (!data.session) {
    return { needsConfirmation: true, email };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
