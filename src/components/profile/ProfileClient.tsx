"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, AlertCircle, Store } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/Avatar";
import { Button, Card, Input, Label, PasswordInput, Textarea } from "@/components/ui";
import { displayName, useBrandKit, useUser } from "@/lib/data/UserContext";
import { BRAND_FONTS } from "@/lib/brand";
import { VENUE_TYPES, type VenueProfile } from "@/lib/venue";
import { GeminiSettings } from "./GeminiSettings";
import {
  updateBrandKit,
  updatePassword,
  updateProfile,
  updateVenue,
  type ProfileFormState,
} from "@/app/(app)/profile/actions";

function Feedback({ state }: { state: ProfileFormState }) {
  if (state.error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
        <AlertCircle className="h-3.5 w-3.5" /> {state.error}
      </div>
    );
  }
  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
        <Check className="h-3.5 w-3.5" /> {state.message}
      </div>
    );
  }
  return null;
}

export function ProfileClient() {
  const ctx = useUser();
  const [profileState, profileAction, savingProfile] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    {},
  );
  const [pwState, pwAction, savingPw] = useActionState<ProfileFormState, FormData>(
    updatePassword,
    {},
  );
  const [brandState, brandAction, savingBrand] = useActionState<ProfileFormState, FormData>(
    updateBrandKit,
    {},
  );

  const [venueState, venueAction, savingVenue] = useActionState<ProfileFormState, FormData>(
    updateVenue,
    {},
  );

  const brand = useBrandKit();
  const [venue, setVenue] = useState<VenueProfile>(brand.venue ?? {});
  const setVenueField = (key: keyof VenueProfile) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setVenue((v) => ({ ...v, [key]: e.target.value }));
  const [avatarUrl, setAvatarUrl] = useState(ctx.profile?.avatar_url ?? "");
  const name = displayName(ctx);

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
            <span className="text-sm font-medium text-foreground">Profile &amp; account</span>
          </>
        }
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        {/* Identity */}
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={name} src={avatarUrl || ctx.profile?.avatar_url} size={64} />
          <div>
            <h1 className="text-xl font-semibold text-foreground">{name}</h1>
            <p className="text-sm text-muted">{ctx.user.email}</p>
          </div>
        </div>

        {/* Venue */}
        <Card id="venue" className="mb-5 scroll-mt-20 p-5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-strong">
              <Store className="h-4 w-4" /> About your café
            </h2>
          </div>
          <p className="mb-4 text-xs text-muted">
            The facts Luna writes into every template, caption and AI draft — your name, what
            you&apos;re known for, where you are and how it feels.
          </p>
          <form action={venueAction} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="venue_name">Venue name</Label>
                <Input
                  id="venue_name"
                  name="venue_name"
                  value={venue.name ?? ""}
                  onChange={setVenueField("name")}
                  placeholder="e.g. Little Fern Café"
                />
              </div>
              <div>
                <Label htmlFor="venue_type">Type</Label>
                <select
                  id="venue_type"
                  name="venue_type"
                  value={venue.type ?? "cafe"}
                  onChange={setVenueField("type")}
                  className="h-9 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                >
                  {VENUE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="venue_signature">Signature item</Label>
                <Input
                  id="venue_signature"
                  name="venue_signature"
                  value={venue.signature ?? ""}
                  onChange={setVenueField("signature")}
                  placeholder="e.g. pistachio croissant"
                />
              </div>
              <div>
                <Label htmlFor="venue_location">Neighbourhood / city</Label>
                <Input
                  id="venue_location"
                  name="venue_location"
                  value={venue.location ?? ""}
                  onChange={setVenueField("location")}
                  placeholder="e.g. Shoreditch"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="venue_vibe">Vibe</Label>
              <Textarea
                id="venue_vibe"
                name="venue_vibe"
                rows={2}
                value={venue.vibe ?? ""}
                onChange={setVenueField("vibe")}
                placeholder="e.g. sunlit, plant-filled, slow mornings and good records"
              />
            </div>
            <Feedback state={venueState} />
            <div className="flex justify-end">
              <Button type="submit" loading={savingVenue}>
                Save venue
              </Button>
            </div>
          </form>
        </Card>

        <GeminiSettings />

        {/* Profile form */}
        <Card className="mb-5 p-5">
          <h2 className="mb-4 text-sm font-medium text-muted-strong">Profile</h2>
          <form action={profileAction} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Display name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={ctx.profile?.full_name ?? ""}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…/avatar.png"
              />
              <p className="mt-1 text-[11px] text-muted">
                Paste an image URL. Leave blank for gradient initials.
              </p>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={ctx.profile?.bio ?? ""}
                placeholder="A line about you or your café."
              />
            </div>
            <Feedback state={profileState} />
            <div className="flex justify-end">
              <Button type="submit" loading={savingProfile}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Brand kit */}
        <Card className="mb-5 p-5">
          <h2 className="mb-1 text-sm font-medium text-muted-strong">Brand look</h2>
          <p className="mb-4 text-xs text-muted">
            How every video looks: caption colour, font and a logo watermark. Photos of your café
            are added per scene in the editor with &ldquo;Use a photo of your café&rdquo;.
          </p>
          <form action={brandAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="color">Accent color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue={brand.color ?? "#d9577a"}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-surface-2"
                  />
                  <span className="text-xs text-muted">Captions &amp; highlights</span>
                </div>
              </div>
              <div>
                <Label htmlFor="font">Caption font</Label>
                <select
                  id="font"
                  name="font"
                  defaultValue={brand.font ?? "sans"}
                  className="h-9 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                >
                  {BRAND_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                defaultValue={brand.logoUrl ?? ""}
                placeholder="https://…/logo.png — shown as a watermark"
              />
            </div>
            <Feedback state={brandState} />
            <div className="flex justify-end">
              <Button type="submit" loading={savingBrand}>
                Save brand look
              </Button>
            </div>
          </form>
        </Card>

        {/* Password */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-medium text-muted-strong">Change password</h2>
          <p className="mb-4 text-xs text-muted">Set a new password for your account.</p>
          <form action={pwAction} className="space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
            <Feedback state={pwState} />
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" loading={savingPw}>
                Update password
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </>
  );
}
