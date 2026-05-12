import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("properties")
    .select("*");

  if (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(data);
}
