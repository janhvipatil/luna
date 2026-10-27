import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

/** Paths that don't require a session. */
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/auth",
  "/share",
  "/api/providers",
  // Public marketing site.
  "/welcome",
  // Keep-alive ping (Vercel cron).
  "/api/health",
  "/pricing",
  "/terms",
  "/privacy",
];

/** Auth error codes meaning the stored session can never be refreshed. */
const DEAD_SESSION_CODES = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
  "session_not_found",
  "session_expired",
  "bad_jwt",
]);

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refreshes the Supabase session on every request and gates protected routes.
 * Called from proxy.ts (Next.js 16's renamed middleware).
 *
 * Important: the response object returned here carries refreshed auth cookies,
 * so callers must return it as-is (don't construct a fresh NextResponse).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims() — it can log
  // users out at random. getClaims() validates and refreshes the session.
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  // A session the server no longer recognises (e.g. its refresh token was
  // revoked or the project was restored) would otherwise linger in the cookie
  // and fail on every request. Clear it so the user can simply sign in again.
  if (error && DEAD_SESSION_CODES.has((error as { code?: string }).code ?? "")) {
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) response.cookies.delete(cookie.name);
    }
  }

  /** Redirect while keeping any cookies the session refresh set or cleared. */
  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  const { pathname } = request.nextUrl;

  // Signed-out visitors to the home page see the landing page, not a login wall.
  if (!claims && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return redirectTo(url);
  }

  if (!claims && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return redirectTo(url);
  }

  // Signed-in users shouldn't sit on the auth screens.
  if (claims && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectTo(url);
  }

  return response;
}
