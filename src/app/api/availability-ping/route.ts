import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import { sendAdminAvailabilityPingNotice } from "@/lib/mailer";
import { logError } from "@/lib/logError";

const RATE_LIMIT_MS = 60 * 60 * 1000; // one ping per property per hour

export async function POST(req: Request) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to do this." },
        { status: 401 }
      );
    }

    const { propertyId } = await req.json();

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json(
        { message: "Missing property." },
        { status: 400 }
      );
    }

    const { data: property, error: propertyError } = await supabaseAdmin
      .from("properties")
      .select(
        "id, title, caretaker_name, caretaker_phone, caretaker_whatsapp, caretaker_status_token"
      )
      .eq("id", propertyId)
      .maybeSingle();

    if (propertyError || !property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    if (!property.caretaker_status_token) {
      // Nothing we can do here — no contact on file to ping. Not the
      // student's fault, so this isn't really a 4xx/5xx in spirit, but
      // the caller still needs to know it can't proceed.
      return NextResponse.json(
        { message: "This listing doesn't have a way to confirm availability yet." },
        { status: 422 }
      );
    }

    // Rate limit: skip sending (and don't create a duplicate pending
    // row) if a ping went out for this property within the last hour —
    // protects the caretaker from being paged repeatedly if several
    // students check the same listing back to back.
    const { data: recentPing } = await supabaseAdmin
      .from("availability_pings")
      .select("id, created_at")
      .eq("property_id", propertyId)
      .gte(
        "created_at",
        new Date(Date.now() - RATE_LIMIT_MS).toISOString()
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentPing) {
      return NextResponse.json({
        success: true,
        alreadyPinged: true,
        message: "Already asked recently — waiting on a response.",
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from("availability_pings")
      .insert({
        property_id: propertyId,
        requested_by_user_id: user.id,
        status: "pending",
      });

    if (insertError) {
      await logError({
        source: "server",
        route: "/api/availability-ping",
        message: `Failed to log ping: ${insertError.message}`,
        context: { propertyId },
      });
      // Non-fatal for the email send below — logging the ping is for
      // our own reliability dataset, not something the caretaker or
      // student needs to know failed.
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const statusUrl = `${baseUrl}/caretaker/${property.caretaker_status_token}`;

    // Routes through you rather than auto-messaging the caretaker: you
    // reach out personally (your own WhatsApp, free, no Meta Business
    // setup) and either forward this same statusUrl so the caretaker can
    // self-confirm with one tap, or resolve it manually from
    // /admin/availability-requests once they reply to you in words.
    try {
      await sendAdminAvailabilityPingNotice({
        propertyId,
        propertyTitle: property.title,
        statusUrl,
        caretakerName: property.caretaker_name,
        caretakerPhone: property.caretaker_phone,
        caretakerWhatsapp: property.caretaker_whatsapp,
      });
    } catch (notifyError) {
      await logError({
        source: "server",
        route: "/api/availability-ping",
        message: `Failed to notify admin of ping: ${
          notifyError instanceof Error ? notifyError.message : String(notifyError)
        }`,
        context: { propertyId },
      });
      // Not fatal to the student's request — the pending row is already
      // saved, and it'll still show up in /admin/availability-requests
      // even if this particular notification email failed to send.
    }

    return NextResponse.json({ success: true, alreadyPinged: false });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/availability-ping",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
