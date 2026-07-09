-- ============================================================================
-- HIGH-PERFORMANCE INDEXING STRATEGY FOR RHOAM
-- ============================================================================
-- Copy and run these queries in your Supabase SQL Editor.
-- These indexes will dramatically speed up map viewport loading, coordinate-based
-- lookups, and fast text searching as your database scales to thousands of properties.
-- ============================================================================

-- 1. Bounded Spatial / Coordinate Composite Index
-- When dragging/pinning the map, the application executes queries like:
--   WHERE latitude >= south AND latitude <= north AND longitude >= west AND longitude <= east
-- Without this composite index, PostgreSQL is forced to perform full table sequential scans.
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng
ON public.properties (latitude, longitude);

-- 2. Category Lookup Index
-- Users frequently filter properties by category ("Hotels", "Student lodges", "Apartment").
-- Combining category searches with spatial bounding box queries makes this highly efficient.
CREATE INDEX IF NOT EXISTS idx_properties_category
ON public.properties (category);

-- 3. Price Filter Index
-- Price is a crucial filtering criteria. An index on price avoids table scans when doing
-- lte/gte price range matching.
CREATE INDEX IF NOT EXISTS idx_properties_price
ON public.properties (price);

-- 4. Trigram Extensions & Search Optimization (Super Fast Text Search!)
-- The search bar allows searching for title and description using "ilike '%search%'".
-- Regular B-tree indexes cannot optimize leading-wildcard queries like %word%.
-- By enabling pg_trgm (PostgreSQL Trigram Extension), we can index substrings for blazing-fast lookups.

-- Step A: Enable the pg_trgm extension (safe to run, ignores if already active)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step B: Create Generalized Inverted Index (GIN) using Trigram Ops on Title
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm
ON public.properties USING gin (title gin_trgm_ops);

-- Step C: Create GIN using Trigram Ops on Description
CREATE INDEX IF NOT EXISTS idx_properties_description_trgm
ON public.properties USING gin (description gin_trgm_ops);

-- 5. Foreign Key Optimization for User Interactions
-- Speeds up checking if a property is unlocked or saved by index-matching user_id & property_id.
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id
ON public.saved_properties (user_id);

CREATE INDEX IF NOT EXISTS idx_contact_unlocks_user_property
ON public.contact_unlocks (user_id, property_id);
