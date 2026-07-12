import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { UNLOCK_FEE_NGN } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature — this is a trusted server-to-server call
    // from Paystack, confirmed by HMAC, not a user session.
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);

    if (body.event !== "charge.success") {
      return NextResponse.json({ message: "Event ignored" });
    }

    const data = body.data;

    if (data.status !== "success") {
      return NextResponse.json({
        message: "Payment not completed",
      });
    }

    if (data.amount !== UNLOCK_FEE_NGN * 100) {
      console.log("Webhook amount mismatch", data.reference, data.amount);
      return NextResponse.json(
        { message: "Amount mismatch" },
        { status: 400 }
      );
    }

    const paymentReference = data.reference as string;

    // format:
    // unlock_propertyId_userId_timestamp
    // propertyId is a UUID — do not Number() it.
    const parts = paymentReference.split("_");

    const propertyId = parts[1];
    const userId = parts[2];

    const { error } = await supabase.from("contact_unlocks").upsert(
      {
        user_id: userId,
        property_id: propertyId,
        payment_reference: paymentReference,
        payment_method: "paystack",
      },
      {
        onConflict: "user_id,property_id",
      }
    );

    if (error) {
      console.log(error);
    }

    return NextResponse.json({
      message: "Unlock successful",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Webhook failed" },
      { status: 500 }
    );
  }
}
