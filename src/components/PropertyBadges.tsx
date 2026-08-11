import { CheckCircle2, Clock3, HelpCircle, Users } from "lucide-react";
import { getAvailabilityTier, AVAILABILITY_TIER_COPY } from "@/lib/availabilityTier";

// Two previously-blurred claims, now two components: VerifiedBadge says
// "this listing is real, we visited it" (decays slowly — set once).
// AvailabilityBadge says "this specific unit is still open" (decays
// fast — a few days, not months). Rendering them as visually distinct
// elements (different color families, different icons) means a
// property can honestly be verified-but-availability-unclear without
// one badge implying something the other doesn't back up.

export function VerifiedBadge({
  verifiedAt,
}: {
  verifiedAt?: string | null;
}) {
  if (!verifiedAt) return null;

  const date = new Date(verifiedAt).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });

  return (
    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
      <CheckCircle2 size={13} />
      Personally visited by Rhoam · {date}
    </span>
  );
}

const TONE_CLASSES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  neutral: "bg-gray-50 text-gray-600 border-gray-200",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
};

export function AvailabilityBadge({
  lastConfirmedAt,
  multipleUnitsAvailable,
}: {
  lastConfirmedAt?: string | null;
  multipleUnitsAvailable?: boolean;
}) {
  const tier = getAvailabilityTier(lastConfirmedAt ?? null, multipleUnitsAvailable);
  const { label, tone } = AVAILABILITY_TIER_COPY[tier];
  const Icon =
    tier === "unclear"
      ? HelpCircle
      : tier === "multiple_available"
      ? Users
      : Clock3;

  return (
    <span
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${TONE_CLASSES[tone]}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}
