-- Public read-only sharing: a storyboard flagged is_shared becomes readable by
-- anyone (anon + authenticated) via its id, in addition to the owner-only
-- policies. Owners still control write access exclusively.
alter table public.storyboards add column is_shared boolean not null default false;

create policy "Anyone can view shared storyboards"
  on public.storyboards for select
  to anon, authenticated
  using (is_shared = true);
