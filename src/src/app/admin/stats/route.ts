import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser, isAdminUser } from "@/lib/supabaseServer";

export async function GET() {
  const { user } = await getAuthenticatedUser();

  if (!user || !(await isAdminUser(user.id))) {
    return NextResponse.json(
      { error: "Not authorized" },
      { status: 403 }
    );
  }

  const { count: propertyCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: savedCount } = await supabase
    .from("saved_properties")
    .select("*", { count: "exact", head: true });

  const { data: recentProperties } = await supabase
    .from("properties")
    .select("id,title,price,image_url,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    propertyCount: propertyCount || 0,
    userCount: userCount || 0,
    savedCount: savedCount || 0,
    recentProperties: recentProperties || [],
  });
}
