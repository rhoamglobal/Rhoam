import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabaseServer";
import { UNLOCK_FEE_NGN } from "@/lib/config";

export async function POST(req: Request) {
  try {
    // Who is actually logged in — never trust a userId from the request body.
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in to unlock a contact." },
        { status: 401 }
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
    // Fixed server-side price. The client can no longer set this itself.
    const amount = UNLOCK_FEE_NGN;

    // STEP 1: Authenticate with Monnify
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

    // STEP 2: Generate payment reference
    const paymentReference = `unlock_${propertyId}_${userId}_${Date.now()}`;

    // STEP 3: Initialize payment
    const paymentRes = await fetch(
      "https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          customerName: user.user_metadata?.full_name || "Property User",
          customerEmail: user.email,
          paymentReference,
          paymentDescription: "Property contact unlock",
          currencyCode: "NGN",
          contractCode: process.env.MONNIFY_CONTRACT_CODE,
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?reference=${paymentReference}`,
          paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
        }),
      }
    );

    const paymentData = await paymentRes.json();

    return NextResponse.json({
      paymentUrl: paymentData.responseBody.checkoutUrl,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
