import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 "Proxy" (formerly Middleware). Refreshes the Supabase session and
 * enforces auth on protected routes for every matched request.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match everything except Next internals and static assets. Auth-specific
     * path allowances live in updateSession's PUBLIC_PREFIXES.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
