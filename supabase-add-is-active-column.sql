-- New column: controls whether a property appears on the map or in
-- search at all. Separate from is_visible, which only toggles the
-- "Available"/"Unavailable" badge on a listing that's still findable.
--
-- Defaults to true so nothing currently on the map disappears when you
-- run this.
alter table public.properties
  add column if not exists is_active boolean not null default true;
