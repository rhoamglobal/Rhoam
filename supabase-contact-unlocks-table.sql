-- contact_unlocks: one row per (user, property) that a student has paid
-- to unlock the landlord's contact for. Permanent once created — nothing
-- in the app ever deletes these rows, which is what makes "unlocked"
-- persist forever once paid for.

create table if not exists public.contact_unlocks (
  id bigint generated always as identity primary key,

  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,

  payment_reference text not null,
  payment_method text not null default 'paystack',

  created_at timestamptz not null default now(),

  -- Required for your code's .upsert(..., { onConflict: "user_id,property_id" })
  -- to work at all — Postgres needs a matching unique constraint for
  -- ON CONFLICT to target. Without this, every upsert call throws.
  unique (user_id, property_id)
);

-- Prevents the same Paystack reference from ever being written twice,
-- e.g. if the webhook and the /verify route both fire for the same payment.
create unique index if not exists contact_unlocks_payment_reference_key
  on public.contact_unlocks (payment_reference);

-- Fast lookups for "does this user have this property unlocked?"
create index if not exists contact_unlocks_user_id_idx
  on public.contact_unlocks (user_id);

-- RLS — matches what you already confirmed is live: a user can only see
-- their own unlock records. All writes go through your API routes using
-- the service-role key, which bypasses RLS entirely, so no insert/update
-- policy is needed here for normal users.
alter table public.contact_unlocks enable row level security;

drop policy if exists "unlocks_own_rows_read" on public.contact_unlocks;
create policy "unlocks_own_rows_read"
on public.contact_unlocks
for select
to authenticated
using (auth.uid() = user_id);
