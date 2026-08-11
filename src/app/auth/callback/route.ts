import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logError } from "@/lib/logError";

// Lands here after Google/Apple OAuth (and after email-link password
// recovery, which also uses a code-exchange redirect). Mirrors the
// manual signup flow's profile upsert (src/app/signup/page.tsx) so an
// OAuth account ends up with the same `profiles` row a manual signup
// gets — nothing downstream (saved count, unlock count) should have to
// know or care which path the user came in through.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    await logError({
      source: "server",
      route: "/auth/callback",
      message: error?.message || "exchangeCodeForSession returned no user",
    });

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Couldn't complete sign-in. Please try again."
      )}`
    );
  }

  // Upsert rather than insert: this route also runs for existing users
  // signing back in via OAuth, not just first-time sign-ups, so this
  // must be safe to run on every login, not just the first one.
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: data.user.id,
    email: data.user.email ?? null,
  });

  if (profileError) {
    // Non-fatal: the user is genuinely authenticated at this point even
    // if this write failed, so don't block them — just make sure this
    // is visible somewhere instead of silently swallowed, matching the
    // same profileError handling gap fixed in the manual signup flow.
    await logError({
      source: "server",
      route: "/auth/callback",
      message: `Profile upsert failed after OAuth sign-in: ${profileError.message}`,
      context: { userId: data.user.id },
    });
  }

  const safeRedirect =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : "/";

  return NextResponse.redirect(`${origin}${safeRedirect}`);
}
