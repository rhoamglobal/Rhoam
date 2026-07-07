"use client";

import { useEffect, useState } from "react";

import { Property } from "@/components/map/types";
import SavedPropertyCard from "@/components/cards/SavedPropertyCard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";


export const dynamic = "force-dynamic";

export default function SavedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Undo system state
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

    if (savedError || !savedData) return;

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
        .select("*")
        .in("id", propertyIds);

    if (!propertiesError && propertiesData) {
      setProperties(propertiesData);
    }

    setLoading(false);
  };

  fetchSavedProperties();
}, [user]);

  // ⚡ REMOVE WITH UNDO
  const handleRemove = (id: string) => {
    const removed = properties.find((p) => p.id === id);
    if (!removed) return;

    // update UI instantly
    setProperties((prev) => prev.filter((p) => p.id !== id));




    // show toast
    setUndoItem(removed);
    setToastVisible(true);

    // auto hide
    setTimeout(() => {
      setToastVisible(false);
      setUndoItem(null);
    }, 3000);
  };

  // 🔄 UNDO ACTION
  const undoRemove = () => {
    if (!undoItem) return;

    setProperties((prev) => [undoItem, ...prev]);

    setToastVisible(false);
    setUndoItem(null);
  };

  // 🧼 SKELETON LOADING UI
  function SkeletonCard() {
    return (
      <ProtectedRoute>
        <div className="animate-pulse">
          <div className="h-64 w-full bg-gray-200 rounded-2xl" />
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 py-6">
        <div className="mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-60 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8 pb-[80px]" >
      {/* HEADER */}
          <div className="mb-10">
      <h1 className="text-3xl font-semibold text-gray-900">
        Saved homes
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Your curated collection
      </p>
    </div>

      {/* EMPTY STATE */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="text-6xl mb-4">🤍</div>
          <h2 className="text-lg font-medium text-gray-900">
            No saved homes yet
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-sm">
            Start exploring properties and tap the heart icon to save your favorites.
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

      {/* ⚡ UNDO TOAST (AIRBNB STYLE) */}
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
            hover:cursor-pointer
          "
        >
          <p className="text-sm font-medium whitespace-nowrap">

          <span>Undo Remove</span>
          </p>
        </button>
      )}
    </div>
  );
}