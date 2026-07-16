import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  // Generous — the frontend already debounces at 300ms, so someone
  // typing continuously for a while can still hit this a lot. This is
  // sized to stop a scraping script, not a fast typist.
  const limit = rateLimit(`search:${ip}`, 40, 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json([], { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q");

  if (!q) return NextResponse.json([]);

  // `q` gets interpolated straight into a PostgREST `.or()` filter string
  // below, where commas separate conditions and parentheses group them.
  // Without stripping those out, a search term containing them could
  // change the shape of the filter instead of just being searched for.
  const safeQ = q.replace(/[,()]/g, " ").trim().slice(0, 100);

  if (!safeQ) return NextResponse.json([]);

  const { data } = await supabaseAdmin
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
    .eq("is_active", true)
    .or(
      `title.ilike.%${safeQ}%,category.ilike.%${safeQ}%,location.ilike.%${safeQ}%,school_tag.ilike.%${safeQ}%`
    )
    .limit(5);

  return NextResponse.json(data || []);
}