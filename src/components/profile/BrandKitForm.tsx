"use client";

import { useActionState, useRef, useState } from "react";
import { AlertCircle, Check, ImagePlus, Plus, X } from "lucide-react";
import { Button, Card, Input, Label } from "@/components/ui";
import { useBrandKit, useUser } from "@/lib/data/UserContext";
import { createClient } from "@/lib/supabase/client";
import { BRAND_FONTS, brandName, fontFamily, MAX_BRAND_COLORS, watermarkColor } from "@/lib/brand";
import { updateBrandKit, type ProfileFormState } from "@/app/(app)/profile/actions";

const SUGGESTED = ["#2f4a3a", "#e8a0b4", "#f3e6d8", "#b5405f", "#6e9150"];

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

/**
 * Brand kit: name, logo, a palette (primary caption color + extra colors) and
 * caption font. The name or logo is watermarked on every scene and export.
 */
export function BrandKitForm() {
  const { user } = useUser();
  const brand = useBrandKit();
  const [state, action, saving] = useActionState<ProfileFormState, FormData>(updateBrandKit, {});

  const [name, setName] = useState(brand.name ?? "");
  const [primary, setPrimary] = useState(brand.color ?? "#ffffff");
  const [colors, setColors] = useState<string[]>(brand.colors ?? []);
  const [font, setFont] = useState(brand.font ?? "sans");
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = { ...brand, name, color: primary, colors, font, logoUrl: logoUrl || undefined };
  const shownName = brandName(preview);

  async function uploadLogo(file: File) {
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      setUploadError("Use a PNG, JPEG, WebP or SVG logo (PNG with a transparent background works best).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("That logo is over 5 MB — try a smaller file.");
      return;
    }
    setUploading(true);
    setUploadError(undefined);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/brand/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("assets").upload(path, file, { contentType: file.type });
      if (error) throw error;
      setLogoUrl(supabase.storage.from("assets").getPublicUrl(path).data.publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const setColorAt = (i: number, value: string) =>
    setColors((cs) => cs.map((c, j) => (j === i ? value : c)));
  const addColor = () =>
    setColors((cs) =>
      cs.length >= MAX_BRAND_COLORS ? cs : [...cs, SUGGESTED.find((s) => !cs.includes(s)) ?? "#888888"],
    );

  return (
    <Card className="mb-5 p-5">
      <h2 className="mb-1 text-sm font-medium text-muted-strong">Brand kit</h2>
      <p className="mb-4 text-xs text-muted">
        Your name or logo goes on every scene and export; captions use your main colour and font.
      </p>
      <form action={action} className="space-y-5">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <Label htmlFor="brand_name">Brand name</Label>
              <Input
                id="brand_name"
                name="name"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder={brand.venue?.name ?? "e.g. Maison Crumb"}
              />
              <p className="mt-1 text-[11px] text-muted">
                Shown on videos when there&rsquo;s no logo. Leave blank to use your venue&rsquo;s name.
              </p>
            </div>

            <div>
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(#0000000d_0_25%,transparent_0_50%)] bg-[length:12px_12px]">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo" className="max-h-12 max-w-12 object-contain" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" loading={uploading} onClick={() => fileRef.current?.click()}>
                    {logoUrl ? "Replace logo" : "Upload logo"}
                  </Button>
                  {logoUrl && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setLogoUrl("")}>
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadLogo(file);
                    e.target.value = "";
                  }}
                />
                <input type="hidden" name="logoUrl" value={logoUrl} />
              </div>
              {uploadError && <p className="mt-1 text-[11px] text-danger">{uploadError}</p>}
            </div>

            <div>
              <Label>Brand colours</Label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 py-1 pl-1 pr-2 text-[11px] text-muted">
                  <input
                    type="color"
                    name="color"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent"
                  />
                  Captions
                </label>
                {colors.map((c, i) => (
                  <span key={i} className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 py-1 pl-1 pr-1 text-[11px] text-muted">
                    <input
                      type="color"
                      name="colors"
                      value={c}
                      onChange={(e) => setColorAt(i, e.target.value)}
                      aria-label={`Brand colour ${i + 2}`}
                      className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent"
                    />
                    {i === 0 && <span className="pr-0.5">Accent</span>}
                    <button
                      type="button"
                      onClick={() => setColors((cs) => cs.filter((_, j) => j !== i))}
                      aria-label="Remove colour"
                      className="rounded p-0.5 hover:bg-surface hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {colors.length < MAX_BRAND_COLORS && (
                  <button
                    type="button"
                    onClick={addColor}
                    className="flex h-9 items-center gap-1 rounded-lg border border-dashed border-border-strong px-2.5 text-[11px] text-muted-strong hover:border-accent hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" /> Add colour
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted">
                The first extra colour (accent) is used behind your name on videos.
              </p>
            </div>

            <div className="max-w-[12rem]">
              <Label htmlFor="font">Caption font</Label>
              <select
                id="font"
                name="font"
                value={font}
                onChange={(e) => setFont(e.target.value as typeof font)}
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

          {/* Live preview of a vertical scene with the brand applied. */}
          <div className="shrink-0 self-center sm:self-start">
            <div className="relative h-56 w-32 overflow-hidden rounded-xl bg-gradient-to-br from-[#d9b48f] via-[#a8744a] to-[#5a3a22] shadow-md">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="absolute left-2 top-2 h-5 w-auto max-w-[70%] object-contain drop-shadow" />
              ) : shownName ? (
                <span
                  className="absolute left-2 top-2 max-w-[85%] truncate rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white"
                  style={{ background: watermarkColor(preview), fontFamily: fontFamily(font) }}
                >
                  {shownName}
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                <p className="text-center text-[10px] font-semibold leading-snug" style={{ color: primary, fontFamily: fontFamily(font) }}>
                  Fresh out of the oven
                </p>
              </div>
            </div>
            <p className="mt-1 text-center text-[10px] text-muted">Preview</p>
          </div>
        </div>

        <Feedback state={state} />
        <div className="flex justify-end">
          <Button type="submit" loading={saving || uploading}>
            Save brand kit
          </Button>
        </div>
      </form>
    </Card>
  );
}
