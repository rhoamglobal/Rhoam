"use client";

import { useEffect, useState } from "react";

import { Property } from "@/components/map/types";
import SavedPropertyCard from "@/components/cards/SavedPropertyCard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { supabase } from "@/lib/supabase";
import { toggleSaved } from "@/lib/saved";
import { useAuth } from "@/components/providers/AuthProvider";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="h-64 w-full bg-gray-200 rounded-2xl" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function SavedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Undo system state
  const [undoItem, setUndoItem] = useState<Property | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!user) return;

      // 1. get saved property ids
      const { data: savedData, error: savedError } = await supabase
        .from("saved_properties")
        .select("property_id")
        .eq("user_id", user.id);

      if (savedError || !savedData) {
        setLoading(false);
        return;
      }

      const propertyIds = savedData.map((item) => item.property_id);

      if (propertyIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      // 2. fetch actual properties
      const { data: propertiesData, error: propertiesError } =
        await supabase
          .from("properties")
          .select(
            `
            id, title, price, latitude, longitude, category,
            image_url, images, description, amenities,
            school_tag, location, is_verified, address,
            is_available, is_visible, is_active,
            room_count, occupants_per_room, bathroom_count
          `
          )
          .in("id", propertyIds);

      if (!propertiesError && propertiesData) {
        setProperties(propertiesData);
      }

      setLoading(false);
    };

    fetchSavedProperties();
  }, [user]);

  // REMOVE WITH UNDO
  const handleRemove = (id: string) => {
    const removed = properties.find((p) => p.id === id);
    if (!removed) return;

    // The heart button in SavedPropertyCard already deleted the DB row
    // by the time this fires — this only updates what's on screen.
    setProperties((prev) => prev.filter((p) => p.id !== id));

    setUndoItem(removed);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
      setUndoItem(null);
    }, 3000);
  };

  // UNDO ACTION — re-saves the property, since the heart button already
  // removed it from the database. Without this, "Undo" only looked like
  // it worked: the card would reappear here but vanish again on refresh.
  const undoRemove = async () => {
    if (!undoItem || !user) return;

    setProperties((prev) => [undoItem, ...prev]);
    setToastVisible(false);
    setUndoItem(null);

    await toggleSaved(user.id, undoItem.id);
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="min-h-screen bg-white px-6 py-8">
          <div className="mb-10">
            <div className="h-8 w-44 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-gray-200 rounded mt-3 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-white px-6 py-8 pb-[96px]">
          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Saved homes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Your curated collection
            </p>
          </div>

          {/* EMPTY STATE */}
          {properties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#fff1f1] flex items-center justify-center mb-5">
                <Heart className="text-[#ff5a5f]" size={28} />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                No saved homes yet
              </h2>

              <p className="text-gray-500 text-sm mt-2 max-w-sm">
                Start exploring properties and tap the heart icon to save
                your favorites.
              </p>
            </div>
          )}

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <SavedPropertyCard
                key={property.id}
                property={property}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* UNDO TOAST */}
          {toastVisible && undoItem && (
            <button
              onClick={undoRemove}
              className="
                fixed bottom-24 left-1/2 -translate-x-1/2
                bg-[#ff5a5f] text-white
                px-6 py-3
                rounded-full shadow-xl
                flex items-center justify-center
                z-[1000]
                hover:scale-105 active:scale-95
                transition-all duration-200
              "
            >
              <span className="text-sm font-medium whitespace-nowrap">
                Removed — Undo?
              </span>
            </button>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}
