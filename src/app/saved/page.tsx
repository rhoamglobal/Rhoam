"use client";

import { useEffect, useState } from "react";
import PreviewCard from "@/components/map/PreviewCard";
import { getSaved } from "@/lib/saved";

export default function SavedPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const savedIds = getSaved();

      if (savedIds.length === 0) {
        setLoading(false);
        return;
      }

      // ✅ Call YOUR API (same as map)
      const res = await fetch("/api/properties", {
        cache: "no-store",
      });
      const allProperties = await res.json();

      // ✅ Filter only saved ones
      const filtered = allProperties.filter((p: any) =>
        savedIds.includes(p.id)
      );

      setProperties(filtered);
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