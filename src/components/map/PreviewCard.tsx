"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Property } from "./types";
import { useEffect, useState } from "react";
import { toggleSaved } from "@/lib/saved";
import { Heart } from "lucide-react";

import { getDistanceKm, kmToWalkMinutes } from "@/lib/distance";

type School = {
  name: string;
  lat: number;
  lng: number;
};

export default function PreviewCard({
  property,
  school, // ✅ now a school OBJECT
  isInitiallySaved = false,
}: {
  property: Property | null;
  school?: School | null;
  isInitiallySaved?: boolean;
}) {
  const router = useRouter();

  const [saved, setSaved] = useState(isInitiallySaved);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaved(isInitiallySaved);
    }, 0);
    return () => clearTimeout(timer);
  }, [isInitiallySaved]);

const handleSave = async () => {
  if (!property) return;
  const state = await toggleSaved(property.id);
  setSaved(state);
};

  let distanceInfo: string | null = null;

  if (property && school) {
    const km = getDistanceKm(
      property.latitude,
      property.longitude,
      school.lat,
      school.lng
    );

    const minutes = kmToWalkMinutes(km);
    distanceInfo = `${minutes} mins walk to ${school.name} gate`;
  }

  

  return (
    <AnimatePresence mode="wait">
      {property && (
        <motion.div
          key={property.id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="preview-card"
        >
        <div style={{ position: "relative" }}>
          <div className="relative h-48 w-full">
            <Image
              src={property.image_url}
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
            <h3>{property.title}</h3>

            {/* coral branding */}
            <h2 style={{ color: "#ff5a5f" }}>{property.category}</h2>

            <p style={{ opacity: 0.8 }}>
              ₦{property.price.toLocaleString()} / year
            </p>

            {distanceInfo && (
              <p className="text-sm mt-1 text-gray-600">
                📍 {distanceInfo}
              </p>
            )}

            <button onClick={() => router.push(`/property/${property.id}`)}>
              View details
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}