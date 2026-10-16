-- Long-running providers (e.g. Google Veo) return an operation to poll instead
-- of a finished asset. Record which provider owns the job and its operation id
-- so the job can be polled to completion — even after the client reconnects.
alter table public.generation_jobs
  add column provider_id text,
  add column operation text;

-- Pending jobs are looked up by status when a storyboard is reopened.
create index generation_jobs_status_idx
  on public.generation_jobs (user_id, status, updated_at desc);
