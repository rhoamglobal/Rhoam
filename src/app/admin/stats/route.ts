import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export async function GET() {
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

  return Response.json({
    propertyCount: propertyCount || 0,
    userCount: userCount || 0,
    savedCount: savedCount || 0,
    recentProperties: recentProperties || [],
  });
}
