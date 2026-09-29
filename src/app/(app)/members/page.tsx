import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/Avatar";
import { Badge, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

/**
 * Members directory. Profiles are readable by any authenticated user (RLS), and
 * emails are intentionally not stored on profiles, so this exposes only names,
 * avatars, bios, and join dates.
 */
export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const members = (data as ProfileRow[] | null) ?? [];

  return (
    <>
      <AppHeader
        left={
          <>
            <Link
              href="/"
              className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              aria-label="Back to library"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm font-medium text-foreground">Members</span>
          </>
        }
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-accent-strong" />
          <h1 className="text-lg font-semibold text-foreground">
            {members.length} {members.length === 1 ? "member" : "members"}
          </h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => {
            const name = m.full_name?.trim() || "Unnamed member";
            const isYou = m.id === user?.id;
            return (
              <Card key={m.id} className="flex items-start gap-3 p-4">
                <Avatar name={name} src={m.avatar_url} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">{name}</span>
                    {isYou && <Badge tone="accent">You</Badge>}
                  </div>
                  {m.bio && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{m.bio}</p>}
                  <p className="mt-1.5 text-[11px] text-muted">
                    Joined {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
