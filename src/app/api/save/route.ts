import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { propertyId } = await req.json();

  if (!propertyId) {
    return NextResponse.json(
      { error: "Missing propertyId" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check if already saved
  const { data: existing } = await supabase
    .from("saved_properties")
    .select("*")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  // if exists → remove (toggle off)
  if (existing) {
    await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", user.id)
      .eq("property_id", propertyId);

    return NextResponse.json({ saved: false });
  }

  // else → save
  await supabase.from("saved_properties").insert({
    user_id: user.id,
    property_id: propertyId,
  });

  return NextResponse.json({ saved: true });
}
