import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { propertyId } = await req.json();

  if (!propertyId) {
    return NextResponse.json(
      { error: "Missing propertyId" },
      { status: 400 }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check if already saved
  const { data: existing } = await supabaseAdmin
    .from("saved_properties")
    .select("*")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  // if exists → remove (toggle off)
  if (existing) {
    await supabaseAdmin
      .from("saved_properties")
      .delete()
      .eq("user_id", user.id)
      .eq("property_id", propertyId);

    return NextResponse.json({ saved: false });
  }

  // else → save
  await supabaseAdmin.from("saved_properties").insert({
    user_id: user.id,
    property_id: propertyId,
  });

  return NextResponse.json({ saved: true });
}
