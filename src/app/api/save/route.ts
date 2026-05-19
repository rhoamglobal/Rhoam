import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { userId, propertyId } = await req.json();

  if (!userId || !propertyId) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // check if already saved
  const { data: existing } = await supabase
    .from("saved_properties")
    .select("*")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .maybeSingle();

  // if exists → remove (toggle off)
  if (existing) {
    await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    return NextResponse.json({ saved: false });
  }

  // else → save
  await supabase.from("saved_properties").insert({
    user_id: userId,
    property_id: propertyId,
  });

  return NextResponse.json({ saved: true });
}