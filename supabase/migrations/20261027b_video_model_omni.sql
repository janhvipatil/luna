-- Gemini Omni Flash becomes the default video model (Veo tiers stay selectable).
alter table public.user_ai_settings drop constraint if exists user_ai_settings_video_model_check;
alter table public.user_ai_settings
  add constraint user_ai_settings_video_model_check check (video_model in ('omni', 'lite', 'fast', 'standard'));
alter table public.user_ai_settings alter column video_model set default 'omni';
