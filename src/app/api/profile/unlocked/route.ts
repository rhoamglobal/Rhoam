import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import { logError } from "@/lib/logError";

// Contact fields (landlord_phone, caretaker_phone, etc.) are no longer
// readable via the anon/authenticated Postgres role at all — see
// supabase-restrict-contact-columns.sql. This route is now the ONLY way
// the "unlocked contacts" page can get that data: it uses the service-role
// client, and only after confirming a contact_unlocks row actually exists
// for this specific user, mirroring the check in /property/[id]/page.tsx.
export async function GET() {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("contact_unlocks")
      .select(
        `
        id,
        property_id,
        properties (
          id,
          title,
          price,
          image_url,
          images,
          landlord_phone,
          landlord_whatsapp,
          caretaker_name,
          caretaker_phone,
          caretaker_whatsapp,
          school_tag,
          location
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      await logError({
        source: "server",
        route: "/api/profile/unlocked",
        message: `Failed to load unlocked properties: ${error.message}`,
        context: { userId: user.id },
      });

      return NextResponse.json(
        { message: "Couldn't load your unlocked properties." },
        { status: 500 }
      );
    }

    return NextResponse.json({ properties: data || [] });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/profile/unlocked",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
