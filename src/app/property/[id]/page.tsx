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

  const { data: property } = await supabaseAdmin
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
    console.log(property.id);
    console.log("FULL PROPERTY:", property);
console.log("PROPERTY ID:", property?.id);
console.log("RECEIVED PROPERTY:", property);

  if (!property) return notFound();

  return <PropertyClient property={property} />;
}
