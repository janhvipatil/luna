"use client";

import { useBrandKit } from "@/lib/data/UserContext";
import { fontFamily } from "@/lib/brand";

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

/** Brand logo watermark, top-left, if the user set one. */
export function LogoWatermark() {
  const brand = useBrandKit();
  if (!brand.logoUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logoUrl}
      alt=""
      className="pointer-events-none absolute left-3 top-3 h-6 w-auto max-w-[40%] object-contain drop-shadow"
    />
  );
}
