# Rhoam — Deployment Runbook

Everything needed to bring this session's changes live. Run in order.

## 1. Install dependencies

```bash
npm install
```
Picks up `resend`, already added to `package.json`.

## 2. Run SQL migrations, in this exact order

Order matters — later migrations reference columns/tables created by earlier ones.

```
supabase-add-unlock-reports-table.sql
supabase-add-verification-availability-fields.sql
supabase-add-availability-pings-table.sql
supabase-add-unlock-feedback-table.sql
supabase-add-waitlist-signups-table.sql
```

Run each in the Supabase SQL editor (or via CLI/migration tool, whichever this project already uses). All are idempotent (`if not exists` / `if null` guards), safe to re-run.

## 3. Environment variables

Add to `.env` / your hosting provider's env config:

```
RESEND_API_KEY=
RESEND_FROM_EMAIL=Rhoam <notifications@yourdomain.com>
```

`.env.example` has the full list with inline comments, including the OAuth note below.

## 4. Supabase Dashboard — OAuth providers

1. Authentication → Providers → enable **Google** and **Apple**, add their client IDs/secrets.
2. Add this app's callback URL to each provider's allowed redirect list:
   `https://yourdomain.com/auth/callback` (and the `localhost:3000` equivalent for local dev).

Skipping this doesn't break anything else — the OAuth buttons will just fail with a clear `redirect_uri_mismatch` or provider-not-enabled error until this is done.

## 5. Resend — domain setup

1. Verify your sending domain in the Resend dashboard (needed for `RESEND_FROM_EMAIL` to actually deliver, not land in spam).
2. Until that's done, caretaker "ask if still available" pings (RHM-112) will fail at the `sendCaretakerAvailabilityPing` call — the API route surfaces this as a clean error to the student ("Couldn't reach the caretaker right now"), it won't crash anything, but pings simply won't send until this step is done.

## 6. Data backfill

- **`caretaker_email`** — not populated by any migration (there was no source data for it). The ping system checks for this and cleanly no-ops with a message if it's missing, but pings are useless until real emails are on file. Worth a one-time backfill pass on existing listings, then part of your normal listing-intake process going forward.
- **`caretaker_status_token`** — auto-backfilled by `supabase-add-availability-pings-table.sql` for every existing property. Nothing to do here.
- **`verified_at`** — backfilled to "now" for every currently-`is_verified` property. This is a placeholder, not the real historical visit date (that data doesn't exist anywhere). If you have actual visit-date records elsewhere, worth a follow-up update; otherwise the badge will just read as "visited this month" for old listings until they're naturally re-verified.

## 7. Review, don't just ship, this content

- **`/refund-policy`** (`src/app/refund-policy/page.tsx`) — the copy is functional but explicitly marked as placeholder in the file's own metadata. This is legal/policy language; review and finalize it before launch, don't treat it as final just because it's coded.

## 8. Verify locally

```bash
npm run build
npm run dev
```

This is the real test — everything in this session was hand-written against existing patterns without the ability to compile or run a dev server in the sandbox it was built in. Pay particular attention to:
- Login/signup OAuth buttons (need step 4 done first to fully test)
- Unlock flow error states (try disconnecting network mid-unlock to see the inline retry)
- The `/caretaker/[token]` page (grab a token directly from the `properties` table for a quick manual test)
- Map empty states (search a nonsense query, and a query outside your current listing coverage, to see both variants)

## Full list of new files this session

**Pages:** `forgot-password`, `reset-password`, `refund-policy`, `caretaker/[token]`, `auth/callback`

**API routes:** `unlock-reports`, `auth/callback`, `availability-ping`, `caretaker/[token]`, `unlock-feedback`, `unlock-feedback/pending`, `waitlist`

**Components:** `ReportIssueModal`, `OAuthButtons`, `MapEmptyState`, `PropertyBadges`, `AskAvailabilityButton`, `PostUnlockFeedbackBanner`, `ValuePropBanner`, `OfflineBanner`

**Hooks/lib:** `useDialogA11y`, `usePrefersReducedMotion`, `useOnlineStatus`, `zIndex.ts`, `motionPresets.ts`, `availabilityTier.ts`, `mailer.ts`

**SQL migrations:** the 5 listed in step 2 above
