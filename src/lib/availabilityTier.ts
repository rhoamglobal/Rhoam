export type AvailabilityTier =
  | "multiple_available"
  | "confirmed_today"
  | "confirmed_recently"
  | "unclear";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

// Deliberately returns a tier label, never a raw date or "X days ago"
// string — showing the actual elapsed time was flagged as likely to
// make a perfectly fine listing look stale/risky by itself. The tier is
// the only thing that should ever reach the UI; if you're tempted to
// also show last_confirmed_at directly next to this, don't — that
// defeats the point.
//
// multipleUnitsAvailable is a separate signal from last_confirmed_at:
// it's Rhoam personally confirming there's more than one vacant room
// at a multi-unit property (hostel, lodge, compound with several
// units) — not just "this one unit was available as of some date", and
// deliberately not an exact count either; users only ever see the
// badge. A property with several confirmed vacancies is much less
// likely to have gone fully to zero than a single-unit listing is to
// have been taken — so it stays "active" even past the normal
// freshness window that would otherwise degrade it to "unclear".
export function getAvailabilityTier(
  lastConfirmedAt: string | null,
  multipleUnitsAvailable?: boolean
): AvailabilityTier {
  if (multipleUnitsAvailable) return "multiple_available";

  if (!lastConfirmedAt) return "unclear";

  const elapsed = Date.now() - new Date(lastConfirmedAt).getTime();

  if (elapsed < 0) return "confirmed_today"; // clock skew guard
  if (elapsed < ONE_DAY_MS) return "confirmed_today";
  if (elapsed < SEVEN_DAYS_MS) return "confirmed_recently";
  return "unclear";
}

export const AVAILABILITY_TIER_COPY: Record<
  AvailabilityTier,
  { label: string; tone: "green" | "neutral" | "amber" }
> = {
  multiple_available: { label: "Multiple rooms available", tone: "green" },
  confirmed_today: { label: "Confirmed today", tone: "green" },
  confirmed_recently: { label: "Confirmed recently", tone: "neutral" },
  unclear: { label: "Availability unclear", tone: "amber" },
};
