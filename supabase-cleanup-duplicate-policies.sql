-- Optional cleanup — these two pairs of policies are functionally
-- identical duplicates. Dropping one from each pair changes nothing
-- about what's allowed, just removes redundancy.

drop policy if exists "Admins can insert properties" on public.properties;
-- "Admins can create properties" stays and covers the same thing.

drop policy if exists "Admins can view admins table" on public.admins;
-- "Admins can read their own record" stays and covers the same thing.
