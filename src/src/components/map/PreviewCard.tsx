"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Property } from "./types";
import { useEffect, useState } from "react";
import { isSaved, toggleSaved } from "@/lib/saved";
import { Heart, CheckCircle2 } from "lucide-react";
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
    (s) =>
      s.name.toLowerCase() === property?.school_tag?.toLowerCase()
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

    distanceInfo = `${minutes} mins walk to ${matchedSchool.name}`;
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
          transition={{ duration: 0.35 }}
          className="preview-card"
        >
          <div style={{ position: "relative" }}>
            <div className="relative h-48 w-full">
              <Image
                src={
                  property.images?.[0] ||
                  property.image_url ||
                  property.image ||
                  "/placeholder.jpg"
                }
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>

            <div
              onClick={handleSave}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "white",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 10,
              }}
            >
              <Heart
                size={20}
                color={saved ? "#ff5a5f" : "#333"}
                fill={saved ? "#ff5a5f" : "none"}
                strokeWidth={2}
              />
            </div>
          </div>

          <div className="info">
            <div className="flex items-center gap-2">
              <h3>{property.title}</h3>

              {property.is_verified && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 size={13} />
                  Verified
                </span>
              )}
            </div>

            {/* coral branding */}
            <h2 style={{ color: "#ff5a5f" }}>
              {property.category}
            </h2>

            <span className="text-[#FF6B6B] font-semibold">
              ₦{property.price.toLocaleString()} / year
            </span>

            {/* distance section */}
            {distanceInfo && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-[#fff1f1] text-[#ff5a5f] font-medium">
                  {distanceBadge}
                </span>

                <p className="text-xs text-gray-500">
                  {distanceInfo}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {property.school_tag} • {property.location}
            </p>

            <button
              onClick={() =>
                router.push(`/property/${property.id}`)
              }
            >
              View details
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}