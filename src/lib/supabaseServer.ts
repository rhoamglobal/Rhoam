// Server-side Supabase helpers for API routes / server components.
//
// This reads the actual logged-in user from the request's Supabase auth
// cookie (set by the browser client in "@/lib/supabase"). Route handlers
// should use `getAuthenticatedUser()` instead of trusting a `userId` field
// sent in the request body/query string — a client can put anything it
// wants in a fetch body, but it can't forge someone else's session cookie.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

/**
 * Creates a Supabase client bound to the current request's cookies.
 * Use this inside Route Handlers and Server Components.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a context where cookies can't be set (e.g. a Server
          // Component render). Safe to ignore as long as middleware.ts is
          // refreshing the session, which it is in this project.
        }
      },
    },
  });
}

/**
 * Returns the authenticated user for the current request, or `null` if
 * nobody is logged in / the session is invalid. Never trust a `userId`
 * passed in from the client instead of this.
 */
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase };
  }

  return { user, supabase };
}

/**
 * Checks the `admins` table (via the service-role client, since RLS may
 * otherwise block reading it) for the given user id.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return !error && !!data;
}
