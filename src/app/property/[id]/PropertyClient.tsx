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


  useEffect(() => {
    if (!userId) return;
    fetch(`/api/saved?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const isSaved = data.some(
          (item: { property_id: string }) => item.property_id === property.id
        );
        setSaved(isSaved);
      });
  }, [userId, property.id]);

  /* hide buttom nave */
  useEffect(() => {
    document.body.setAttribute("data-page", "property");
  
    return () => {
      document.body.removeAttribute("data-page");
    };
  }, []);
  

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HERO IMAGE */}
      <div className="w-full h-[460px] relative">
        <Image
          src={
            (property.images && property.images.length > 0
              ? property.images[activeImage]
              : property.image_url || property.image) || "/placeholder.jpg"
          }
          alt={property.title}
          fill
          className="object-cover"
          priority
        />

        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* ⬅️ BACK BUTTON */}
        <button
          onClick={() => window.history.back()}
          className="
            absolute top-4 left-4
            bg-white/90 hover:bg-white
            p-2 rounded-full shadow-md
            transition
          "
        >
          ←
        </button>

        {/* ❤️ SAVE BUTTON */}
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
          className="
            absolute top-4 right-4
            bg-white/90 hover:bg-white
            p-2 rounded-full shadow-md
            transition
            hover:scale-105 active:scale-95
          "
        >
          <Heart
            size={20}
            fill={saved ? "#FF6B6B" : "none"}
            color={saved ? "#FF6B6B" : "gray"}
          />
        </button>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 px-6 mt-4 overflow-x-auto">
        {(property.images || []).map((img: string, i: number) => (
          <div
            key={i}
            onClick={() => setActiveImage(i)}
            className={`
              relative h-16 w-20 flex-shrink-0 rounded-lg cursor-pointer
              border transition overflow-hidden
              ${activeImage === i ? "border-[#FF6B6B]" : "border-gray-200"}
            `}
          >
            <Image
              src={img}
              alt=""
              fill
              className="object-cover"
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
        <div className="w-16 h-[3px] bg-[#FF6B6B] rounded-full mt-6" />

        {/* DESCRIPTION */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">About this place</h2>

          <p className="text-gray-600 leading-relaxed text-[15px]">
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
        <div className="mt-10 bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-medium mb-2">Location</h2>

          <p className="text-sm text-gray-500">
            {property.latitude ?? property.lat}, {property.longitude ?? property.lng}
          </p>
        </div>

        {/* cta button */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg px-6 py-4 flex items-center justify-between z-[1000]">
          <div>
            <p className="text-sm text-gray-500">Interested in this property?</p>
            <p className="text-base font-semibold text-gray-900">
              ₦{property.price.toLocaleString()}
            </p>
          </div>

          <button
            className="
              bg-[#FF6B6B] hover:bg-[#ff5252]
              text-white px-6 py-3
              rounded-full font-medium
              transition
            "
            onClick={() => {
              alert("Contact landlord feature coming soon 🚀");
            }}
          >
            Contact landlord
          </button>
        </div>

      </div>
    </div>
  );
}