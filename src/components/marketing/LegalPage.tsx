/** Shared layout for the legal pages (simple prose, readable measure). */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-xs text-muted">Last updated {updated}</p>
      <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-muted-strong">
        Draft — have this reviewed by a lawyer before launch.
      </div>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-strong [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}
