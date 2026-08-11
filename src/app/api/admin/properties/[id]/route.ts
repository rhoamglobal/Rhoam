import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser, isAdminUser } from "@/lib/supabaseServer";
import { logError } from "@/lib/logError";
import type { Database } from "@/lib/database.types";

type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

// Contact columns (landlord_phone, caretaker_phone, etc.) can no longer be
// read or written via the anon/authenticated Postgres role — see
// supabase-restrict-contact-columns.sql. The admin edit page used to query
// `properties` directly from the browser and relied on RLS alone to gate
// admin access; that only ever protected rows, not columns. This route is
// now the only way the admin edit page can read or write those fields —
// service-role client, admin check done explicitly below.

export async function GET(
  _req: Request,
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

    const { data, error } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ property: data });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/admin/properties/[id]",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

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
    const updates = await req.json();

    // Explicit allowlist rather than passing the body straight through —
    // this route runs with the service-role client, so an unlisted field
    // (id, created_at, caretaker_status_token, etc.) sneaking into the
    // request body must not silently get written just because JS lets you
    // spread an object. caretaker_status_token in particular must only
    // ever be set by the rotation migration / caretaker flow, never by an
    // admin edit form.
    const ALLOWED_FIELDS = [
      "title",
      "description",
      "address",
      "price",
      "category",
      "school_tag",
      "location",
      "image_url",
      "images",
      "room_count",
      "occupants_per_room",
      "multiple_units_available",
      "amenities",
      "landlord_phone",
      "landlord_whatsapp",
      "caretaker_name",
      "caretaker_phone",
      "caretaker_whatsapp",
    ] as const;

    const payload: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in updates) {
        payload[field] = updates[field];
      }
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("properties")
      .update(payload as PropertyUpdate)
      .eq("id", id);

    if (error) {
      await logError({
        source: "server",
        route: "/api/admin/properties/[id]",
        message: `Failed to update property: ${error.message}`,
        context: { propertyId: id, userId: user.id },
      });

      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/admin/properties/[id]",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}