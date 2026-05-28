"use client";

import { Property } from "@/components/map/types";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleSaved } from "@/lib/saved";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SavedPropertyCard({
  property,
  onRemove,
}: {
  property: Property;
  onRemove: (id: string) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      toggleSaved(user.id, property.id);
    }
    onRemove(property.id);
  };

  return (
    <div
      onClick={() => router.push(`/property/${property.id}`)}
      className="
        cursor-pointer group
        transition-all duration-300
      "
    >
      {/* IMAGE WRAPPER */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={property.images?.[0]}
          className="
            h-64 w-full object-cover
            transition-transform duration-500
            group-hover:scale-105
          "
        />

        {/* SOFT OVERLAY ON HOVER */}
        <div className="
          absolute inset-0
          bg-black/0 group-hover:bg-black/10
          transition
        " />

        {/* HEART BUTTON */}
        <button
          onClick={handleRemove}
          className="
            absolute top-3 right-3
            bg-white/95 hover:bg-white
            p-2 rounded-full shadow-md
            transition-all duration-200
            hover:scale-105
          "
        >
          <Heart
            size={18}
            className="text-[#FF6B6B] fill-[#FF6B6B]"
          />
        </button>
      </div>

      {/* TEXT SECTION */}
      <div className="mt-3 space-y-1 px-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="
            font-medium text-gray-900
            truncate
            group-hover:text-[#FF6B6B]
            transition
          ">
            {property.title}
          </h3>

          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
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