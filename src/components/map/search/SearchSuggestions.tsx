"use client";

import { Property } from "../types";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  GraduationCap,
  MapPin,
  Navigation,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import {
  getDistanceKm,
  kmToWalkMinutes,
} from "@/lib/distance";

import { schools } from "@/lib/schools";

type Props = {
  schoolSuggestions?: {
    name: string;
    lat: number;
    lng: number;
    key: string;
  }[];
  locations?: {
    name: string;
    lat: number;
    lng: number;
  }[];
  properties?: Property[];
  loading?: boolean;
  onFlyTo: (target: {
    latitude: number;
    longitude: number;
  }) => void;
  onPreview: () => void;
};

export default function SearchSuggestions({
  schoolSuggestions = [],
  locations = [],
  properties = [],
  loading = false,
  onFlyTo,
  onPreview,
}: Props) {
  const router = useRouter();

  const resultCount =
    schoolSuggestions.length +
    locations.length +
    properties.length;

  const hasResults =
    schoolSuggestions.length > 0 ||
    locations.length > 0 ||
    properties.length > 0;

  if (!loading && !hasResults) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scaleY: 0.94 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -6, scaleY: 0.97 }}
      transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
      style={{ transformOrigin: "top" }}
      className="max-h-[min(460px,calc(100vh-140px))] overflow-y-auto overscroll-contain scroll-smooth border-t border-gray-100/90 bg-gradient-to-b from-white to-gray-50/80"
    >
      {loading && !hasResults ? (
        <div className="px-4 py-6">
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                  <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <Sparkles size={13} className="text-[#ff5a5f]" />
          Smart matches
        </div>

        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
          {resultCount} results
        </span>
      </div>

      <div className="space-y-1 px-2 pb-2">
        {/* SCHOOLS */}
        {schoolSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.03 }}
          >
          <SuggestionGroup title="Schools">
            {schoolSuggestions.map((school) => (
              <button
                key={school.key}
                onClick={() =>
                  onFlyTo({
                    latitude: school.lat,
                    longitude: school.lng,
                  })
                }
                className="group flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff1f1] text-[#ff5a5f]">
                    <GraduationCap size={18} />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-950">
                      {school.name}
                    </span>

                    <span className="block text-xs text-gray-400">
                      Campus area
                    </span>
                  </span>
                </div>

                <NavigationIcon />
              </button>
            ))}
          </SuggestionGroup>
          </motion.div>
        )}

        {/* AREAS */}
        {locations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.06 }}
          >
          <SuggestionGroup title="Areas">
            {locations.map((location) => (
              <button
                key={location.name}
                onClick={() =>
                  onFlyTo({
                    latitude: location.lat,
                    longitude: location.lng,
                  })
                }
                className="group flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gray-100 text-gray-600">
                    <MapPin size={18} />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-950">
                      {location.name}
                    </span>

                    <span className="block text-xs text-gray-400">
                      Nearby listings
                    </span>
                  </span>
                </div>

                <NavigationIcon />
              </button>
            ))}
          </SuggestionGroup>
          </motion.div>
        )}

        {/* PROPERTIES */}
        {properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.09 }}
          >
          <SuggestionGroup title="Listings">
            {properties.map((property) => {
              // match against full school dataset
              const propertySchoolTag =
                property.school_tag?.toLowerCase() || "";

              const matchedSchool = schools.find(
                (school) =>
                  school.key.toLowerCase() === propertySchoolTag
              );

              let walkTime: string | null = null;

              if (
                matchedSchool &&
                property.latitude &&
                property.longitude
              ) {
                const km = getDistanceKm(
                  property.latitude,
                  property.longitude,
                  matchedSchool.lat,
                  matchedSchool.lng
                );

                walkTime = `${kmToWalkMinutes(km)} mins walk`;
              }

              return (
                <div
                  key={property.id}
                  className="group flex items-center justify-between gap-2 rounded-2xl px-3 py-3 transition hover:bg-white hover:shadow-sm"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => {
                      onPreview();
                      router.push(`/property/${property.id}`);
                    }}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gray-950 text-white">
                      <Building2 size={18} />
                    </span>

                    <span className="min-w-0">
                      {/* TITLE */}
                      <div className="flex items-center gap-2">
                        <span className="block truncate text-sm font-semibold text-gray-950">
                          {property.title}
                        </span>

                        {property.is_verified && (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500 shrink-0"
                          />
                        )}
                      </div>

                      {/* META */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                        <span className="font-semibold text-[#ff5a5f]">
                          NGN {property.price.toLocaleString()}
                        </span>

                        <span>
                          {property.school_tag} • {property.location}
                        </span>

                        {walkTime && (
                          <span className="rounded-full bg-[#fff1f1] px-2 py-0.5 text-[10px] font-medium text-[#ff5a5f]">
                            {walkTime}
                          </span>
                        )}
                      </div>
                    </span>
                  </button>

                  {/* ACTIONS */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Open ${property.title}`}
                      onClick={() => {
                        onPreview();
                        router.push(`/property/${property.id}`);
                      }}
                      className="grid h-9 w-9 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ArrowUpRight size={16} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Fly to ${property.title}`}
                      onClick={() =>
                        onFlyTo({
                          latitude: property.latitude,
                          longitude: property.longitude,
                        })
                      }
                      className="grid h-9 w-9 place-items-center rounded-full text-[#ff5a5f] transition hover:bg-[#fff1f1]"
                    >
                      <Navigation size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </SuggestionGroup>
          </motion.div>
        )}
      </div>
        </>
      )}
    </motion.div>
  );
}

function SuggestionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
        {title}
      </div>

      <div>{children}</div>
    </section>
  );
}

function NavigationIcon() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-300 transition group-hover:bg-[#fff1f1] group-hover:text-[#ff5a5f]">
      <Navigation size={15} />
    </span>
  );
}