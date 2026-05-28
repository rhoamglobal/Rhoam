import { supabase } from "@/lib/supabase";

export async function isSaved(
  userId: string,
  propertyId: number
) {
  const { data } = await supabase
    .from("saved_properties")
    .select("*")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .single();

  return !!data;
}

export async function toggleSaved(
  userId: string,
  propertyId: number
) {
  const alreadySaved = await isSaved(userId, propertyId);

  if (alreadySaved) {
    await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    return false;
  }

  await supabase.from("saved_properties").insert({
    user_id: userId,
    property_id: propertyId,
  });

  return true;
}