"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Property } from "./types";
import PropertyCard from "./PropertyCard";

type DistanceMeta = { distanceInfo: string | null; distanceBadge: string | null };

export default function PropertyShelf({
  title,
  properties,
  savedIds,
  onSave,
  onSeeAll,
  getDistanceMeta,
}: {
  title: string;
  properties: Property[];
  savedIds: Set<string>;
  onSave: (propertyId: string) => void;
  // Flies the map to this shelf's location and switches to map view —
  // shared handler in ListView, same one the header arrow and the
  // trailing "See all" tile both call.
  onSeeAll: () => void;
  // Computes the "X min walk to {school}" text for a given property.
  // Optional so PropertyShelf doesn't require every caller to know
  // about schools — falls back to the card's own default (the raw
  // location tag) when omitted.
  getDistanceMeta?: (property: Property) => DistanceMeta;
}) {
  if (properties.length === 0) return null;

  // Up to 3 thumbnails for the trailing "See all" collage, most-recent
  // first — mirrors the stacked-photo tile Airbnb itself uses at the end
  // of a shelf, rather than a plain icon placeholder.
  const previewImages = properties
    .slice(0, 3)
    .map((p) => p.images?.[0] || p.image_url || p.image || "/placeholder.jpg");

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
        {properties.map((property) => {
          const meta = getDistanceMeta?.(property);
          return (
            <PropertyCard
              key={property.id}
              property={property}
              saved={savedIds.has(property.id)}
              onSave={() => onSave(property.id)}
              distanceInfo={meta?.distanceInfo}
              distanceBadge={meta?.distanceBadge}
              variant="shelf"
            />
          );
        })}

        {/* Trailing "See all" tile — a stacked-photo collage, same
            pattern Airbnb itself uses at the end of a shelf, rather than
            a plain icon placeholder. Same action as the header arrow. */}
        <button
          onClick={onSeeAll}
          aria-label={`See all in ${title}`}
          className="w-[140px] shrink-0 snap-start flex flex-col items-center pt-2"
        >
          <div className="relative h-[190px] w-full">
            {previewImages.map((src, i) => {
              // Fanned stack: back-most image furthest rotated/offset,
              // front-most (i === 0) sits flat and on top.
              const rotations = [0, -6, 6];
              const offsets = [0, 10, 18];
              return (
                <div
                  key={i}
                  className="absolute inset-x-2 top-0 h-[160px] rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5 bg-gray-100"
                  style={{
                    transform: `rotate(${rotations[i]}deg) translateY(${offsets[i]}px)`,
                    zIndex: previewImages.length - i,
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
          <span className="text-sm font-semibold text-gray-900 mt-3">
            See all
          </span>
        </button>
      </div>
    </div>
  );
}
