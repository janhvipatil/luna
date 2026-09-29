import { NextResponse } from "next/server";
import { describeProviders } from "@/lib/providers";

/**
 * Returns provider metadata for the client. `configured` depends on server-side
 * env vars, so this must be computed on the server rather than in the store.
 */
export async function GET() {
  return NextResponse.json({ providers: describeProviders() });
}
