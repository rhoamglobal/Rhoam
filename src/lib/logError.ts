import { supabaseAdmin } from "@/lib/supabaseAdmin";

type LogErrorArgs = {
  source: "server" | "client";
  route: string;
  message: string;
  stack?: string | null;
  context?: Record<string, unknown>;
};

/**
 * Logs an error to the error_logs table so it shows up in
 * /admin/errors instead of only existing in Vercel's function logs
 * (which nobody checks proactively).
 *
 * Deliberately fire-and-forget: logging a failure should never itself
 * throw or block the response the user is waiting on. Always also
 * console.error's, so Vercel's own logs remain a fallback if the
 * database write itself fails (e.g. Supabase is down).
 */
export async function logError({
  source,
  route,
  message,
  stack,
  context,
}: LogErrorArgs) {
  console.error(`[${source}] ${route}:`, message, context || "");

  try {
    await supabaseAdmin.from("error_logs").insert({
      source,
      route,
      message,
      stack: stack || null,
      context: context || null,
    });
  } catch (err) {
    // Logging the failure to log — console only, nothing left to fall
    // back to.
    console.error("Failed to write to error_logs:", err);
  }
}
