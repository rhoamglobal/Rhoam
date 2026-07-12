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
            userId,
            purpose: "contact_unlock",
          },
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.log(paystackData);
      return NextResponse.json(
        { message: paystackData.message || "Payment initialization failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentUrl: paystackData.data.authorization_url,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
