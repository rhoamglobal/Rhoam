import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { message: "Missing reference" },
        { status: 400 }
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

    // Verify transaction
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

    // Extract data from reference
    // unlock_propertyId_userId_timestamp
    const parts = reference.split("_");

    const propertyId = Number(parts[1]);
    const userId = parts[2];

    // Upsert unlock
    const { error } = await supabase.from("contact_unlocks").upsert(
      {
        user_id: userId,
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