import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("monnify-signature");

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.MONNIFY_SECRET_KEY!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);

    const eventData = body.eventData;

    if (eventData.paymentStatus !== "PAID") {
      return NextResponse.json({
        message: "Payment not completed",
      });
    }

    const paymentReference = eventData.paymentReference;

    // format:
    // unlock_propertyId_userId_timestamp
    const parts = paymentReference.split("_");

    const propertyId = Number(parts[1]);
    const userId = parts[2];

    const { error } = await supabase.from("contact_unlocks").upsert(
      {
        user_id: userId,
        property_id: propertyId,
        payment_reference: paymentReference,
        payment_method: "monnify",
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