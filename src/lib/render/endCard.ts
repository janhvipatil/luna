import sharp from "sharp";
import { brandName, type BrandKit } from "@/lib/brand";

/** Seconds the branded end card stays on screen (matches the browser export). */
export const END_CARD_SEC = 2.5;

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

function fontStack(font: BrandKit["font"]): string {
  if (font === "serif") return "Georgia, 'DejaVu Serif', serif";
  if (font === "mono") return "'DejaVu Sans Mono', monospace";
  return "Helvetica, Arial, 'DejaVu Sans', sans-serif";
}

/** Whether a brand kit has enough to make an end card. */
export function hasEndCard(brand: BrandKit): boolean {
  return Boolean(brand.logoUrl || brandName(brand));
}

/**
 * The closing card of a server render, as a WxH PNG: the logo (or the brand
 * name) on the accent color, the location underneath, and a thin stripe per
 * extra brand color — the same layout as the browser export's end card.
 */
export async function buildEndCard(brand: BrandKit, w: number, h: number): Promise<Buffer> {
  const bg = brand.colors?.[0] ?? "#1f2a24";
  const ink = brand.color ?? "#ffffff";
  const name = brandName(brand);
  const family = fontStack(brand.font);

  let logo: { input: Buffer; top: number; left: number } | null = null;
  let y = Math.round(h * 0.42);
  if (brand.logoUrl) {
    try {
      const res = await fetch(brand.logoUrl);
      if (res.ok) {
        const lw = Math.round(w * 0.46);
        const input = await sharp(Buffer.from(await res.arrayBuffer()))
          .resize({ width: lw })
          .png()
          .toBuffer();
        const meta = await sharp(input).metadata();
        const lh = meta.height ?? Math.round(lw / 4);
        logo = { input, left: Math.round((w - lw) / 2), top: Math.round(y - lh / 2) };
        y += Math.round(lh / 2 + w * 0.08);
      }
    } catch {
      // Fall back to the name below.
    }
  }

  const parts: string[] = [];
  if (!logo && name) {
    parts.push(
      `<text x="${w / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="${family}" font-size="${Math.round(w * 0.085)}" font-weight="700" fill="${ink}">${escapeXml(name)}</text>`,
    );
    y += Math.round(w * 0.1);
  }
  const line = brand.venue?.location ?? (logo ? name : undefined);
  if (line) {
    parts.push(
      `<text x="${w / 2}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="${family}" font-size="${Math.round(w * 0.038)}" font-weight="600" fill="${ink}" fill-opacity="0.85" letter-spacing="${Math.round(w * 0.004)}">${escapeXml(line.toUpperCase())}</text>`,
    );
  }
  const stripes = brand.colors?.slice(1) ?? [];
  const sh = Math.round(h * 0.012);
  stripes.forEach((c, i) => {
    parts.push(`<rect x="0" y="${h - (stripes.length - i) * sh}" width="${w}" height="${sh}" fill="${c}"/>`);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/>${parts.join("")}</svg>`;
  const card = sharp(Buffer.from(svg));
  return (logo ? card.composite([logo]) : card).png().toBuffer();
}
