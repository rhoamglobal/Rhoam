"use client";

import { useEffect, useState } from "react";
import PreviewCard from "@/components/map/PreviewCard";
import { getSaved } from "@/lib/saved";
import { Heart } from "lucide-react";

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

      try {
        const res = await fetch("/api/properties", {
          cache: "no-store",
        });
        const allProperties = await res.json();
        const filtered = allProperties.filter((p: any) =>
          savedIds.includes(p.id)
        );
        setProperties(filtered);
      } catch (error) {
        console.error("Failed to fetch saved properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mb-4" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-rhoam-primary/10 rounded-full flex items-center justify-center mb-6">
          <Heart className="text-[#FF5A5F]" size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No saved homes</h1>
        <p className="text-gray-500 max-w-xs">
          As you search, tap the heart icon to save your favorite properties here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-6 pb-24 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 px-2">Saved</h1>
        <div className="space-y-8">
          {properties.map((property) => (
            <PreviewCard
                key={property.id}
                property={property}
                isStatic={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
