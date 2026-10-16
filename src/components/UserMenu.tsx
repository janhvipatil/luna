"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, LogOut, User as UserIcon, Users } from "lucide-react";
import { Avatar } from "./Avatar";
import { displayName, useUser } from "@/lib/data/UserContext";
import { signOut } from "@/app/(auth)/actions";

/** Header avatar with a dropdown to profile, members, and sign-out. */
export function UserMenu() {
  const ctx = useUser();
  const [open, setOpen] = useState(false);
  const name = displayName(ctx);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        aria-label="Account menu"
      >
        <Avatar name={name} src={ctx.profile?.avatar_url} size={30} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl">
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-3">
            <Avatar name={name} src={ctx.profile?.avatar_url} size={34} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{name}</div>
              <div className="truncate text-xs text-muted">{ctx.user.email}</div>
            </div>
          </div>

          <div className="p-1">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-surface-2"
            >
              <UserIcon className="h-4 w-4 text-muted" /> Profile &amp; account
            </Link>
            <Link
              href="/members"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-surface-2"
            >
              <Users className="h-4 w-4 text-muted" /> Members
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-surface-2"
            >
              <CreditCard className="h-4 w-4 text-muted" /> Plans &amp; pricing
            </Link>
          </div>

          <form action={signOut} className="border-t border-border p-1">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-danger hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
