"use client";

import { useEffect, useState } from "react";
import PreviewCard from "@/components/map/PreviewCard";
import { getSaved } from "@/lib/saved";
import { Property } from "@/components/map/types";
import SavedPropertyCard from "@/components/cards/SavedPropertyCard";

export const dynamic = "force-dynamic";

export default function SavedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
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
      const filtered = allProperties.filter((p: Property) =>
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
    <div className="min-h-screen bg-white px-6 py-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Saved homes
        </h1>
        <p className="text-sm text-gray-500">
          Your favourite properties
        </p>
      </div>
  
      {/* EMPTY STATE */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-3">🤍</div>
          <h2 className="text-lg font-medium">No saved homes yet</h2>
          <p className="text-gray-500 text-sm mt-1">
            Start exploring and save properties you like
          </p>
        </div>
      )}
  
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <SavedPropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>
    </div>
  );
}