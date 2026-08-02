import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import PropertyClient from "./PropertyClient";

import type { Metadata } from "next";

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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const { data: property } = await supabaseAdmin
    .from("properties")
    .select(`
      id,
      title,
      price,
      description,
      image_url,
      location,
      category,
      room_count
    `)
    .eq("id", id)
    .single();

  if (!property) {
    return {
      title: "Property Not Found",
    };
  }

  const title =
    `${property.title} • ₦${Number(property.price).toLocaleString()} | RHOAM`;

  const description =
    property.description ??
    `Explore this ${property.category} in ${property.location} on RHOAM.`;

  return {
    title,

    description,

    keywords: [
      property.category,
      property.location,
      property.title,
      "Apartment",
      "Student Accommodation",
      "Shortlet",
      "Hotel",
      "RHOAM",
    ],

    openGraph: {
      title,

      description,

      images: property.image_url
        ? [
            {
              url: property.image_url,
              width: 1200,
              height: 630,
              alt: property.title,
            },
          ]
        : [],

      type: "website",
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      images: property.image_url
        ? [property.image_url]
        : [],
    },
    

    alternates: {
      canonical: `/property/${id}`,
    },
  };
}



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

  // These two don't depend on each other — the auth/unlock check and the
  // nearby-properties fetch only need what we already have from the
  // property fetch above. Running them in parallel instead of one after
  // another shaves a full round-trip off every page load.
  const [{ user }, { data: nearbyProperties }] = await Promise.all([
    getAuthenticatedUser(),
    supabaseAdmin
      .from("properties")
      .select(PUBLIC_PROPERTY_COLUMNS)
      .eq("school_tag", property.school_tag)
      .eq("is_active", true)
      .neq("id", property.id)
      .limit(4),
  ]);

  // Only attach contact info if this specific visitor is logged in AND has
  // an actual paid unlock for this specific property. Nothing else on this
  // page — not the map, not search, not the saved list — is allowed to
  // include these fields at all. This part has to stay sequential: we
  // can't know whether to fetch contact fields until we know whether
  // there's an actual unlock row for this user.
  let contactFields: Record<string, string | null> = {};
  let isUnlocked = false;

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

  const schemaType =
    fullProperty.category === "Hotel"
      ? "Hotel"
      : fullProperty.category === "Shortlet"
      ? "LodgingBusiness"
      : "Apartment";
      
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
  
    name: fullProperty.title,
  
    description: fullProperty.description,
  
    image:
      fullProperty.images?.length
        ? fullProperty.images
        : fullProperty.image_url
        ? [fullProperty.image_url]
        : [],
  
    address: {
      "@type": "PostalAddress",
      streetAddress: fullProperty.address ?? "",
      addressLocality: fullProperty.location ?? "",
      addressCountry: "NG",
    },
  
    offers: {
      "@type": "Offer",
      price: fullProperty.price,
      priceCurrency: "NGN",
      availability: fullProperty.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    },
  };
  

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <PropertyClient
        property={fullProperty}
        nearbyProperties={nearbyProperties || []}
      />
    </>
  );
}
