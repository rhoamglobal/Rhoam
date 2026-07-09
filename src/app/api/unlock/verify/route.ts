import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to verify a payment." },
        { status: 401 }
      );
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { message: "Missing reference" },
        { status: 400 }
      );
    }

    // Extract data from reference: unlock_propertyId_userId_timestamp
    const parts = reference.split("_");
    const propertyId = Number(parts[1]);
    const referenceUserId = parts[2];

    // The reference was generated in /unlock/initiate for a specific user.
    // If it doesn't match whoever is currently logged in, refuse — otherwise
    // someone could take a reference (e.g. one they see in a redirect URL)
    // and use it to unlock a contact for a different account.
    if (referenceUserId !== user.id) {
      return NextResponse.json(
        { message: "This payment reference does not belong to you." },
        { status: 403 }
      );
    }

    // Authenticate with Monnify
    const auth = Buffer.from(
      `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
    ).toString("base64");

    const tokenRes = await fetch(
      "https://sandbox.monnify.com/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.responseBody.accessToken;

    // Verify transaction directly with Monnify — this is still the source
    // of truth for whether money actually changed hands.
    const verifyRes = await fetch(
      `https://sandbox.monnify.com/api/v2/transactions/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const verifyData = await verifyRes.json();
    const payment = verifyData.responseBody;

    if (payment.paymentStatus !== "PAID") {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }

    // Use the service-role client for the actual write — we've already
    // authenticated the caller and confirmed the reference is theirs above.
    const { error } = await supabaseAdmin.from("contact_unlocks").upsert(
      {
        user_id: user.id,
        property_id: propertyId,
        payment_reference: reference,
        payment_method: "monnify",
      },
      {
        onConflict: "user_id,property_id",
      }
    );

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}
