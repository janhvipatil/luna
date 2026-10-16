import { NextResponse } from "next/server";
import { describeProviders } from "@/lib/providers";
import { createClient } from "@/lib/supabase/server";
import { getAiContext } from "@/lib/ai/context";

/**
 * Returns provider metadata for the client. `configured` depends on server-side
 * env vars and on the signed-in user's own keys (bring-your-own-key), so it is
 * computed per request on the server.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctx = await getAiContext(supabase, user?.id);
  return NextResponse.json({ providers: describeProviders(ctx) });
}
