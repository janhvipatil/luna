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
  "/pricing",
  "/terms",
  "/privacy",
];

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
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  const { pathname } = request.nextUrl;

  // Signed-out visitors to the home page see the landing page, not a login wall.
  if (!claims && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  if (!claims && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Signed-in users shouldn't sit on the auth screens.
  if (claims && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
