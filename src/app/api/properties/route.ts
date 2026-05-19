import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

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