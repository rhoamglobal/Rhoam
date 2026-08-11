import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";

const ELIGIBLE_AFTER_DAYS = 3;

// Returns at most one property to ask about — the oldest unlock old
// enough to have had a real chance to work out, that doesn't already
// have a response recorded. One shot per visit, not a growing queue the
// person has to clear.
export async function GET() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ pending: null });
  }

  const cutoff = new Date(
    Date.now() - ELIGIBLE_AFTER_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: unlocks } = await supabaseAdmin
    .from("contact_unlocks")
    .select("property_id, created_at")
    .eq("user_id", user.id)
    .lte("created_at", cutoff)
    .order("created_at", { ascending: true });

  if (!unlocks || unlocks.length === 0) {
    return NextResponse.json({ pending: null });
  }

  const { data: existingFeedback } = await supabaseAdmin
    .from("unlock_feedback")
    .select("property_id")
    .eq("user_id", user.id);

  const alreadyAnswered = new Set(
    (existingFeedback || []).map((f) => f.property_id)
  );

  const next = unlocks.find((u) => !alreadyAnswered.has(u.property_id));

  if (!next) {
    return NextResponse.json({ pending: null });
  }

  const { data: property } = await supabaseAdmin
    .from("properties")
    .select("id, title")
    .eq("id", next.property_id)
    .maybeSingle();

  if (!property) {
    return NextResponse.json({ pending: null });
  }

  return NextResponse.json({
    pending: { propertyId: property.id, propertyTitle: property.title },
  });
}
