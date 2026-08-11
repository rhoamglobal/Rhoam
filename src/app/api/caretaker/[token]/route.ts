import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logError } from "@/lib/logError";

// No auth here by design — this is a magic-link flow (same family of
// pattern as a Calendly reschedule link or a DoorDash driver link), not
// a login. The token itself is the credential. Never expose more than
// the minimum the caretaker needs to confirm status.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data: property, error } = await supabaseAdmin
    .from("properties")
    .select("id, title, is_available, last_confirmed_at")
    .eq("caretaker_status_token", token)
    .maybeSingle();

  if (error || !property) {
    return NextResponse.json({ message: "Link not found." }, { status: 404 });
  }

  return NextResponse.json({ property });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { isAvailable } = await req.json();

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { message: "Missing status." },
        { status: 400 }
      );
    }

    const { data: property, error: findError } = await supabaseAdmin
      .from("properties")
      .select("id")
      .eq("caretaker_status_token", token)
      .maybeSingle();

    if (findError || !property) {
      return NextResponse.json(
        { message: "Link not found." },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("properties")
      .update({ is_available: isAvailable, last_confirmed_at: now })
      .eq("id", property.id);

    if (updateError) {
      await logError({
        source: "server",
        route: "/api/caretaker/[token]",
        message: `Failed to update availability: ${updateError.message}`,
        context: { propertyId: property.id },
      });

      return NextResponse.json(
        { message: "Couldn't save your update. Please try again." },
        { status: 500 }
      );
    }

    // Close out the most recent pending ping for this property, if any
    // — this is what turns a one-shot "ask if still available" request
    // into a logged, timed response rather than just a silent DB write.
    // Not finding one is fine: this route also runs for spontaneous
    // caretaker-initiated updates with no ping behind them at all.
    await supabaseAdmin
      .from("availability_pings")
      .update({
        status: isAvailable ? "confirmed_available" : "confirmed_taken",
        responded_at: now,
      })
      .eq("property_id", property.id)
      .eq("status", "pending");

    return NextResponse.json({ success: true });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/caretaker/[token]",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
