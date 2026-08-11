-- Separate from is_available (single on/off flag for the listing as a
-- whole). This is specifically: "Rhoam has personally confirmed this
-- multi-room property (hostel, lodge, compound) currently has more
-- than one vacant room." Users only ever see a badge, never a number —
-- the exact count isn't shown, just that there's more than one option
-- open right now.
--
-- Why this matters for the availability badge: a property with several
-- confirmed-vacant rooms is much less likely to have gone fully to
-- zero than a single-unit listing is to have been taken, so it stays
-- "active" past the normal freshness window that would otherwise
-- degrade a single-unit listing to "unclear".
--
-- Default false — most listings are a single unit and will never set
-- this. Only ever set true by admin verification.

alter table public.properties
  add column if not exists multiple_units_available boolean not null default false;

comment on column public.properties.multiple_units_available is
  'True if Rhoam has personally confirmed more than one vacant room at this property. Only set by admin verification. Never expose the exact count to users, just the badge.';
