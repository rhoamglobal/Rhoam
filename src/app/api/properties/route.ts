import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase.from("properties").select("*");

  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  return Response.json(data);
}