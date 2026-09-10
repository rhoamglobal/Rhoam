"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, CheckCircle2, MapPin, ArrowRight, X } from "lucide-react";
import { Property } from "./types";

// The visual card shared by PreviewCard (map popup) and PropertyShelf
// (list view's horizontally-scrolling rows). Pulled out of PreviewCard
// rather than duplicated, so a future design tweak to the card only
// needs to happen in one place.
export default function PropertyCard({
  property,
  saved,
  onSave,
  onClose,
  distanceInfo,
  distanceBadge,
  variant = "floating",
}: {
  property: Property;
  saved: boolean;
  onSave: () => void;
  onClose?: () => void;
  distanceInfo?: string | null;
  distanceBadge?: string | null;
  // "floating" = the map popup's rounded card over the map.
  // "shelf" = the fixed-width Airbnb-home-feed-style card used in list
  // view's horizontally-scrolling rows.
  variant?: "floating" | "shelf";
}) {
  const router = useRouter();

  if (variant === "shelf") {
    return (
      <div
        onClick={() => router.push(`/property/${property.id}`)}
        className="w-[220px] shrink-0 snap-start cursor-pointer group"
      >
        <div className="relative h-[220px] w-full rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={
              property.images?.[0] ||
              property.image_url ||
              property.image ||
              "/placeholder.jpg"
            }
            alt={property.title}
            fill
            sizes="220px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {property.is_verified && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 text-gray-900 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-600" />
              Verified
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition"
            aria-label={saved ? "Remove from saved" : "Save property"}
          >
            <Heart
              size={16}
              color="white"
              fill={saved ? "#FF6B6B" : "none"}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="mt-2.5">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {property.title}
          </h3>
          <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
            <MapPin size={10} />
            {property.location}
          </p>
          {distanceInfo && (
            <p className="text-xs text-gray-400 truncate">{distanceBadge}</p>
          )}
          <p className="text-sm text-gray-900 mt-1">
            <span className="font-semibold">₦{property.price.toLocaleString()}</span>
            <span className="text-gray-500"> / year</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push(`/property/${property.id}`)}
      className="w-[min(360px,92vw)] bg-white rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.22)] cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
    >
      {/* IMAGE */}
      <div className="relative h-44 w-full bg-gray-100">
        <Image
          src={
            property.images?.[0] ||
            property.image_url ||
            property.image ||
            "/placeholder.jpg"
          }
          alt={property.title}
          fill
          sizes="360px"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />

        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 left-3 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center transition z-10"
            aria-label="Close preview"
          >
            <X size={18} color="#374151" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center transition z-10"
          aria-label={saved ? "Remove from saved" : "Save property"}
        >
          <Heart
            size={18}
            color={saved ? "#FF6B6B" : "#374151"}
            fill={saved ? "#FF6B6B" : "none"}
            strokeWidth={2}
          />
        </button>

        <div className="absolute bottom-3 left-4 text-white">
          <span className="text-xl font-bold drop-shadow-sm">
            ₦{property.price.toLocaleString()}
          </span>
          <span className="text-xs text-white/80 ml-1">/ year</span>
        </div>
      </div>

      {/* INFO */}
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {property.title}
          </h3>

          {property.is_verified && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium shrink-0">
              <CheckCircle2 size={11} />
              Verified
            </span>
          )}
        </div>

        <p className="text-xs text-[#ff5a5f] font-medium mt-1">
          {property.category}
        </p>

        {distanceInfo && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] px-2 py-1 rounded-full bg-[#fff1f1] text-[#ff5a5f] font-medium">
              {distanceBadge}
            </span>
            <p className="text-xs text-gray-500 truncate">{distanceInfo}</p>
          </div>
        )}

        <p className="flex items-center gap-1 text-xs text-gray-400 mt-2 truncate">
          <MapPin size={11} />
          {property.school_tag} • {property.location}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/property/${property.id}`);
          }}
          className="w-full mt-4 py-3 rounded-2xl bg-[#FF6B6B] hover:bg-[#ff5252] text-white text-sm font-semibold shadow-lg shadow-[#FF6B6B]/25 transition flex items-center justify-center gap-1.5"
        >
          View details
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
