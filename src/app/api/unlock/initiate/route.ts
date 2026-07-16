import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { UNLOCK_FEE_NGN } from "@/lib/config";
import { logError } from "@/lib/logError";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Rate limit BEFORE auth — an unauthenticated flood shouldn't even
    // reach the session check.
    const ip = getClientIp(req);
    const limit = rateLimit(`unlock-initiate:${ip}`, 10, 10 * 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    // Who is actually logged in — never trust a userId from the request body.
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to unlock a contact." },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { message: "Your account has no email on file." },
        { status: 400 }
      );
    }

    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Confirm the property actually exists and is still active BEFORE
    // charging anyone for it. Without this, a property that's been
    // deleted or deactivated between when someone viewed it and when
    // they pay would still let them pay — the money goes through, but
    // the unlock write fails afterwards (foreign key violation), and
    // there's no way back for that student except contacting support.
    const { data: property, error: propertyError } = await supabaseAdmin
      .from("properties")
      .select("id, title, is_active")
      .eq("id", propertyId)
      .maybeSingle();

    if (propertyError || !property) {
      return NextResponse.json(
        { message: "This property no longer exists." },
        { status: 404 }
      );
    }

    if (!property.is_active) {
      return NextResponse.json(
        {
          message:
            "This property is no longer available and can't be unlocked.",
        },
        { status: 400 }
      );
    }

    // Don't charge someone again for a contact they've already paid to
    // unlock — send them straight to the existing unlock instead.
    const { data: existingUnlock } = await supabaseAdmin
      .from("contact_unlocks")
      .select("id")
      .eq("user_id", userId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (existingUnlock) {
      return NextResponse.json(
        { message: "You've already unlocked this contact." },
        { status: 409 }
      );
    }

    // Fixed server-side price. The client can no longer set this itself.
    // Paystack takes amounts in kobo, hence the * 100.
    const amountKobo = UNLOCK_FEE_NGN * 100;

    // Same reference format the verify route and webhook parse:
    // unlock_propertyId_userId_timestamp
    const paymentReference = `unlock_${propertyId}_${userId}_${Date.now()}`;

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: amountKobo,
          reference: paymentReference,
          currency: "NGN",
          // Paystack appends ?reference=...&trxref=... to whatever URL
          // you give it, so this doesn't need a query string of our own.
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
          metadata: {
            propertyId,
            propertyTitle: property.title,
            userId,
            purpose: "contact_unlock",
          },
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      await logError({
        source: "server",
        route: "/api/unlock/initiate",
        message: "Paystack initialize failed",
        context: {
          userId,
          propertyId,
          status: paystackRes.status,
          paystackResponse: paystackData,
        },
      });

      return NextResponse.json(
        { message: paystackData.message || "Payment initialization failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentUrl: paystackData.data.authorization_url,
    });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/unlock/initiate",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
