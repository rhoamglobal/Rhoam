"use client";

import { useState, useEffect } from "react";
import { toggleSave } from "@/lib/toggleSave";
import { amenityIcons } from "@/lib/amenities";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PropertyClient({
  property,
}: {
  property: any;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      setUserId(user?.id || null);
    };
  
    getUser();
  }, []);

  // fallback amenities (you can later store in DB)
  const amenities: string[] =
    property.amenities || ["WiFi", "Borehole", "Security", "Electricity"];

  useEffect(() => {
    fetch(`/api/saved?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const isSaved = data.some(
          (item: any) => item.property_id === property.id
        );
        setSaved(isSaved);
      });
  }, []);
  

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* HERO IMAGE */}
      <div className="w-full h-[420px]">
        <img
          src={property.images?.[activeImage] || "/placeholder.jpg"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 px-6 mt-3 overflow-x-auto">
        {property.images?.map((img: string, i: number) => (
          <img
            key={i}
            src={img}
            onClick={() => setActiveImage(i)}
            className={`h-16 w-20 object-cover rounded-md cursor-pointer border-2 ${
              activeImage === i
                ? "border-[#FF6B6B]"
                : "border-transparent"
            }`}
          />
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
            {property.latitude}, {property.longitude}
          </p>
        </div>

        {/* SAVE BUTTON */}
        <button
            onClick={async () => {
              const res = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId,
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