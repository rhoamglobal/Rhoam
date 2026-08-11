import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidEmail } from "@/lib/auth_utils";
import { logError } from "@/lib/logError";

// Deliberately no auth required — someone hitting the cold-start empty
// state may not have an account yet, and shouldn't need one just to
// register interest in their school being added.
export async function POST(req: Request) {
  try {
    const { email, context } = await req.json();

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("waitlist_signups").insert({
      email: email.trim().toLowerCase(),
      context: typeof context === "string" ? context.slice(0, 200) : null,
    });

    if (error) {
      await logError({
        source: "server",
        route: "/api/waitlist",
        message: `Failed to save waitlist signup: ${error.message}`,
      });

      return NextResponse.json(
        { message: "Couldn't save that. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logError({
      source: "server",
      route: "/api/waitlist",
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
