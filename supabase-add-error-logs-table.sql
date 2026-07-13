-- Lightweight error logging — no external service required. Every
-- server-side crash in a money-critical path (payment initiate/verify,
-- the webhook) gets written here, plus client-side React rendering
-- errors via the error boundary.
--
-- RLS is enabled with NO policies at all, on purpose: this table should
-- only ever be touched by the service-role key (server-side code), never
-- directly by a browser with the anon key, even an authenticated one.
create table if not exists public.error_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  -- 'server' (API route) or 'client' (React error boundary)
  source text not null,

  -- e.g. "/api/unlock/verify" or "/property/[id]"
  route text,

  message text not null,
  stack text,

  -- free-form extra context: user id, property id, reference, etc.
  context jsonb
);

create index if not exists error_logs_created_at_idx
  on public.error_logs (created_at desc);

alter table public.error_logs enable row level security;
-- Deliberately no policies — default-deny for anon/authenticated.
-- Only the service-role key (which bypasses RLS) can read or write this.
