-- Optional background-music track for a storyboard, mixed into the exported
-- video and played in the preview. Owner-scoped RLS already covers the column.
alter table public.storyboards add column music_url text;
