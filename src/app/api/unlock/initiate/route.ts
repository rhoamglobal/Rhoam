import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, propertyId, amount } = await req.json();

    if (!userId || !propertyId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

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
          customerName: "Property User",
          customerEmail: `${userId}@rentedville.com`,
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