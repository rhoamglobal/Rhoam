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
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const rooms = searchParams.get("rooms");
  const availableOnly = searchParams.get("availableOnly");
  const amenities = searchParams.get("amenities");

  // Base query (MUST be first)
  // Explicit column allowlist — this is a public, unauthenticated endpoint
  // for map browsing. It must NEVER include landlord/caretaker contact
  // fields, regardless of who's asking. Contact info is only ever
  // attached server-side on the single-property page, and only after
  // confirming that specific user has actually paid to unlock it.
  let query = supabase
    .from("properties")
    .select(
      `
      id, title, price, latitude, longitude, category,
      image_url, images, description, amenities,
      school_tag, location, is_verified, address,
      is_available, is_visible, is_active,
      room_count, occupants_per_room, bathroom_count
    `
    )
    .eq("is_active", true);

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
    const safeSearch = search.replace(/[,()]/g, " ").trim().slice(0, 100);
    if (safeSearch) {
      query = query.or(
        `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`
      );
    }
  }

  // Price filter
  if (minPrice) {
    query = query.gte("price", Number(minPrice));
  }

  if (maxPrice) {
    query = query.lte("price", Number(maxPrice));
  }

  // Rooms filter — "4+" means 4 or more, anything else is an exact match
  if (rooms) {
    if (rooms === "4+") {
      query = query.gte("room_count", 4);
    } else {
      query = query.eq("room_count", Number(rooms));
    }
  }

  // Availability filter
  if (availableOnly === "true") {
    query = query.eq("is_available", true);
  }

  // Amenities filter — property must have ALL selected amenities
  if (amenities) {
    const amenityList = amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    if (amenityList.length) {
      query = query.contains("amenities", amenityList);
    }
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}