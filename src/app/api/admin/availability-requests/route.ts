import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser, isAdminUser } from "@/lib/supabaseServer";
import { logError } from "@/lib/logError";

// Backs /admin/availability-requests. Since the availability-ping route
// now notifies you by email instead of auto-messaging the caretaker (see
// src/app/api/availability-ping/route.ts), this is the durable, always-
// checkable version of that same information — useful if you missed the
// email, or want to see everything outstanding at a glance.

// database.types.ts has an empty Relationships array on every table (see
// the comment at its top) — supabase-js needs that array populated to
// auto-type a nested join like `properties (...)` inside .select(), so
// without it the joined shape resolves to `never`. Same known gap that
// profile/unlocked/page.tsx already works around on the frontend; this is
// the same workaround applied server-side: an explicit type for what the
// query actually returns, cast through `unknown` since TypeScript won't
// let us cast directly from the inferred `never` shape.
type PendingPingRow = {
  id: number;
  created_at: string;
  property_id: string;
  properties:
    | {
        id: string;
        title: string;
        caretaker_name: string | null;
        caretaker_phone: string | null;
        caretaker_whatsapp: string | null;
        caretaker_status_token: string | null;
      }[]
    | {
        id: string;
        title: string;
        caretaker_name: string | null;
        caretaker_phone: string | null;
        caretaker_whatsapp: string | null;
        caretaker_status_token: string | null;
      }
    | null;
};

export async function GET() {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user || !(await isAdminUser(user.id))) {
      return NextResponse.json(
        { message: "Not authorized." },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("availability_pings")
      .select(
        `
        id,
        created_at,
        property_id,
        properties (
          id,
          title,
          caretaker_name,
          caretaker_phone,
          caretaker_whatsapp,
          caretaker_status_token
        )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      await logError({
        source: "server",
        route: "/api/admin/availability-requests",
        message: `Failed to load pending requests: ${error.message}`,
      });

      return NextResponse.json(
        { message: "Couldn't load pending requests." },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

    const pings = (data || []) as unknown as PendingPingRow[];

    const requests = pings.map((ping) => {
      const property = Array.isArray(ping.properties)
        ? ping.properties[0]
        : ping.properties;

      return {
        id: ping.id,
        createdAt: ping.created_at,
        propertyId: ping.property_id,
        propertyTitle: property?.title ?? "(deleted listing)",
        caretakerName: property?.caretaker_name ?? null,
        caretakerPhone: property?.caretaker_phone ?? null,
        caretakerWhatsapp: property?.caretaker_whatsapp ?? null,
        statusUrl: property?.caretaker_status_token
          ? `${baseUrl}/caretaker/${property.caretaker_status_token}`
          : null,
      };
    });

    return NextResponse.json({ requests });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/admin/availability-requests",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}