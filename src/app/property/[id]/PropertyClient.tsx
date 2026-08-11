"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { amenityIcons } from "@/lib/amenities";
import { Property } from "@/components/map/types";
import {
  Heart,
  Bed,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  Map,
  X,
} from "lucide-react";
import { VerifiedBadge, AvailabilityBadge } from "@/components/PropertyBadges";
import AskAvailabilityButton from "@/components/AskAvailabilityButton";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ToastProvider";
import { schools } from "@/lib/schools";
import { getDistanceKm, kmToWalkMinutes } from "@/lib/distance";
import { UNLOCK_FEE_NGN } from "@/lib/config";
import UnlockModal from "@/components/UnlockModal";
import ContactModal from "@/components/ContactModal";
import ReportIssueModal from "@/components/ReportIssueModal";
import { Z_CLASS } from "@/lib/zIndex";

export default function PropertyClient({
  property,
  nearbyProperties,
}: {
  property: Property & { isUnlocked?: boolean };
  nearbyProperties: Property[];
}) {
  const waLink = property.landlord_whatsapp
    ? `https://wa.me/${property.landlord_whatsapp.replace(/\D/g, "")}`
    : null;

  const caretakerWaLink = property.caretaker_whatsapp
    ? `https://wa.me/${property.caretaker_whatsapp.replace(/\D/g, "")}`
    : null;

  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Fullscreen gallery
  const [showGallery, setShowGallery] = useState(false);

  // Swipe tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // server should send this
  const [unlocked, setUnlocked] = useState(property.isUnlocked || false);

  const [checkingUnlock, setCheckingUnlock] = useState(
    !property.isUnlocked
  );

  const [unlocking, setUnlocking] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  // scroll model
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { showToast } = useToast();
  const router = useRouter();

  const images =
    property.images?.length
      ? property.images
      : [property.image_url || property.image || "/placeholder.jpg"];

  /*
   * ============================================================
   * FULLSCREEN GALLERY
   * ============================================================
   */

  const openGallery = () => {
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
  };

  const showNextImage = () => {
    setActiveImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const showPreviousImage = () => {
    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  // Keyboard controls
  useEffect(() => {
    if (!showGallery) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Prevent the property page behind the gallery from scrolling
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showGallery, images.length]);

  // Mobile swipe
  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    touchEndX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const distance = touchStartX.current - touchEndX.current;

    // Minimum swipe distance
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        // Swiped left
        showNextImage();
      } else {
        // Swiped right
        showPreviousImage();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

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

  // FALLBACK CHECK
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

  // HANDLE UNLOCK
  const requestUnlock = () => {
    if (!userId) {
      router.push(
        `/onboarding?redirect=${encodeURIComponent(
          `/property/${property.id}`
        )}`
      );
      return;
    }

    if (unlocking) return;

    setUnlockError("");
    setShowUnlockModal(true);
  };

  const confirmUnlock = async () => {
    if (unlocking) return;

    setUnlockError("");

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
        if (res.status === 409) {
          setUnlocked(true);
          showToast("You've already unlocked this contact.");
          setUnlocking(false);
          setShowUnlockModal(false);
        } else {
          setUnlockError(
            data.message || "Couldn't start checkout. Please try again."
          );
          setUnlocking(false);
        }

        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setUnlockError("Something went wrong starting checkout.");
        setUnlocking(false);
      }
    } catch (error) {
      console.log(error);

      setUnlockError(
        "Couldn't reach our servers. Check your connection and try again."
      );

      setUnlocking(false);
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
    <>
      <div className="min-h-screen bg-white text-gray-900 pb-[96px]">

        {/* =====================================================
            HERO IMAGE
        ====================================================== */}

        <div className="w-full h-[300px] sm:h-[380px] relative bg-gray-100">

          {/* CLICKABLE MAIN IMAGE */}
          <button
            type="button"
            onClick={openGallery}
            className="absolute inset-0 w-full h-full cursor-zoom-in"
            aria-label="Open property photo gallery"
          >
            <Image
              src={images[activeImage]}
              alt={property.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
          </button>

          {/* STICKY HEADER */}
          <div
            className={`
              fixed top-0 left-0 right-0
              h-[75px]
              bg-white/95
              backdrop-blur-lg
              shadow-sm
              ${Z_CLASS.propertyStickyHeader}
              transition-all duration-300
              flex items-center justify-center
              ${
                scrolled
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }
            `}
          >
            <h2
              className={`
                font-semibold text-lg
                transition-all duration-300
                ${
                  scrolled
                    ? "opacity-100"
                    : "opacity-0"
                }
              `}
            >
              {property.title}
            </h2>
          </div>

          {/* LEFT BUTTONS */}
          <div
            className={`
              fixed top-4 left-4
              flex items-center gap-3
              ${Z_CLASS.propertyFloatingControls}
            `}
          >
            {/* BACK */}
            <button
              onClick={() => router.back()}
              className={`
                h-11 w-11 rounded-full
                flex items-center justify-center
                shadow-md
                transition-all duration-300
                ${
                  scrolled
                    ? "bg-white text-black"
                    : "bg-black/35 text-white backdrop-blur-md"
                }
              `}
            >
              <ChevronLeft size={20} />
            </button>

            {/* MAP */}
            <button
              onClick={() => router.push("/")}
              className={`
                h-11 w-11 rounded-full
                flex items-center justify-center
                shadow-md
                transition-all duration-300
                ${
                  scrolled
                    ? "bg-white text-black"
                    : "bg-black/35 text-white backdrop-blur-md"
                }
              `}
            >
              <Map size={18} />
            </button>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={async () => {
              const res = await fetch("/api/save", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  propertyId: property.id,
                }),
              });

              const data = await res.json();
              setSaved(data.saved);
            }}
            className={`
              fixed top-4 right-4
              h-11 w-11 rounded-full
              flex items-center justify-center
              shadow-md
              transition-all duration-300
              ${Z_CLASS.propertyFloatingControls}
              ${
                scrolled
                  ? "bg-white text-black"
                  : "bg-black/35 text-white backdrop-blur-md"
              }
            `}
            aria-label={
              saved ? "Remove from saved" : "Save property"
            }
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
                pointer-events-none
              "
            >
              {activeImage + 1} / {images.length}
            </div>
          )}
        </div>

        {/* =====================================================
            THUMBNAILS
        ====================================================== */}

        {images.length > 1 && (
          <div className="flex gap-2 px-6 mt-4 py-1.5 overflow-x-auto scrollbar-hide">
            {images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`
                  relative h-16 w-20 flex-shrink-0 rounded-xl
                  transition
                  ${
                    activeImage === i
                      ? "ring-2 ring-[#FF6B6B] ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }
                `}
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

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* TITLE + PRICE */}
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                {property.is_verified && (
                  <VerifiedBadge verifiedAt={property.verified_at} />
                )}

                <AvailabilityBadge
                  lastConfirmedAt={property.last_confirmed_at}
                  multipleUnitsAvailable={
                    property.multiple_units_available
                  }
                />
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
                {property.room_count}{" "}
                {property.room_count === 1 ? "Room" : "Rooms"}
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
            <h2 className="text-lg font-semibold mb-3">
              About this place
            </h2>

            <p className="text-gray-600 leading-relaxed max-w-2xl">
              {property.description || "No description provided."}
            </p>
          </div>

          {/* AMENITIES */}
          {(property.amenities || []).length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-semibold mb-4">
                Amenities
              </h2>

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
                        <span className="capitalize">
                          {item}
                        </span>
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
                <MapPin
                  size={15}
                  className="text-[#FF6B6B]"
                />

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
                  <Link
                    key={item.id}
                    href={`/property/${item.id}`}
                    className="
                      block
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
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                      <Image
                        src={
                          item.images?.length
                            ? item.images[0]
                            : item.image_url ||
                              "/placeholder.jpg"
                        }
                        alt={item.title}
                        fill
                        sizes="260px"
                        className="object-cover"
                      />
                    </div>

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
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}

        <div
          className={`
            fixed bottom-0 left-0 w-full
            bg-white/95 backdrop-blur-sm border-t border-gray-100
            shadow-[0_-8px_30px_rgba(0,0,0,0.06)]
            px-6 py-3
            flex items-center justify-between
            ${Z_CLASS.mapControls}
            pb-[calc(env(safe-area-inset-bottom)+10px)]
          `}
        >
          <div>
            <p className="text-xs text-gray-500">
              Interested in this property?
            </p>

            <p className="text-base font-semibold">
              ₦{property.price.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {checkingUnlock ? (
              <button
                disabled
                className="bg-gray-200 text-gray-400 px-5 py-2.5 rounded-full font-medium"
              >
                Checking…
              </button>
            ) : unlocked ? (
              <button
                onClick={() => setShowContactModal(true)}
                className="
                  flex items-center gap-1.5
                  bg-green-500 hover:bg-green-600
                  text-white px-5 py-2.5 rounded-full
                  font-medium shadow-lg shadow-green-500/25
                  transition
                "
              >
                <Phone size={16} />
                Contact Now
              </button>
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
                {unlocking
                  ? "Redirecting…"
                  : `Unlock Contact — ₦${UNLOCK_FEE_NGN}`}
              </button>
            )}

            <AskAvailabilityButton propertyId={property.id} />
          </div>
        </div>

        {/* MODALS */}
        <UnlockModal
          open={showUnlockModal}
          price={UNLOCK_FEE_NGN}
          propertyTitle={property.title}
          loading={unlocking}
          error={unlockError}
          onConfirm={confirmUnlock}
          onCancel={() => {
            if (unlocking) return;

            setShowUnlockModal(false);
            setUnlockError("");
          }}
        />

        <ContactModal
          open={showContactModal}
          landlordPhone={property.landlord_phone}
          landlordWaLink={waLink}
          caretakerName={property.caretaker_name}
          caretakerPhone={property.caretaker_phone}
          caretakerWaLink={caretakerWaLink}
          onClose={() => setShowContactModal(false)}
          onReportIssue={() => setShowReportModal(true)}
        />

        <ReportIssueModal
          open={showReportModal}
          propertyId={property.id}
          onClose={() => setShowReportModal(false)}
        />
      </div>

      {/* ==========================================================
          AIRBNB-STYLE FULLSCREEN GALLERY
      =========================================================== */}

      {showGallery && (
        <div
          className="
            fixed inset-0
            z-[9999]
            bg-black
            text-white
            flex flex-col
          "
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* TOP BAR */}
          <div className="
            absolute top-0 left-0 right-0
            z-20
            flex items-center justify-between
            px-5 py-5
            bg-gradient-to-b from-black/60 to-transparent
          ">
            {/* CLOSE */}
            <button
              type="button"
              onClick={closeGallery}
              className="
                h-11 w-11
                rounded-full
                bg-white/10
                hover:bg-white/20
                backdrop-blur-md
                flex items-center justify-center
                transition
              "
              aria-label="Close gallery"
            >
              <X size={22} />
            </button>

            {/* COUNTER */}
            <div className="
              px-4 py-2
              rounded-full
              bg-black/40
              backdrop-blur-md
              text-sm font-medium
            ">
              {activeImage + 1} / {images.length}
            </div>
          </div>

          {/* MAIN IMAGE AREA */}
          <div className="
            flex-1
            relative
            flex items-center justify-center
            px-4 sm:px-16
            py-20
          ">

            {/* PREVIOUS */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={showPreviousImage}
                className="
                  hidden sm:flex
                  absolute left-5
                  z-20
                  h-12 w-12
                  rounded-full
                  bg-white/10
                  hover:bg-white/20
                  backdrop-blur-md
                  items-center justify-center
                  transition
                "
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* IMAGE */}
            <div className="
              relative
              w-full
              h-full
              max-w-6xl
            ">
              <Image
                src={images[activeImage]}
                alt={`${property.title} - image ${
                  activeImage + 1
                }`}
                fill
                sizes="100vw"
                className="
                  object-contain
                  select-none
                  pointer-events-none
                "
                priority
              />
            </div>

            {/* NEXT */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={showNextImage}
                className="
                  hidden sm:flex
                  absolute right-5
                  z-20
                  h-12 w-12
                  rounded-full
                  bg-white/10
                  hover:bg-white/20
                  backdrop-blur-md
                  items-center justify-center
                  transition
                "
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* MOBILE SWIPE HINT */}
          {images.length > 1 && (
            <div className="
              absolute
              bottom-[110px]
              left-0 right-0
              text-center
              sm:hidden
              text-xs
              text-white/60
              pointer-events-none
            ">
              Swipe to view photos
            </div>
          )}

          {/* FULLSCREEN THUMBNAILS */}
          {images.length > 1 && (
            <div className="
              absolute
              bottom-0 left-0 right-0
              z-20
              px-4
              pt-4
              pb-5
              bg-gradient-to-t from-black/80 via-black/40 to-transparent
            ">
              <div className="
                max-w-4xl
                mx-auto
                flex
                gap-2
                overflow-x-auto
                scrollbar-hide
                justify-start
              ">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`
                      relative
                      h-14
                      w-20
                      sm:h-16
                      sm:w-24
                      flex-shrink-0
                      rounded-lg
                      overflow-hidden
                      transition
                      ${
                        activeImage === i
                          ? "ring-2 ring-white scale-105"
                          : "opacity-60 hover:opacity-100"
                      }
                    `}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}