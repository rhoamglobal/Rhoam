// Server-side source of truth for pricing. The old code accepted `amount`
// directly from the client on /api/unlock/initiate, which meant anyone
// could unlock a landlord's contact info for ₦1 by editing the request.
// Keep the real price here (or, if you later want per-property pricing,
// look it up from the `properties` table server-side) — never take it
// from the request body again.
export const UNLOCK_FEE_NGN = 100;
