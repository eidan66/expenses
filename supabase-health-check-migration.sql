-- Run this once in Supabase Dashboard → SQL Editor to enable the health-check keep-alive.
-- Keeps the project from pausing by writing a daily timestamp via Vercel Cron → api/health.

create table if not exists app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Allow the service role to upsert freely (RLS off for this table)
alter table app_settings disable row level security;

-- Seed the health row so the first upsert works
insert into app_settings (key, value, updated_at)
values ('health_timestamp', now()::text, now())
on conflict (key) do nothing;
