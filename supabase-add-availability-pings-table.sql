-- Logs every "ask if still available" ping (RHM-112): who asked, what
-- the caretaker's status update page said in response, and how long it
-- took. Even before anything surfaces this data in the product, it's
-- the seed of the caretaker-reliability dataset flagged earlier as
-- missing — every row here is a real, timestamped data point.
create table if not exists public.availability_pings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  property_id uuid not null references public.properties(id) on delete cascade,
  requested_by_user_id uuid references auth.users(id) on delete set null,

  status text not null default 'pending' check (
    status in ('pending', 'confirmed_available', 'confirmed_taken')
  ),
  responded_at timestamptz
);

create index if not exists availability_pings_property_id_idx
  on public.availability_pings (property_id);

create index if not exists availability_pings_created_at_idx
  on public.availability_pings (created_at);

alter table public.availability_pings enable row level security;

-- No public read policy: pings are only read/written through the
-- service-role API routes (initiating a ping, and the caretaker's
-- token-gated response page), same pattern as unlock_reports.

-- One-time backfill: every existing property gets a persistent random
-- token so the caretaker status page (/caretaker/[token]) works
-- immediately for already-listed properties, not just ones created
-- after this migration. Uses gen_random_uuid() (pgcrypto, already
-- enabled by default on Supabase projects) rather than anything
-- guessable from the property's own id.
update public.properties
set caretaker_status_token = gen_random_uuid()::text
where caretaker_status_token is null;
