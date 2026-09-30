-- Per-user brand kit (color, font, logo) applied to caption styling and
-- overlays across preview, player, and export. Stored as JSONB on the existing
-- profiles row; the existing owner-scoped RLS policies already cover it.
alter table public.profiles add column brand_kit jsonb;

comment on column public.profiles.brand_kit is 'Optional { color, font, logoUrl } brand styling for exports.';
