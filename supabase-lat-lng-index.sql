-- Speeds up the map's bounding-box query in /api/property, which filters
-- on latitude/longitude on every pan/zoom. Without an index, Postgres has
-- to scan every row in the table for each request.
create index if not exists idx_properties_lat_lng
  on public.properties (latitude, longitude);
