"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Property } from "./types";
import PropertyCard from "./PropertyCard";

export default function PropertyShelf({
  title,
  properties,
  savedIds,
  onSave,
  onSeeAll,
}: {
  title: string;
  properties: Property[];
  savedIds: Set<string>;
  onSave: (propertyId: string) => void;
  // Flies the map to this shelf's location and switches to map view —
  // shared handler in ListView, same one the header arrow and the
  // trailing "See all" tile both call.
  onSeeAll: () => void;
}) {
  if (properties.length === 0) return null;

  return (
    <div className="mb-9">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onSeeAll}
          aria-label={`See all in ${title}`}
          className="h-9 w-9 shrink-0 rounded-full border border-[#ffd4d5] text-[#ff5a5f] flex items-center justify-center hover:bg-[#fff1f1] transition"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            saved={savedIds.has(property.id)}
            onSave={() => onSave(property.id)}
            variant="shelf"
          />
        ))}

        {/* Trailing "See all" tile — same action as the header arrow,
            placed at the end of the scroll per Airbnb's own pattern.
            Height approximates a shelf card's full height (image + text
            block below) so it doesn't look squashed next to real cards. */}
        <button
          onClick={onSeeAll}
          className="w-[140px] shrink-0 snap-start h-[268px] rounded-2xl border border-dashed border-[#ffb3b5] bg-[#fff8f7] hover:bg-[#fff1f1] transition flex flex-col items-center justify-center gap-2 text-[#ff5a5f]"
        >
          <span className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <ArrowUpRight size={18} />
          </span>
          <span className="text-sm font-semibold">See all</span>
        </button>
      </div>
    </div>
  );
}
