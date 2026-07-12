-- Optional on-site caretaker contact, separate from the landlord.
-- All nullable — not every property has a caretaker, and existing rows
-- won't have these filled in yet.
alter table public.properties
  add column if not exists caretaker_name text,
  add column if not exists caretaker_phone text,
  add column if not exists caretaker_whatsapp text;
