import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to save a property." },
      { status: 401 }
    );
  }

  const { propertyId } = await req.json();
  const userId = user.id;

  if (!propertyId) {
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
