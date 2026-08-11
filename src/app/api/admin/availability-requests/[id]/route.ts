import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser, isAdminUser } from "@/lib/supabaseServer";
import { logError } from "@/lib/logError";

// Manual counterpart to /api/caretaker/[token] POST — same real-world
// event (a caretaker confirming availability), just triggered by you
// after they reply to your personal WhatsApp message in words, instead
// of them tapping the confirmation link themselves. Same effect on the
// property: is_available + last_confirmed_at get updated, and every
// pending ping for that property gets closed out, not just this one —
// they're all the same answer at the same moment.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user || !(await isAdminUser(user.id))) {
      return NextResponse.json(
        { message: "Not authorized." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { isAvailable } = await req.json();

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { message: "Missing status." },
        { status: 400 }
      );
    }

    const pingId = Number(id);

    if (!Number.isFinite(pingId)) {
      return NextResponse.json(
        { message: "Invalid request id." },
        { status: 400 }
      );
    }

    const { data: ping, error: findError } = await supabaseAdmin
      .from("availability_pings")
      .select("id, property_id")
      .eq("id", pingId)
      .maybeSingle();

    if (findError || !ping) {
      return NextResponse.json(
        { message: "Request not found." },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const { error: propertyError } = await supabaseAdmin
      .from("properties")
      .update({ is_available: isAvailable, last_confirmed_at: now })
      .eq("id", ping.property_id);

    if (propertyError) {
      await logError({
        source: "server",
        route: "/api/admin/availability-requests/[id]",
        message: `Failed to update property: ${propertyError.message}`,
        context: { propertyId: ping.property_id },
      });

      return NextResponse.json(
        { message: "Couldn't save that update." },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("availability_pings")
      .update({
        status: isAvailable ? "confirmed_available" : "confirmed_taken",
        responded_at: now,
      })
      .eq("property_id", ping.property_id)
      .eq("status", "pending");

    return NextResponse.json({ success: true });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/admin/availability-requests/[id]",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
