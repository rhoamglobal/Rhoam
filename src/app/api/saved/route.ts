import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: saved } = await supabaseAdmin
    .from("saved_properties")
    .select("property_id")
    .eq("user_id", user.id);

  const ids = saved?.map((s) => s.property_id) || [];

  const { data: properties } = await supabaseAdmin
    .from("properties")
    .select("*")
    .in("id", ids);

  return NextResponse.json(properties || []);
}
