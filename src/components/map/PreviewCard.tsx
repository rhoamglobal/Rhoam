"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Property } from "./types";
import { useEffect, useState } from "react";
import { isSaved, toggleSaved } from "@/lib/saved";
import { Z_CLASS } from "@/lib/zIndex";
import { useAuth } from "@/components/providers/AuthProvider";
import PropertyCard from "./PropertyCard";

import { schools } from "@/lib/schools";
import {
  getDistanceKm,
  kmToWalkMinutes,
  getDistanceBadge,
} from "@/lib/distance";

export default function PreviewCard({
  property,
  onClose,
}: {
  property: Property | null;
  // Previously the only way to dismiss this card was tapping elsewhere on
  // the map (via CloseOnMapClick) — no visible affordance told anyone
  // that. This makes dismissal explicit and discoverable (RHM-106).
  onClose?: () => void;
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
          className={`fixed bottom-10 left-1/2 ${Z_CLASS.propertyFloatingControls}`}
        >
          <PropertyCard
            property={property}
            saved={saved}
            onSave={handleSave}
            onClose={onClose}
            distanceInfo={distanceInfo}
            distanceBadge={distanceBadge}
            variant="floating"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
