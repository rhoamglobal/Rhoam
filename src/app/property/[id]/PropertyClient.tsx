"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { amenityIcons } from "@/lib/amenities";
import { Property } from "@/components/map/types";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PropertyClient({
  property,
}: {
  property: Property;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const checkSaved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/saved", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const isSaved = data.some(
          (item: Property) => item.id === property.id
        );
        setSaved(isSaved);
      }
    };
    checkSaved();
  }, [property.id]);
  

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* HERO IMAGE */}
      <div className="w-full h-[420px] relative">
        <Image
          src={
            (property.images && property.images.length > 0
              ? property.images[activeImage]
              : property.image_url || property.image) || "/placeholder.jpg"
          }
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 px-6 mt-3 overflow-x-auto">
        {(property.images || []).map((img: string, i: number) => (
          <div
            key={i}
            className={`relative h-16 w-20 flex-shrink-0 rounded-md cursor-pointer border-2 ${
              activeImage === i
                ? "border-[#FF6B6B]"
                : "border-transparent"
            }`}
            onClick={() => setActiveImage(i)}
          >
            <Image
              src={img}
              alt={`${property.title} thumbnail ${i + 1}`}
              fill
              className="object-cover rounded-md"
            />
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* TITLE + PRICE */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {property.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {property.category}
            </p>
          </div>

          <div className="bg-[#FF6B6B] text-white px-5 py-2 rounded-full text-lg font-semibold shadow-md">
            ₦{property.price.toLocaleString()}
          </div>
        </div>

        {/* CORAL LINE */}
        <div className="w-14 h-[3px] bg-[#FF6B6B] rounded-full mt-5" />

        {/* DESCRIPTION */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">About this place</h2>
          <p className="text-gray-600 leading-relaxed">
            {property.description || "No description provided."}
          </p>
        </div>

        {/* AMENITIES SECTION */}
        <div className="mt-10">
          <h2 className="text-lg font-medium mb-4">Amenities</h2>

          <div className="flex flex-wrap gap-3">
            {(property.amenities || []).map((item: string, index: number) => {
              const Icon = amenityIcons[item] || null;


              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border bg-gray-50 hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition"
                >
                  {Icon && <Icon size={16} />}
                  <span className="text-sm capitalize">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOCATION */}
        <div className="mt-10 bg-gray-50 border rounded-xl p-5">
          <h2 className="text-sm font-medium mb-2">Location</h2>
          <p className="text-sm text-gray-500">
            {property.latitude ?? property.lat}, {property.longitude ?? property.lng}
          </p>
        </div>

        {/* SAVE BUTTON */}
        <button
            onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                alert("Please login to save properties");
                return;
              }

              const res = await fetch("/api/save", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  propertyId: property.id,
                }),
              });

              const data = await res.json();
              setSaved(data.saved);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border hover:border-[#FF6B6B] transition"
          >
            <Heart
              size={18}
              fill={saved ? "#FF6B6B" : "none"}
              color={saved ? "#FF6B6B" : "gray"}
            />

            <span>{saved ? "Saved" : "Save"}</span>
          </button>

        {/* DESCRIPTION */}
        <div className="mt-8 text-gray-600">
          {property.description}
        </div>
      </div>
    </div>
  );
}