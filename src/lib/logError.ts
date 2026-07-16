import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Json } from "@/lib/database.types";

type LogErrorArgs = {
  source: "server" | "client";
  route: string;
  message: string;
  stack?: string | null;
  // Deliberately loose here (not typed as Json) so every call site can
  // pass whatever's convenient — a PostgrestError, a fetch response, raw
  // API payloads — without needing to pre-sanitize it. The actual
  // JSON-safety conversion happens internally, right before the insert,
  // which is also more correct at runtime: it guarantees whatever lands
  // in the database is genuinely valid JSON instead of risking a failed
  // insert on something like an Error instance with circular references.
  context?: Record<string, unknown>;
};

function toJsonSafe(context: Record<string, unknown> | undefined): Json | null {
  if (!context) return null;

  try {
    return JSON.parse(JSON.stringify(context)) as Json;
  } catch {
    return null;
  }
}

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
      context: toJsonSafe(context),
    });
  } catch (err) {
    // Logging the failure to log — console only, nothing left to fall
    // back to.
    console.error("Failed to write to error_logs:", err);
  }
}
