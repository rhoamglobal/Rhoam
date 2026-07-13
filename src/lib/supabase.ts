// Browser-side Supabase client.
// Uses @supabase/ssr's createBrowserClient so the auth session is stored in
// cookies (not just localStorage). That's what lets our API routes read the
// logged-in user server-side via src/lib/supabaseServer.ts — without it,
// every route handler would have to blindly trust a userId sent by the client.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
