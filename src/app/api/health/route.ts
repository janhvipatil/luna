import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Health check + keep-alive. A Vercel cron calls this daily (vercel.json) so
 * the free Supabase project sees regular activity and isn't auto-paused after
 * a week idle — which made sign-in hang. A paid Supabase plan removes the need.
 */
export async function GET() {
  const started = Date.now();
  const supabase = await createClient();
  // Any PostgREST query counts as activity; RLS returns nothing to anonymous callers.
  const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
  const ms = Date.now() - started;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message, ms }, { status: 503 });
  }
  return NextResponse.json({ ok: true, ms });
}
