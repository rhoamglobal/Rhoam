import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import { UNLOCK_FEE_NGN } from "@/lib/config";
import { logError } from "@/lib/logError";

export async function POST(req: Request) {
  try {
    const { user } = await getAuthenticatedUser();

    if (!user) {
      console.log("Verify called with no authenticated session");

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
    // propertyId is a UUID (properties.id), not a number — do NOT wrap
    // this in Number(), which would silently turn it into NaN and make
    // the upsert below fail every time.
    const parts = reference.split("_");
    const propertyId = parts[1];
    const referenceUserId = parts[2];

    // The reference was generated in /unlock/initiate for a specific user.
    // If it doesn't match whoever is currently logged in, refuse — otherwise
    // someone could take a reference (e.g. one they see in a redirect URL)
    // and use it to unlock a contact for a different account.
    if (referenceUserId !== user.id) {
      console.log(
        "Reference user mismatch:",
        referenceUserId,
        "vs logged in",
        user.id
      );

      return NextResponse.json(
        { message: "This payment reference does not belong to you." },
        { status: 403 }
      );
    }

    // Verify directly with Paystack — this is still the source of truth
    // for whether money actually changed hands, regardless of what the
    // client claims.
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();
    const payment = verifyData.data;

    if (!verifyRes.ok || !payment || payment.status !== "success") {
      await logError({
        source: "server",
        route: "/api/unlock/verify",
        message: "Paystack verify failed",
        context: {
          userId: user.id,
          reference,
          status: verifyRes.status,
          paystackResponse: verifyData,
        },
      });

      return NextResponse.json(
        {
          message:
            verifyData?.message ||
            "Payment not completed",
        },
        { status: 400 }
      );
    }

    // Belt-and-braces: confirm the amount actually charged matches the
    // fixed unlock fee, not just that *some* payment on this reference
    // succeeded.
    if (payment.amount !== UNLOCK_FEE_NGN * 100) {
      await logError({
        source: "server",
        route: "/api/unlock/verify",
        message: "Payment amount mismatch",
        context: {
          userId: user.id,
          reference,
          received: payment.amount,
          expected: UNLOCK_FEE_NGN * 100,
        },
      });

      return NextResponse.json(
        { message: "Payment amount mismatch" },
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
        payment_method: "paystack",
      },
      {
        onConflict: "user_id,property_id",
      }
    );

    if (error) {
      // This is the worst-case scenario: Paystack confirms the money was
      // actually taken, but the database write recording the unlock
      // failed. The student paid and got nothing. This absolutely has
      // to be visible somewhere, not just swallowed into a generic
      // error response.
      await logError({
        source: "server",
        route: "/api/unlock/verify",
        message: `Unlock write failed AFTER successful payment: ${error.message}`,
        context: {
          userId: user.id,
          propertyId,
          reference,
          dbError: error,
        },
      });

      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/unlock/verify",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}
