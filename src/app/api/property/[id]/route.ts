import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ unwrap the params Promise (Next 15 requirement)
  const { id } = await context.params;



  if (!id) {
    return NextResponse.json(
      { error: "Property ID is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}