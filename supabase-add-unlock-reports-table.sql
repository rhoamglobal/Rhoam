-- unlock_reports: lets a student flag a problem with a contact they've
-- already paid to unlock (wrong number, listing already gone, etc).
-- This is the concrete implementation of the refund/dispute path that
-- was previously just "handle it case by case over email" — every
-- report is now a row someone can actually query, count, and act on,
-- and it's the seed of a future caretaker-reliability dataset.

create table if not exists public.unlock_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,

  -- Not a strict FK to contact_unlocks on purpose: we still want the
  -- report to save even if the unlock row it refers to was somehow
  -- removed, so support isn't blocked by a join failure. The report
  -- always carries user_id + property_id, which is enough to look the
  -- unlock up manually if needed.
  unlock_reference text,

  issue_type text not null check (
    issue_type in ('wrong_number', 'listing_gone', 'other')
  ),
  note text,

  status text not null default 'open' check (
    status in ('open', 'reviewing', 'resolved')
  ),

  resolved_at timestamptz,
  resolution_note text
);

create index if not exists unlock_reports_user_id_idx
  on public.unlock_reports (user_id);

create index if not exists unlock_reports_status_idx
  on public.unlock_reports (status);

create index if not exists unlock_reports_property_id_idx
  on public.unlock_reports (property_id);

-- Same pattern as contact_unlocks: users can read their own reports (so
-- a future "your reports" view is possible), but all writes happen
-- through the API route using the service-role key.
alter table public.unlock_reports enable row level security;

drop policy if exists "unlock_reports_own_rows_read" on public.unlock_reports;
create policy "unlock_reports_own_rows_read"
on public.unlock_reports
for select
to authenticated
using (auth.uid() = user_id);
