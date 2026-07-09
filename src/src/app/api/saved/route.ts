import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";

export async function GET() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to view saved properties." },
      { status: 401 }
    );
  }

  const userId = user.id;

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
