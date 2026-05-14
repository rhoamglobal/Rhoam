import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data: saved } = await supabaseAdmin
    .from("saved_properties")
    .select("property_id")
    .eq("user_id", userId);

  const ids = saved?.map((s) => s.property_id) || [];

  const { data: properties } = await supabaseAdmin
    .from("properties")
    .select("*")
    .in("id", ids);

  return NextResponse.json(properties || []);
}
