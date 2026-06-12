import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const north = searchParams.get("north");
  const south = searchParams.get("south");
  const east = searchParams.get("east");
  const west = searchParams.get("west");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const maxPrice = searchParams.get("maxPrice");


  // Base query (MUST be first)
  let query = supabase.from("properties").select("*");

  // Map bounds filter (only apply if all exist)
  if (north && south && east && west) {
    query = query
      .gte("latitude", Number(south))
      .lte("latitude", Number(north))
      .gte("longitude", Number(west))
      .lte("longitude", Number(east));
  }

  // Category filter
  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  // Search filter (title + description)
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  // Price filter (FIXED — now safe)
  if (maxPrice) {
    query = query.lte("price", Number(maxPrice));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}