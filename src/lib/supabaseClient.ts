// Kept only so existing imports of "@/lib/supabaseClient" keep working.
// This used to be a duplicate client definition — now it's just an alias
// for the single browser client in "@/lib/supabase". Prefer importing
// from "@/lib/supabase" in new code.
export { supabase } from "./supabase";
