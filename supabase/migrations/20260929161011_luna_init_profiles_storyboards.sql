-- Luna schema: per-user profiles and storyboards with RLS.

-- ---------------------------------------------------------------------------
-- profiles: one public profile row per auth user.
-- Email is intentionally NOT stored here; it lives in auth.users and is read
-- from the session for the owner only, so the members directory can be readable
-- by authenticated users without exposing anyone's email.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- storyboards: owned by a single user; scenes stored inline as JSONB to mirror
-- the client model.
-- ---------------------------------------------------------------------------
create table public.storyboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default 'Untitled storyboard',
  description text not null default '',
  format text not null default '9:16',
  scenes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index storyboards_user_id_idx on public.storyboards (user_id);
create index storyboards_updated_at_idx on public.storyboards (updated_at desc);

alter table public.storyboards enable row level security;

create policy "Users can view their own storyboards"
  on public.storyboards for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own storyboards"
  on public.storyboards for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own storyboards"
  on public.storyboards for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own storyboards"
  on public.storyboards for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Triggers: maintain updated_at and auto-create a profile on signup.
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger storyboards_set_updated_at
  before update on public.storyboards
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
