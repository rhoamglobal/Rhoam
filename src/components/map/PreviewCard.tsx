"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Property } from "./types";
import { useEffect, useState } from "react";
import { isSaved, toggleSaved } from "@/lib/saved";
import { Heart, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

import { schools } from "@/lib/schools";
import {
  getDistanceKm,
  kmToWalkMinutes,
  getDistanceBadge,
} from "@/lib/distance";

export default function PreviewCard({
  property,
}: {
  property: Property | null;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [saved, setSaved] = useState(false);

  // Prefetch the moment the card appears (when a map pin is tapped), so
  // by the time someone actually taps through, the page is already
  // warm. This is the same underlying mechanism <Link> uses for
  // automatic prefetching — used directly here since the card itself is
  // a framer-motion element, not something we want to restructure into
  // an <a> tag.
  useEffect(() => {
    if (property) {
      router.prefetch(`/property/${property.id}`);
    }
  }, [property, router]);

  // authenticate saving
  useEffect(() => {
    const checkSaved = async () => {
      if (!property || !user) return;

      const state = await isSaved(user.id, property.id);
      setSaved(state);
    };

    checkSaved();
  }, [property, user]);

  const handleSave = async () => {
    if (!property || !user) {
      router.push("/login");
      return;
    }

    const state = await toggleSaved(user.id, property.id);
    setSaved(state);
  };

  // auto-match school using school_tag
  const matchedSchool = schools.find(
    (s) => s.name.toLowerCase() === property?.school_tag?.toLowerCase()
  );

  let distanceInfo: string | null = null;
  let distanceBadge: string | null = null;

  if (property && matchedSchool) {
    const km = getDistanceKm(
      property.latitude,
      property.longitude,
      matchedSchool.lat,
      matchedSchool.lng
    );

    const minutes = kmToWalkMinutes(km);

    distanceInfo = `${minutes} min walk to ${matchedSchool.name}`;
    distanceBadge = getDistanceBadge(minutes);
  }

  return (
    <AnimatePresence mode="wait">
      {property && (
        <motion.div
          key={property.id}
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 120, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={() => router.push(`/property/${property.id}`)}
          className="
            fixed bottom-10 left-1/2 z-[2000]
            w-[min(360px,92vw)]
            bg-white rounded-[28px]
            overflow-hidden
            shadow-[0_20px_60px_rgba(0,0,0,0.22)]
            cursor-pointer
            transition-transform duration-200
            hover:-translate-y-0.5
          "
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

            {/* SAVE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="
                absolute top-3 right-3
                h-10 w-10 rounded-full
                bg-white/95 hover:bg-white
                shadow-md
                flex items-center justify-center
                transition
                z-10
              "
              aria-label={saved ? "Remove from saved" : "Save property"}
            >
              <Heart
                size={18}
                color={saved ? "#FF6B6B" : "#374151"}
                fill={saved ? "#FF6B6B" : "none"}
                strokeWidth={2}
              />
            </button>

            {/* PRICE */}
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

            {/* distance */}
            {distanceInfo && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full bg-[#fff1f1] text-[#ff5a5f] font-medium">
                  {distanceBadge}
                </span>

                <p className="text-xs text-gray-500 truncate">
                  {distanceInfo}
                </p>
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
              className="
                w-full mt-4
                py-3 rounded-2xl
                bg-[#FF6B6B] hover:bg-[#ff5252]
                text-white text-sm font-semibold
                shadow-lg shadow-[#FF6B6B]/25
                transition
                flex items-center justify-center gap-1.5
              "
            >
              View details
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
