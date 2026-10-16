import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/lib/data/UserContext";
import { StoreSync } from "@/lib/data/StoreSync";
import { getAiStatus } from "@/lib/ai/context";

/**
 * Authenticated app shell. Loads the signed-in user, profile and AI-key status
 * (never the key itself) on the server, provides them via context, and mounts
 * StoreSync so the client store stays in sync with Supabase. proxy.ts already gates access; the redirect here is a
 * defensive backstop.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, ai] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    getAiStatus(supabase, user.id),
  ]);

  return (
    <UserProvider value={{ user: { id: user.id, email: user.email ?? "" }, profile, ai }}>
      <StoreSync />
      {children}
    </UserProvider>
  );
}
