"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { amenityIcons } from "@/lib/amenities";
import { Property } from "@/components/map/types";
import {
  Heart,
  CheckCircle2,
  Bed,
  Users,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastProvider";
import { schools } from "@/lib/schools";
import { getDistanceKm, kmToWalkMinutes } from "@/lib/distance";
import { UNLOCK_FEE_NGN } from "@/lib/config";
import UnlockModal from "@/components/UnlockModal";

export default function PropertyClient({
  property,
  nearbyProperties,
}: {
  property: Property & { isUnlocked?: boolean };
  nearbyProperties: Property[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // server should send this
  const [unlocked, setUnlocked] = useState(property.isUnlocked || false);

  const [checkingUnlock, setCheckingUnlock] = useState(
    !property.isUnlocked
  );
  const [unlocking, setUnlocking] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const { showToast } = useToast();

  const images =
    property.images?.length
      ? property.images
      : [property.image_url || property.image || "/placeholder.jpg"];

  // distance to school
  const matchedSchool = schools.find(
    (s) => s.name.toLowerCase() === property.school_tag.toLowerCase()
  );

  let distanceInfo: string | null = null;

  if (matchedSchool) {
    const km = getDistanceKm(
      property.latitude,
      property.longitude,
      matchedSchool.lat,
      matchedSchool.lng
    );

    const minutes = kmToWalkMinutes(km);

    distanceInfo = `${minutes} min walk to ${matchedSchool.name}`;
  }

  // GET USER
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id || null);
      if (!user || !property?.id) {
        setCheckingUnlock(false);
      }
    };

    getUser();
  }, [property?.id]);

  // FALLBACK CHECK (in case property.isUnlocked wasn't passed)
  useEffect(() => {
    if (!userId || !property?.id) {
      return;
    }

    const checkUnlock = async () => {
      const { data } = await supabase
        .from("contact_unlocks")
        .select("id")
        .eq("user_id", userId)
        .eq("property_id", property.id)
        .maybeSingle();

      setUnlocked(!!data);
      setCheckingUnlock(false);
    };

    checkUnlock();
  }, [userId, property.id]);

  // HANDLE UNLOCK (Monnify)
  const requestUnlock = () => {
    if (!userId) {
      showToast("Login first to unlock contact.");
      return;
    }

    if (unlocking) return;

    setShowUnlockModal(true);
  };

  const confirmUnlock = async () => {
    if (unlocking) return; // anti-double-click

    try {
      setUnlocking(true);

      const res = await fetch("/api/unlock/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to initialize payment.");
        setUnlocking(false);
        setShowUnlockModal(false);
        return;
      }

      // redirect to Paystack checkout
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.log(error);
      showToast("Something went wrong.");
      setUnlocking(false);
      setShowUnlockModal(false);
    }
  };

  // SAVE PROPERTY
  useEffect(() => {
    if (!userId) return;

    fetch(`/api/saved`)
      .then((res) => res.json())
      .then((data) => {
        const isSaved = data.some(
          (item: { id: string }) => item.id === property.id
        );
        setSaved(isSaved);
      });
  }, [userId, property.id]);

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-[96px]">
      {/* HERO IMAGE */}
      <div className="w-full h-[300px] sm:h-[380px] relative bg-gray-100">
        <Image
          src={images[activeImage]}
          alt={property.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />

        {/* BACK BUTTON */}
        <button
          onClick={() => window.history.back()}
          className="
            absolute top-4 left-4
            h-10 w-10 rounded-full
            bg-white/95 hover:bg-white
            shadow-md
            flex items-center justify-center
            transition
          "
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>

        {/* SAVE BUTTON */}
        <button
          onClick={async () => {
            const res = await fetch("/api/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                propertyId: property.id,
              }),
            });

            const data = await res.json();
            setSaved(data.saved);
          }}
          className="
            absolute top-4 right-4
            h-10 w-10 rounded-full
            bg-white/95 hover:bg-white
            shadow-md
            flex items-center justify-center
            transition
          "
          aria-label={saved ? "Remove from saved" : "Save property"}
        >
          <Heart
            size={18}
            fill={saved ? "#FF6B6B" : "none"}
            color={saved ? "#FF6B6B" : "#374151"}
          />
        </button>

        {/* IMAGE COUNTER */}
        {images.length > 1 && (
          <div
            className="
              absolute bottom-4 right-4
              px-3 py-1 rounded-full
              bg-black/45 backdrop-blur-sm
              text-white text-xs font-medium
            "
          >
            {activeImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* THUMBNAILS */}
      {images.length > 1 && (
        <div className="flex gap-2 px-6 mt-4 py-1.5 overflow-x-auto scrollbar-hide">
          {images.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`relative h-16 w-20 flex-shrink-0 rounded-xl transition ${
                activeImage === i
                  ? "ring-2 ring-[#FF6B6B] ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden">
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* TITLE + PRICE */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {property.title}
              </h1>

              {property.is_verified && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
                  <CheckCircle2 size={13} />
                  Verified by Rhoam
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-1.5">
              {property.category}
            </p>
          </div>

          <div className="bg-[#FF6B6B] text-white px-5 py-2.5 rounded-full text-lg font-semibold shadow-lg shadow-[#FF6B6B]/25">
            ₦{property.price.toLocaleString()}
          </div>
        </div>

        {distanceInfo && (
          <div className="flex items-center gap-1.5 mt-4 text-sm text-gray-500">
            <MapPin size={14} className="text-[#FF6B6B]" />
            {distanceInfo}
          </div>
        )}

        {/* QUICK FACTS */}
        <div className="flex gap-3 mt-6 flex-wrap">
          {property.room_count && (
            <span
              className="
                flex items-center gap-1.5
                px-4 py-2 rounded-full
                bg-[#FF6B6B]/8 text-[#FF6B6B]
                text-sm font-medium
                border border-[#FF6B6B]/15
              "
            >
              <Bed size={14} />
              {property.room_count} {property.room_count === 1 ? "Room" : "Rooms"}
            </span>
          )}

          {property.occupants_per_room && (
            <span
              className="
                flex items-center gap-1.5
                px-4 py-2 rounded-full
                bg-[#FF6B6B]/8 text-[#FF6B6B]
                text-sm font-medium
                border border-[#FF6B6B]/15
              "
            >
              <Users size={14} />
              {property.occupants_per_room} per room
            </span>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold mb-3">About this place</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            {property.description || "No description provided."}
          </p>
        </div>

        {/* AMENITIES */}
        {(property.amenities || []).length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Amenities</h2>

            <div className="flex flex-wrap gap-2.5">
              {(property.amenities || []).map(
                (item: string, index: number) => {
                  const Icon = amenityIcons[item] || null;

                  return (
                    <div
                      key={index}
                      className="
                        flex items-center gap-1.5
                        px-3.5 py-2 rounded-full
                        bg-[#FF6B6B]/8 text-[#FF6B6B]
                        border border-[#FF6B6B]/15
                        text-sm font-medium
                      "
                    >
                      {Icon && <Icon size={13} />}
                      <span className="capitalize">{item}</span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* ADDRESS */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="bg-gray-50/60 border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={15} className="text-[#FF6B6B]" />
              <h2 className="text-sm font-semibold text-gray-900">
                Address
              </h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {property.address}
            </p>
          </div>
        </div>

        {/* NEARBY PROPERTIES */}
        {nearbyProperties.length > 0 && (
          <div className="mt-14 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                More near {property.school_tag}
              </h2>

              <span className="text-xs text-gray-400">
                {nearbyProperties.length} available
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {nearbyProperties.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    (window.location.href = `/property/${item.id}`)
                  }
                  className="
                    min-w-[260px]
                    max-w-[260px]
                    snap-start
                    cursor-pointer
                    rounded-3xl
                    overflow-hidden
                    bg-white
                    border border-gray-100
                    shadow-[0_4px_20px_rgba(0,0,0,0.04)]
                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                    transition-all duration-300
                  "
                >
                  {/* IMAGE */}
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={
                        item.images?.length
                          ? item.images[0]
                          : item.image_url || "/placeholder.jpg"
                      }
                      alt={item.title}
                      fill
                      sizes="260px"
                      className="object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {item.title}
                    </h3>

                    <p className="text-[#ff5a5f] font-semibold text-sm mt-2">
                      ₦{item.price.toLocaleString()}
                    </p>

                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {item.location}
                    </p>

                    <div className="mt-3 inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-[11px] text-gray-500">
                      {item.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div
        className="
          fixed bottom-0 left-0 w-full
          bg-white/95 backdrop-blur-sm border-t border-gray-100
          shadow-[0_-8px_30px_rgba(0,0,0,0.06)]
          px-6 py-3
          flex items-center justify-between
          z-[1000]
          pb-[calc(env(safe-area-inset-bottom)+10px)]
        "
      >
        <div>
          <p className="text-xs text-gray-500">
            Interested in this property?
          </p>
          <p className="text-base font-semibold">
            ₦{property.price.toLocaleString()}
          </p>
        </div>

        {checkingUnlock ? (
          <button
            disabled
            className="bg-gray-200 text-gray-400 px-5 py-2.5 rounded-full font-medium"
          >
            Checking…
          </button>
        ) : unlocked ? (
          <a
            href={`tel:${property.landlord_phone}`}
            className="
              bg-green-500 hover:bg-green-600
              text-white px-5 py-2.5 rounded-full
              font-medium shadow-lg shadow-green-500/25
              transition
            "
          >
            Call Landlord
          </a>
        ) : (
          <button
            onClick={requestUnlock}
            disabled={unlocking}
            className="
              bg-[#FF6B6B] hover:bg-[#ff5252]
              text-white px-5 py-2.5 rounded-full
              font-medium shadow-lg shadow-[#FF6B6B]/25
              disabled:opacity-50
              transition
            "
          >
            {unlocking ? "Redirecting…" : `Unlock Contact — ₦${UNLOCK_FEE_NGN}`}
          </button>
        )}
      </div>

      <UnlockModal
        open={showUnlockModal}
        price={UNLOCK_FEE_NGN}
        propertyTitle={property.title}
        loading={unlocking}
        onConfirm={confirmUnlock}
        onCancel={() => {
          if (unlocking) return;
          setShowUnlockModal(false);
        }}
      />
    </div>
  );
}
