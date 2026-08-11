-- Your live availability_pings table drifted from what the app expects
-- (requested_at instead of created_at, requested_by instead of
-- requested_by_user_id, a 2-value "response" column with no pending
-- state instead of a proper 3-value status). Rather than bend the code
-- around that, this drops and recreates it matching the same pattern
-- your other tables already use (unlock_reports, unlock_feedback):
-- bigint identity id, created_at, an explicit status enum with a real
-- 'pending' state instead of relying on NULL to mean "not answered yet".
--
-- Safe to drop: nothing else references availability_pings.id as a
-- foreign key, so there's no cascading cleanup needed elsewhere.

drop table if exists public.availability_pings;

create table public.availability_pings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  property_id uuid not null references public.properties(id) on delete cascade,
  requested_by_user_id uuid references auth.users(id) on delete set null,

  status text not null default 'pending' check (
    status in ('pending', 'confirmed_available', 'confirmed_taken')
  ),
  responded_at timestamptz
);

create index availability_pings_property_id_idx
  on public.availability_pings (property_id);

create index availability_pings_created_at_idx
  on public.availability_pings (created_at);

-- RLS: locked down like the rest of the contact-adjacent tables — no
-- direct client access at all. Every read/write to this table goes
-- through server routes using the service-role client
-- (/api/availability-ping, /api/caretaker/[token],
-- /api/admin/availability-requests), which each do their own
-- auth/ownership checks in code. anon/authenticated get nothing here,
-- same reasoning as the contact-column lockdown on properties.

alter table public.availability_pings enable row level security;
