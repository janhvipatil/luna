"use client";

import { useBrandKit } from "@/lib/data/UserContext";
import { brandName, fontFamily, watermarkColor } from "@/lib/brand";

/** Scene caption styled with the user's brand color and font. */
export function BrandCaption({ text }: { text: string }) {
  const brand = useBrandKit();
  if (!text) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
      <p
        className="text-center text-sm font-semibold leading-snug drop-shadow"
        style={{ color: brand.color ?? "#ffffff", fontFamily: fontFamily(brand.font) }}
      >
        {text}
      </p>
    </div>
  );
}

/** Brand watermark, top-left: the logo if set, else the brand name. */
export function LogoWatermark() {
  const brand = useBrandKit();
  const name = brandName(brand);
  if (brand.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logoUrl}
        alt={name ?? ""}
        className="pointer-events-none absolute left-3 top-3 h-6 w-auto max-w-[40%] object-contain drop-shadow"
      />
    );
  }
  if (!name) return null;
  return (
    <span
      className="pointer-events-none absolute left-3 top-3 max-w-[60%] truncate rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow"
      style={{ background: watermarkColor(brand), fontFamily: fontFamily(brand.font) }}
    >
      {name}
    </span>
  );
}
