import { Property } from "@/components/map/types";
import { supabase } from "./supabaseClient";

export const getSaved = async (): Promise<Property[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const res = await fetch("/api/saved", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) return [];
  return res.json();
};

export const toggleSaved = async (id: string): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const res = await fetch("/api/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ propertyId: id }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.saved;
};
