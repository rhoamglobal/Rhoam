-- Adds a WhatsApp contact field alongside the existing phone number.
-- Nullable since existing properties won't have this filled in yet.
alter table public.properties
  add column if not exists landlord_whatsapp text;
