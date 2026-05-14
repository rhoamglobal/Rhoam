import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("properties")
    .select("*");

  if (error) {
    console.error(error);
    return Response.json({ error }, { status: 400 });
  }

  return Response.json(data);
}