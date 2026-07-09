# What changed

## 1. Prisma removed
Dropped `@prisma/client` and `prisma` from `package.json`. No schema file existed, so nothing else referenced it.

## 2. Auth is now readable server-side (the foundation for everything else)
- `src/lib/supabase.ts` now uses `createBrowserClient` from `@supabase/ssr` instead of plain `createClient`. This stores the session in cookies instead of only `localStorage`, so your API routes can actually see who's logged in.
- `src/lib/supabaseClient.ts` was an exact duplicate of `supabase.ts` — it now just re-exports from it. One client, one source of truth.
- New `src/lib/supabaseServer.ts` — server-side helpers:
  - `getAuthenticatedUser()` — reads the real logged-in user from the request's cookies. Use this in any route handler that needs to know who's calling.
  - `isAdminUser(userId)` — checks the `admins` table via the service-role client.
- New `middleware.ts` at the project root — refreshes the Supabase session cookie on every request. Required for the cookie-based session to keep working; without it sessions can silently go stale.

## 3. Fixed: routes that trusted a client-supplied `userId`
Previously `/api/save`, `/api/saved`, `/api/unlock/initiate`, and `/api/unlock/verify` all took `userId` from the request body/query string and used it directly with the service-role client — meaning anyone could act as any other user by just changing that field. All four now call `getAuthenticatedUser()` and use the *session's* user id, ignoring anything the client sends.

- `src/app/api/save/route.ts` — no longer needs/accepts `userId` in the body.
- `src/app/api/saved/route.ts` — no longer needs/accepts `?userId=`.
- `src/app/api/save/savehelper.ts` — `fetchSaved()` no longer takes a `userId` argument.
- `src/app/property/[id]/PropertyClient.tsx` — updated its three fetch calls to match (no longer sends `userId`/`amount`).

## 4. Fixed: unlock payment amount was client-controlled
`/api/unlock/initiate` used to take `amount` straight from the request body — anyone could unlock a contact for ₦1. It now always uses a server-side constant, `UNLOCK_FEE_NGN` in `src/lib/config.ts` (currently 500, matching what the UI already charges). If you want per-property pricing later, look the price up from the `properties` table server-side here — never from the client again.

## 5. Fixed: unlock/verify didn't check who was asking
`/api/unlock/verify` parses `propertyId` and `userId` out of the payment reference string. It now also confirms that embedded `userId` matches whoever is actually logged in (via the session), and rejects with a 403 if not. It also switched to `supabaseAdmin` for the actual DB write (the anon client was being used before, which depends on RLS allowing it).

## 6. Fixed: the Monnify webhook used the anon client
`src/app/api/webhooks/monnify/route.ts` now writes with `supabaseAdmin` instead of the anon client. This is a server-to-server callback verified by HMAC signature, not a user session, so it should use the trusted admin client rather than depend on RLS.

## 7. Fixed: `/admin/stats` had no auth check at all
It was a public endpoint returning user/property/saved counts to anyone. Now it calls `getAuthenticatedUser()` + `isAdminUser()` and returns 403 if you're not an admin.

## 8. Minor cleanup
- `src/app/api/property/[id]/route.ts` was creating its own inline Supabase client with the service-role key instead of reusing `supabaseAdmin`. Now it reuses it.
- Added `.env.example` documenting the env vars this project actually needs (there wasn't one before).

## 9. RLS policies — confirmed good
Checked your actual Supabase policies and RLS-enabled state directly (you ran the queries and shared the output). Result: RLS is enabled on all five relevant tables, and the existing policies already match what this app needs — public read/admin-only write on `properties`, own-rows-only on `saved_properties`/`contact_unlocks`/`profiles`, and self-read-only on `admins`. No changes needed there.

The one piece of cleanup: two pairs of duplicate policies (one extra insert policy on `properties`, one extra select policy on `admins`) — harmless, just redundant. See `supabase-cleanup-duplicate-policies.sql` if you want to tidy those up; it's optional.


## 10. Admin check moved server-side
`AdminRoute.tsx` was a client component wrapping only 3 of the 5 admin pages (`admin/page.tsx`, `admin/users/page.tsx`, `admin/properties/[id]/page.tsx`) — `add-property` and the properties list had **no gate at all**, client or server. It also only ran after the page had already loaded in the browser.

Replaced with `src/app/admin/layout.tsx`, a server component that wraps everything under `/admin`. It checks `getAuthenticatedUser()` + `isAdminUser()` before any admin page (or its data) is sent to the browser at all, and redirects to `/login` if not logged in, or shows "Access Denied" if logged in but not an admin. This now covers all five admin pages uniformly.

- Removed the `AdminRoute` wrapper from the three pages that had it, and deleted `src/components/auth/AdminRoute.tsx` since nothing uses it anymore.
- Also fixed an unrelated bug I noticed while in `admin/page.tsx`: it was fetching `/api/admin/stats`, but the actual route lives at `/admin/stats` — that request has never resolved to anything. Fixed the URL.

Note: RLS on your Supabase tables (see item 9) is still what protects the *data* if someone bypasses your UI entirely and queries Supabase directly. This layout closes the page-level gap, not the database-level one.


## Before you run this
Run `npm install` (package.json changed), then `npm run build` to make sure everything compiles in your environment — I wasn't able to run a full type-check here since this sandbox has no network access to install packages. Let me know if anything doesn't compile and I'll fix it.
