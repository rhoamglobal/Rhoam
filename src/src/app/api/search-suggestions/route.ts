import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q) return NextResponse.json([]);

  const { data } = await supabaseAdmin
    .from("properties")
    .select("*")
    .or(
      `title.ilike.%${q}%,category.ilike.%${q}%,location.ilike.%${q}%,school_tag.ilike.%${q}%`
    )
    .limit(5);

  return NextResponse.json(data || []);
}