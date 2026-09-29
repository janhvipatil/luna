"use client";

import { createContext, useContext } from "react";
import type { ProfileRow } from "@/lib/supabase/types";

export interface SessionUser {
  id: string;
  email: string;
}

export interface UserContextValue {
  user: SessionUser;
  profile: ProfileRow | null;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  value,
  children,
}: {
  value: UserContextValue;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/** The signed-in user + their profile. Only valid inside the (app) layout. */
export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within the authenticated app layout");
  return ctx;
}

/** Best display name: profile name → email local-part. */
export function displayName(value: UserContextValue): string {
  return value.profile?.full_name?.trim() || value.user.email.split("@")[0];
}

/** Two-letter initials for avatars. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}
