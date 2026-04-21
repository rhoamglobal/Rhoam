import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


//"https://paxmlrahjmcozhyixpjd.supabase.co/rest/v1/",
 // "sb_publishable_0QTxYVzmhGg74EnenvhsLA_0meegU_-"