"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/Avatar";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { displayName, useBrandKit, useUser } from "@/lib/data/UserContext";
import { BRAND_FONTS } from "@/lib/brand";
import {
  updateBrandKit,
  updatePassword,
  updateProfile,
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

  const brand = useBrandKit();
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
                placeholder="A line about you or your brand."
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
          <h2 className="mb-1 text-sm font-medium text-muted-strong">Brand kit</h2>
          <p className="mb-4 text-xs text-muted">
            Applied to scene captions and exports across your storyboards.
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
                    defaultValue={brand.color ?? "#8b5cf6"}
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
                Save brand kit
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
              <Input
                id="password"
                name="password"
                type="password"
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
