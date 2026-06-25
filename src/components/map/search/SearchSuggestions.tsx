"use client";

import { Property } from "../types";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  MapPin,
  Building2,
  Navigation,
} from "lucide-react";

type Props = {
  schools: {
    name: string;
    lat: number;
    lng: number;
  }[];
  locations: {
    name: string;
    lat: number;
    lng: number;
  }[];
  properties: Property[];
  onFlyTo: (target: {
    latitude: number;
    longitude: number;
  }) => void;
  onPreview: () => void;
};

export default function SearchSuggestions({
  schools,
  locations,
  properties,
  onFlyTo,
  onPreview,
}: Props) {
  const router = useRouter();

  if (
    !schools.length &&
    !locations.length &&
    !properties.length
  )
    return null;

  return (
    <div
      className="
        border-2 border-gray-100
        rounded-xl
        max-h-[260px]
        overflow-y-auto
        scroll-smooth
        overscroll-contain
      "
    >
      {/* Schools */}
      {schools.map((school) => (
        <button
          key={school.name}
          onClick={() =>
            onFlyTo({
              latitude: school.lat,
              longitude: school.lng,
            })
          }
          className="
            w-full px-4 py-3
            flex items-center justify-between
            hover:bg-gray-50
            transition-colors
          "
        >
          <div className="flex items-center gap-3">
            <GraduationCap
              size={17}
              className="text-[#ff5a5f]"
            />

            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {school.name}
              </p>

              <p className="text-xs text-gray-400">
                Campus
              </p>
            </div>
          </div>

          <Navigation
            size={15}
            className="text-gray-400"
          />
        </button>
      ))}

      {/* Locations */}
      {locations.map((location) => (
        <button
          key={location.name}
          onClick={() =>
            onFlyTo({
              latitude: location.lat,
              longitude: location.lng,
            })
          }
          className="
            w-full px-4 py-3
            flex items-center justify-between
            hover:bg-gray-50
            transition-colors
          "
        >
          <div className="flex items-center gap-3">
            <MapPin
              size={17}
              className="text-gray-500"
            />

            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {location.name}
              </p>

              <p className="text-xs text-gray-400">
                Area
              </p>
            </div>
          </div>

          <Navigation
            size={15}
            className="text-gray-400"
          />
        </button>
      ))}

      {/* Properties */}
      {properties.map((property) => (
        <div
          key={property.id}
          className="
            px-4 py-3
            flex items-center justify-between
            hover:bg-gray-50
            transition-colors
          "
        >
          <div
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={() => {
              onPreview();
              router.push(`/property/${property.id}`);
            }}
          >
            <Building2
              size={17}
              className="text-gray-500"
            />

            <div>
              <p className="text-sm font-medium text-gray-900">
                {property.title}
              </p>

              <p className="text-xs text-gray-400">
                ₦{property.price.toLocaleString()} •{" "}
                {property.school_tag} • {property.location}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              onFlyTo({
                latitude: property.latitude,
                longitude: property.longitude,
              })
            }
            className="
              p-2 rounded-full
              hover:bg-[#fff3f3]
              transition
            "
          >
            <Navigation
              size={16}
              className="text-[#ff5a5f]"
            />
          </button>
        </div>
      ))}
    </div>
  );
}