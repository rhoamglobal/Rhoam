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
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/saved", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
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
