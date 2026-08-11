import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser, isAdminUser } from "@/lib/supabaseServer";
import { logError } from "@/lib/logError";
import type { Database } from "@/lib/database.types";

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];

// Same reasoning as /api/admin/properties/[id]: contact columns are no
// longer insertable via the anon/authenticated role (see
// supabase-restrict-contact-columns.sql), so property creation — which
// includes landlord/caretaker contact fields from the very first save —
// has to go through the service-role client with an explicit admin check.

export async function POST(req: Request) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user || !(await isAdminUser(user.id))) {
      return NextResponse.json(
        { message: "Not authorized." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const REQUIRED_FIELDS = [
      "title",
      "description",
      "address",
      "category",
      "school_tag",
      "location",
      "price",
      "latitude",
      "longitude",
      "image_url",
    ] as const;

    for (const field of REQUIRED_FIELDS) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const ALLOWED_FIELDS = [
      ...REQUIRED_FIELDS,
      "room_count",
      "occupants_per_room",
      "multiple_units_available",
      "amenities",
      "images",
      "landlord_phone",
      "landlord_whatsapp",
      "caretaker_name",
      "caretaker_phone",
      "caretaker_whatsapp",
    ] as const;

    const payload: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        payload[field] = body[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from("properties")
      .insert([payload as PropertyInsert])
      .select("id")
      .single();

    if (error) {
      await logError({
        source: "server",
        route: "/api/admin/properties",
        message: `Failed to create property: ${error.message}`,
        context: { userId: user.id },
      });

      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/admin/properties",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}