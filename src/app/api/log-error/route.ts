import { NextResponse } from "next/server";
import { logError } from "@/lib/logError";

export async function POST(req: Request) {
  try {
    const { message, stack, route, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { message: "Missing error message" },
        { status: 400 }
      );
    }

    // Truncate defensively — this endpoint takes input from any visitor's
    // browser, logged in or not, so keep stored payloads bounded.
    await logError({
      source: "client",
      route: typeof route === "string" ? route.slice(0, 200) : "unknown",
      message: String(message).slice(0, 2000),
      stack: typeof stack === "string" ? stack.slice(0, 4000) : null,
      context:
        context && typeof context === "object"
          ? context
          : undefined,
    });

    return NextResponse.json({ logged: true });
  } catch {
    // Logging must never itself throw back at a broken page.
    return NextResponse.json({ logged: false });
  }
}
