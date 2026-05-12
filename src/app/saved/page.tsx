"use client";

import { useEffect, useState } from "react";
import PreviewCard from "@/components/map/PreviewCard";
import { Property } from "@/components/map/types";
import { supabase } from "@/lib/supabaseClient";

export default function SavedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/saved?userId=${user.id}`);
      const data = await res.json();

      setProperties(data);
      setLoading(false);
    };

    fetchSaved();
  }, []);

  if (loading) return <p className="p-6">Loading saved properties...</p>;

  if (properties.length === 0)
    return <p className="p-6">You have no saved properties yet ❤️</p>;

  return (
    <div className="p-4 space-y-4">
      {properties.map((property) => (
        <PreviewCard key={property.id} property={property} />
      ))}
    </div>
  );
}