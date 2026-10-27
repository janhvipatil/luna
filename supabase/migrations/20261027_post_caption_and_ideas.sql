-- User testing (Oct 2026) follow-ups.
--
-- 1. The caption a café pastes when posting the finished video (Instagram /
--    TikTok), kept with its storyboard.
alter table public.storyboards add column post_caption text;

-- 2. Idea bank: owners jot or dictate ad ideas whenever they come up; AI groups
--    them later and any idea can become a storyboard.
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 2000),
  source text not null default 'typed' check (source in ('typed', 'dictated')),
  used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ideas_user_created_idx on public.ideas (user_id, created_at desc);

alter table public.ideas enable row level security;

create policy "Users can view their own ideas"
  on public.ideas for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own ideas"
  on public.ideas for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own ideas"
  on public.ideas for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own ideas"
  on public.ideas for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger ideas_set_updated_at
  before update on public.ideas
  for each row execute function public.handle_updated_at();
