-- Bring-your-own-key AI settings. Each user connects their own Gemini API key,
-- which powers drafting, voiceover, images and video on their own Google bill.
-- The key is encrypted by the app (AES-256-GCM, APP_ENCRYPTION_KEY) before it
-- is stored; only the server can decrypt it, and only a short hint is shown.
create table public.user_ai_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  gemini_key_encrypted text,
  gemini_key_hint text,
  -- Paid features are opt-in so a key never spends money by surprise.
  gemini_images boolean not null default false,
  video_model text not null default 'fast' check (video_model in ('lite', 'fast', 'standard')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_ai_settings enable row level security;

create policy "Users can view their own AI settings"
  on public.user_ai_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own AI settings"
  on public.user_ai_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own AI settings"
  on public.user_ai_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own AI settings"
  on public.user_ai_settings for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create trigger user_ai_settings_set_updated_at
  before update on public.user_ai_settings
  for each row execute function public.handle_updated_at();
