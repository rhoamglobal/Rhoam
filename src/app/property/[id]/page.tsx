import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import PropertyClient from "./PropertyClient";

export const dynamic = "force-dynamic";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch current property
  const { data: property } = await supabaseAdmin
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) return notFound();

  // Fetch nearby properties (same school, exclude current)
  const { data: nearbyProperties } = await supabaseAdmin
    .from("properties")
    .select("*")
    .eq("school_tag", property.school_tag)
    .neq("id", property.id)
    .limit(4);

  return (
    <PropertyClient
      property={property}
      nearbyProperties={nearbyProperties || []}
    />
  );
}