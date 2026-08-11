-- Splits two claims that were previously blurred into a single
-- "Verified by Rhoam" badge:
--   - verified_at / verified_by: "this listing is real, we visited it"
--     — set once, decays slowly.
--   - last_confirmed_at: "this specific unit is still available"
--     — decays fast, and is what RHM-110's confidence tiers key off.
--
-- is_available itself already existed (admin already toggles it) — this
-- migration doesn't touch that, it just adds the timestamp that says how
-- fresh that value is, plus the pieces needed for a caretaker to update
-- it themselves without an admin account.

alter table public.properties
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by text,
  add column if not exists last_confirmed_at timestamptz,
  add column if not exists caretaker_email text,
  add column if not exists caretaker_status_token text unique;

-- One-time backfill so existing verified listings don't suddenly show
-- as unverified — approximate (we don't have the real visit date for
-- historical rows), so this is deliberately a rough default, not a
-- claim about exactly when each one was actually visited.
update public.properties
set verified_at = now()
where is_verified = true and verified_at is null;

-- Same idea for last_confirmed_at: without this, every existing listing
-- would immediately show as "Availability unclear" the moment this
-- ships, even ones that are perfectly current. Backfilled to now() as a
-- one-time grace period; from here on it only updates when the admin
-- panel or a caretaker actually confirms status.
update public.properties
set last_confirmed_at = now()
where last_confirmed_at is null;

create index if not exists properties_caretaker_status_token_idx
  on public.properties (caretaker_status_token);
