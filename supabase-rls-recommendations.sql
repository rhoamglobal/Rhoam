-- ============================================================================
-- RLS RECOMMENDATIONS FOR RHOAM
-- ============================================================================
-- I don't have access to your live Supabase project, so I can't check what's
-- actually enabled right now. This is a STARTING TEMPLATE, not a script to
-- paste and run blindly — check column names against your real tables first
-- (Table Editor in the Supabase dashboard, or `\d tablename` in SQL editor).
--
-- Why this matters even after the API route fixes:
-- Your browser ships the anon key to every visitor. Several of your admin
-- pages (add-property, edit property) call supabase.from(...).insert/update
-- directly from client components using that anon key. If RLS on a table is
-- OFF, or has a permissive policy, ANY visitor can open devtools and run
-- the same insert/update/delete against your database directly — no need to
-- touch your UI or your (now-fixed) API routes at all.
--
-- Run each block in the Supabase SQL editor, adjusting names as needed.
-- ============================================================================

-- 1. Check what's currently enabled on each table
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relname in ('properties', 'saved_properties', 'contact_unlocks', 'admins', 'profiles')
  and relnamespace = 'public'::regnamespace;

-- ============================================================================
-- 2. properties — public can read, only admins can write
-- ============================================================================
alter table public.properties enable row level security;

drop policy if exists "properties_public_read" on public.properties;
create policy "properties_public_read"
on public.properties
for select
to anon, authenticated
using (true);

drop policy if exists "properties_admin_write" on public.properties;
create policy "properties_admin_write"
on public.properties
for insert
to authenticated
with check (
  exists (select 1 from public.admins where admins.user_id = auth.uid())
);

drop policy if exists "properties_admin_update" on public.properties;
create policy "properties_admin_update"
on public.properties
for update
to authenticated
using (
  exists (select 1 from public.admins where admins.user_id = auth.uid())
);

drop policy if exists "properties_admin_delete" on public.properties;
create policy "properties_admin_delete"
on public.properties
for delete
to authenticated
using (
  exists (select 1 from public.admins where admins.user_id = auth.uid())
);

-- ============================================================================
-- 3. saved_properties — a user can only see/change their own rows
-- ============================================================================
alter table public.saved_properties enable row level security;

drop policy if exists "saved_own_rows" on public.saved_properties;
create policy "saved_own_rows"
on public.saved_properties
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================================
-- 4. contact_unlocks — a user can only see their own unlock records.
-- Writes go through your API routes with the service-role key (which
-- bypasses RLS), so no insert/update policy is needed for authenticated
-- users here — only select, so the frontend "is this unlocked" checks work.
-- ============================================================================
alter table public.contact_unlocks enable row level security;

drop policy if exists "unlocks_own_rows_read" on public.contact_unlocks;
create policy "unlocks_own_rows_read"
on public.contact_unlocks
for select
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- 5. admins — nobody should be able to read or write this from the client.
-- Your AdminRoute component currently queries this table with the anon
-- client — if you lock this down with no policies at all (RLS on, zero
-- policies = default deny), that client-side admin check will stop working
-- and start always returning "not an admin". Two options:
--   a) Keep a narrow read policy: authenticated users can check only their
--      OWN row (safe — doesn't leak the full admin list, just tells you if
--      *you* are one).
--   b) Move the admin check to a server component / API route using
--      isAdminUser() from src/lib/supabaseServer.ts instead of querying
--      from the client. This is the safer long-term fix.
-- ============================================================================
alter table public.admins enable row level security;

drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read"
on public.admins
for select
to authenticated
using (auth.uid() = user_id);

-- No insert/update/delete policy for authenticated/anon — admins should
-- only be added via the Supabase dashboard or service-role key.

-- ============================================================================
-- 6. profiles — typical pattern: users read/update their own profile only.
-- Adjust if you need public profile fields visible to others.
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_own_read" on public.profiles;
create policy "profiles_own_read"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update"
on public.profiles
for update
to authenticated
using (auth.uid() = id);
