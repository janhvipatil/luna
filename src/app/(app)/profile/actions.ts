"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseVenue } from "@/lib/venue";
import type { Json } from "@/lib/supabase/types";

export interface ProfileFormState {
  ok?: boolean;
  error?: string;
  message?: string;
}

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're signed out." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatar_url = String(formData.get("avatar_url") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: full_name || null,
      bio: bio || null,
      avatar_url: avatar_url || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/members");
  return { ok: true, message: "Profile saved." };
}

export async function updateBrandKit(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're signed out." };

  const color = String(formData.get("color") ?? "").trim();
  const fontRaw = String(formData.get("font") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const font = ["sans", "serif", "mono"].includes(fontRaw) ? fontRaw : undefined;

  // brand_kit also holds the venue profile — keep it when saving styling.
  const existing = await currentBrandKit(supabase, user.id);
  const brand_kit: Record<string, Json> = {
    ...(existing.venue ? { venue: existing.venue as Json } : {}),
    ...(color ? { color } : {}),
    ...(font ? { font } : {}),
    ...(logoUrl ? { logoUrl } : {}),
  };

  const { error } = await supabase
    .from("profiles")
    .update({ brand_kit: Object.keys(brand_kit).length ? brand_kit : null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { ok: true, message: "Brand kit saved." };
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** The user's stored brand_kit as a plain object (empty if unset). */
async function currentBrandKit(
  supabase: ServerClient,
  userId: string,
): Promise<Record<string, unknown>> {
  const { data } = await supabase.from("profiles").select("brand_kit").eq("id", userId).single();
  const raw = data?.brand_kit;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

export async function updateVenue(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're signed out." };

  const venue = parseVenue({
    name: formData.get("venue_name"),
    type: formData.get("venue_type"),
    signature: formData.get("venue_signature"),
    location: formData.get("venue_location"),
    vibe: formData.get("venue_vibe"),
  });

  const rest = await currentBrandKit(supabase, user.id);
  delete rest.venue;
  const brand_kit = (venue ? { ...rest, venue: { ...venue } } : rest) as Json;

  const { error } = await supabase
    .from("profiles")
    .update({ brand_kit: venue || Object.keys(rest).length ? brand_kit : null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true, message: "Venue saved — templates and drafts now use it." };
}

export async function updatePassword(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { ok: true, message: "Password updated." };
}
