import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import { logError } from "@/lib/logError";

const VALID_ISSUE_TYPES = ["wrong_number", "listing_gone", "other"] as const;
type IssueType = (typeof VALID_ISSUE_TYPES)[number];

export async function POST(req: Request) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to report an issue." },
        { status: 401 }
      );
    }

    const { propertyId, issueType, note } = await req.json();

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json(
        { message: "Missing property." },
        { status: 400 }
      );
    }

    if (!VALID_ISSUE_TYPES.includes(issueType)) {
      return NextResponse.json(
        { message: "Invalid issue type." },
        { status: 400 }
      );
    }

    // Confirm this user actually has an unlock on record for this
    // property before accepting a report — reports are about a paid
    // unlock, not a way to leave feedback on any arbitrary listing.
    // We still don't hard-require a matching row to exist (see the SQL
    // migration's comment on unlock_reference): if this lookup comes up
    // empty for some edge case, we still record the report rather than
    // silently dropping it, since a false negative here is worse than a
    // report that turns out to be unnecessary.
    const { data: unlock } = await supabaseAdmin
      .from("contact_unlocks")
      .select("payment_reference")
      .eq("user_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("unlock_reports").insert({
      user_id: user.id,
      property_id: propertyId,
      unlock_reference: unlock?.payment_reference ?? null,
      issue_type: issueType as IssueType,
      note: typeof note === "string" ? note.slice(0, 1000) : null,
    });

    if (error) {
      await logError({
        source: "server",
        route: "/api/unlock-reports",
        message: `Failed to write unlock report: ${error.message}`,
        context: { userId: user.id, propertyId, issueType },
      });

      return NextResponse.json(
        { message: "Couldn't submit your report. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/unlock-reports",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong submitting your report." },
      { status: 500 }
    );
  }
}
