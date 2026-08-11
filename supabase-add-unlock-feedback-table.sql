-- Post-unlock "did this work out?" follow-up (RHM-113). Structured
-- options rather than free text so responses are aggregable from day
-- one — this is the seed of a future caretaker-reliability rating,
-- same spirit as unlock_reports and availability_pings.
create table if not exists public.unlock_feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,

  response text not null check (
    response in ('found_place', 'still_looking', 'no_response', 'listing_wrong')
  ),

  -- One response per unlocked property per user — asking twice about
  -- the same unlock isn't useful and would just annoy people.
  unique (user_id, property_id)
);

create index if not exists unlock_feedback_property_id_idx
  on public.unlock_feedback (property_id);

alter table public.unlock_feedback enable row level security;

drop policy if exists "unlock_feedback_own_rows" on public.unlock_feedback;
create policy "unlock_feedback_own_rows"
on public.unlock_feedback
for select
to authenticated
using (auth.uid() = user_id);
