/** A post caption as the API returns it (browser-safe; see lib/caption). */
export interface PostCaption {
  caption: string;
  hashtags: string[];
}

/** Caption + hashtags as one paste-ready block. */
export function formatPostCaption({ caption, hashtags }: PostCaption): string {
  const tags = hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ");
  return tags ? `${caption.trim()}\n\n${tags}` : caption.trim();
}
