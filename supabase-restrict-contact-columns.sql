-- Closes a data leak: the "Anyone can view properties" RLS policy uses
-- `using (true)` with no column restriction, which means landlord_phone,
-- landlord_whatsapp, caretaker_name, caretaker_phone, caretaker_whatsapp,
-- caretaker_email, and caretaker_status_token are currently readable by
-- ANYONE with the public anon key — no login, no unlock payment required.
-- Same problem in reverse for UPDATE/INSERT: admin pages write these
-- columns directly from the browser today, which only works because the
-- anon/authenticated Postgres roles currently have blanket column access.
--
-- RLS filters ROWS. It does not filter COLUMNS. That's what this migration
-- adds: column-level GRANT/REVOKE, a separate and stackable permission
-- layer. After this, `anon` and `authenticated` can only ever SELECT the
-- public columns, and only `authenticated` can UPDATE/INSERT the non-contact
-- columns — never the contact ones. The service-role key (used by
-- supabaseAdmin in every API route) bypasses both RLS and column grants
-- entirely, so nothing server-side needs to change for this to take effect.
--
-- Contact fields become reachable ONLY through server routes that check
-- unlock/admin status themselves (see /api/profile/unlocked,
-- /api/admin/properties, /api/admin/properties/[id]).

-- --- SELECT: public columns only, for anon + authenticated ---------------

revoke select on public.properties from anon, authenticated;

grant select (
  id, created_at, title, description, address, category, school_tag,
  location, price, room_count, occupants_per_room, bathroom_count,
  latitude, longitude, image_url, images, amenities,
  is_verified, is_available, is_visible, is_active,
  verified_at, verified_by, last_confirmed_at, multiple_units_available
) on public.properties to anon, authenticated;

-- --- UPDATE: non-contact columns only, for authenticated -----------------
-- (Row-level access is still governed by the existing admin-only RLS
-- UPDATE policy — this just additionally blocks contact columns from ever
-- being writable via the client, even by an admin's own session.)

revoke update on public.properties from authenticated;

grant update (
  title, description, address, category, school_tag, location, price,
  room_count, occupants_per_room, bathroom_count, latitude, longitude,
  image_url, images, amenities,
  is_verified, is_available, is_visible, is_active,
  verified_at, verified_by, last_confirmed_at, multiple_units_available
) on public.properties to authenticated;

-- --- INSERT: non-contact columns only, for authenticated -----------------

revoke insert on public.properties from authenticated;

grant insert (
  title, description, address, category, school_tag, location, price,
  room_count, occupants_per_room, bathroom_count, latitude, longitude,
  image_url, images, amenities,
  is_verified, is_available, is_visible, is_active,
  verified_at, verified_by, last_confirmed_at, multiple_units_available
) on public.properties to authenticated;

-- --- Rotate caretaker_status_token ----------------------------------------
-- `using (true)` with no column restriction means every existing token was
-- readable by anyone before this migration ran. There's no way to know if
-- any were actually scraped, so treat all of them as burned: regenerate
-- every token so any copy someone already has stops working. This does not
-- affect a caretaker's ability to use a link sent *after* this migration —
-- only invalidates links already sent/exposed before now.

update public.properties
set caretaker_status_token = gen_random_uuid()::text
where caretaker_status_token is not null;
