"use client";

import { createContext, useContext } from "react";
import type { ProfileRow } from "@/lib/supabase/types";
import { parseBrandKit, type BrandKit } from "@/lib/brand";
import type { AiStatus } from "@/lib/ai/context";

export interface SessionUser {
  id: string;
  email: string;
}

export interface UserContextValue {
  user: SessionUser;
  profile: ProfileRow | null;
  /** Bring-your-own-key status (a hint only — the key never reaches the browser). */
  ai: AiStatus;
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

/** The signed-in user's brand kit (empty object if none set). */
export function useBrandKit(): BrandKit {
  const ctx = useContext(UserContext);
  return parseBrandKit(ctx?.profile?.brand_kit);
}

/** The signed-in user's AI connection status (no key → not connected). */
export function useAiStatus(): AiStatus {
  const ctx = useContext(UserContext);
  return ctx?.ai ?? { geminiConnected: false, geminiKeyHint: null, geminiImages: false, videoTier: "fast" };
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
