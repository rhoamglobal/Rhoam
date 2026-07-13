import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import PropertyClient from "./PropertyClient";

export const dynamic = "force-dynamic";

// Every field EXCEPT landlord/caretaker contact info. This page must never
// fetch those columns by default — they're attached separately below, and
// only after confirming the current visitor has actually paid to unlock
// this specific property. Explicit allowlist on purpose: if a new sensitive
// column ever gets added to `properties`, it's excluded by default instead
// of silently leaking until someone remembers to hide it.
const PUBLIC_PROPERTY_COLUMNS = `
  id, title, price, latitude, longitude, category,
  image_url, images, description, amenities,
  school_tag, location, is_verified, address,
  is_available, is_visible, is_active,
  room_count, occupants_per_room, bathroom_count
`;

const CONTACT_COLUMNS = `
  landlord_phone, landlord_whatsapp,
  caretaker_name, caretaker_phone, caretaker_whatsapp
`;

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch current property — contact fields deliberately excluded here.
  const { data: property } = await supabaseAdmin
    .from("properties")
    .select(PUBLIC_PROPERTY_COLUMNS)
    .eq("id", id)
    .single();

  if (!property) return notFound();

  // A property taken off the map/search shouldn't still be reachable by
  // someone who has (or guesses) the old link.
  if (!property.is_active) return notFound();

  // Only attach contact info if this specific visitor is logged in AND has
  // an actual paid unlock for this specific property. Nothing else on this
  // page — not the map, not search, not the saved list — is allowed to
  // include these fields at all.
  let contactFields: Record<string, string | null> = {};
  let isUnlocked = false;

  const { user } = await getAuthenticatedUser();

  if (user) {
    const { data: unlock } = await supabaseAdmin
      .from("contact_unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", id)
      .maybeSingle();

    if (unlock) {
      isUnlocked = true;

      const { data: contactData } = await supabaseAdmin
        .from("properties")
        .select(CONTACT_COLUMNS)
        .eq("id", id)
        .single();

      contactFields = contactData || {};
    }
  }

  const fullProperty = {
    ...property,
    ...contactFields,
    isUnlocked,
  };

  // Fetch nearby properties (same school, exclude current) — same
  // allowlist, contact info is never relevant for the preview carousel.
  const { data: nearbyProperties } = await supabaseAdmin
    .from("properties")
    .select(PUBLIC_PROPERTY_COLUMNS)
    .eq("school_tag", property.school_tag)
    .eq("is_active", true)
    .neq("id", property.id)
    .limit(4);

  return (
    <PropertyClient
      property={fullProperty}
      nearbyProperties={nearbyProperties || []}
    />
  );
}
