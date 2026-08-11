-- Lead capture for "we're not at your school yet" (RHM-124). Feeds
-- expansion prioritization — which schools/areas people actually search
-- for before Rhoam has listings there — rather than being pure UI
-- consolation copy with no data value.
create table if not exists public.waitlist_signups (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  email text not null,
  -- Free-text context of what they were searching for when they hit
  -- the cold-start empty state (a school name, an area, etc) — not
  -- normalized against the schools table since this also captures
  -- demand for places Rhoam doesn't have in that table yet at all.
  context text
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at);
