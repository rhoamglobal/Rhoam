import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  // Authenticate user via headers (standard for Supabase in Next.js API routes)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: saved } = await supabase
    .from("saved_properties")
    .select("property_id")
    .eq("user_id", user.id);

  const ids = saved?.map((s) => s.property_id) || [];

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .in("id", ids);

  return NextResponse.json(properties || []);
}
