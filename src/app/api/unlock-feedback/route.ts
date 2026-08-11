import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import { logError } from "@/lib/logError";

const VALID_RESPONSES = [
  "found_place",
  "still_looking",
  "no_response",
  "listing_wrong",
] as const;

export async function POST(req: Request) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { propertyId, response } = await req.json();

    if (!propertyId || !VALID_RESPONSES.includes(response)) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("unlock_feedback").upsert(
      {
        user_id: user.id,
        property_id: propertyId,
        response,
      },
      { onConflict: "user_id,property_id" }
    );

    if (error) {
      await logError({
        source: "server",
        route: "/api/unlock-feedback",
        message: `Failed to save unlock feedback: ${error.message}`,
        context: { userId: user.id, propertyId },
      });

      return NextResponse.json(
        { message: "Couldn't save that. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/unlock-feedback",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
