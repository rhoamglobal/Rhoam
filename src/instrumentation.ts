// Runs once when the server starts (Next.js's instrumentation hook), not
// on every request. This is deliberately a loud console.error rather than
// a thrown exception — throwing here would take down the entire app on
// every route for a single missing variable, which is worse than a very
// visible warning in the logs. The goal is "impossible to miss," not
// "impossible to deploy."
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PAYSTACK_SECRET_KEY",
    "NEXT_PUBLIC_BASE_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      "\n" +
        "🔴 MISSING ENVIRONMENT VARIABLES 🔴\n" +
        `The following required env vars are not set: ${missing.join(", ")}\n` +
        "The app will still start, but anything depending on these will fail " +
        "unexpectedly. Set them in Vercel under Project Settings → " +
        "Environment Variables, or in .env.local for local development.\n"
    );
  }
}
