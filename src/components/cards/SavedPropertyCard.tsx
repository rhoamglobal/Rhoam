"use client";

import { Property } from "@/components/map/types";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleSaved } from "@/lib/saved";

export default function SavedPropertyCard({
  property,
}: {
  property: Property;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(true);

  const handleRemove = (e: any) => {
    e.stopPropagation(); // prevents navigation
    toggleSave(property.id);
    setSaved(false);
  };

  if (!saved) return null;

  return (
    <div
      onClick={() => router.push(`/property/${property.id}`)}
      className="cursor-pointer group"
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={property.images?.[0]}
          className="h-64 w-full object-cover group-hover:scale-105 transition duration-300"
        />

        {/* REMOVE BUTTON */}
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition"
        >
          <Heart
            size={18}
            className="text-[#FF6B6B] fill-[#FF6B6B]"
          />
        </button>

        {/* CORAL GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>

      {/* INFO */}
      <div className="mt-3 space-y-1 px-1">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900 truncate group-hover:text-[#FF6B6B] transition">
            {property.title}
          </h3>

          <p className="text-sm font-semibold text-[#FF6B6B]">
            ₦{property.price.toLocaleString()}
          </p>
        </div>

        <p className="text-xs text-gray-500">
          {property.category}
        </p>
      </div>
    </div>
  );
}