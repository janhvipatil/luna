-- Durable record of every generation. The /api/generate function writes the
-- result here independently of the client connection, so a generation that
-- finishes after the user navigates away or closes the tab is not lost — the
-- client reconciles ready jobs on next load.
create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storyboard_id uuid not null references public.storyboards (id) on delete cascade,
  scene_id text not null,
  status text not null default 'processing',
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generation_jobs_lookup_idx
  on public.generation_jobs (user_id, storyboard_id, updated_at desc);

alter table public.generation_jobs enable row level security;

create policy "Users can view their own jobs"
  on public.generation_jobs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own jobs"
  on public.generation_jobs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own jobs"
  on public.generation_jobs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create trigger generation_jobs_set_updated_at
  before update on public.generation_jobs
  for each row execute function public.handle_updated_at();
