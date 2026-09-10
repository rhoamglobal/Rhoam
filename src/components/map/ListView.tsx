"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { isSaved, toggleSaved } from "@/lib/saved";
import { schools } from "@/lib/schools";
import { detectSchoolFromSearch } from "@/lib/detectSchool";
import { getDistanceKm } from "@/lib/distance";
import { useListProperties } from "@/hooks/useListProperties";
import { Filters, countActive } from "./topbar/filters/SmartFilters";
import PropertyShelf from "./PropertyShelf";
import ListEmptyState from "./ListEmptyState";
import { Property, FlyTarget } from "./types";
import type { UserLocation } from "@/hooks/useUserLocation";

type Props = {
  category: string;
  search: string;
  filters: Filters;
  userLocation: UserLocation;
  onResetNarrowing?: () => void;
  onSeeAll: (target: FlyTarget) => void;
};

// Wider than the tight zoom=18 used when flying to a single selected
// property/search result — "See all" is meant to show the whole area's
// properties at once, not zoom in on one point.
const SCHOOL_SEE_ALL_ZOOM = 15;
const LOCATION_SEE_ALL_ZOOM = 16.5;

// Groups the flat property list into an Airbnb-home-feed-style shelf
// layout: one "More in {School}" shelf per school present in the data
// (matched school from the search term first, mirroring "Based on your
// Lekki search"), then one "More in {Location}" shelf per distinct area
// tag within that school (front gate, back gate, etc. — whatever's
// actually been entered against each property).
function useShelves(properties: Property[], search: string) {
  return useMemo(() => {
    const bySchool = new Map<string, Property[]>();
    for (const p of properties) {
      const key = p.school_tag?.trim();
      if (!key) continue;
      if (!bySchool.has(key)) bySchool.set(key, []);
      bySchool.get(key)!.push(p);
    }

    // Matched-school-first — reuses the exact same alias resolution the
    // search bar and the data-fetching hooks already use, so "searching
    // ESUT" and "the ESUT shelf shows first" stay consistent everywhere.
    const matchedSchool = detectSchoolFromSearch(search);

    const orderedKeys = [...bySchool.keys()].sort((a, b) => {
      const aMatches = matchedSchool?.name.toLowerCase() === a.toLowerCase();
      const bMatches = matchedSchool?.name.toLowerCase() === b.toLowerCase();
      if (aMatches) return -1;
      if (bMatches) return 1;
      return bySchool.get(b)!.length - bySchool.get(a)!.length;
    });

    return orderedKeys.map((schoolKey) => {
      const schoolProperties = bySchool.get(schoolKey)!;
      const school = schools.find(
        (s) => s.name.toLowerCase() === schoolKey.toLowerCase()
      );

      const schoolTarget: FlyTarget = school
        ? { latitude: school.lat, longitude: school.lng, zoom: SCHOOL_SEE_ALL_ZOOM }
        : {
            latitude: schoolProperties[0].latitude,
            longitude: schoolProperties[0].longitude,
            zoom: SCHOOL_SEE_ALL_ZOOM,
          };

      const byLocation = new Map<string, Property[]>();
      for (const p of schoolProperties) {
        const loc = p.location?.trim();
        if (!loc) continue;
        if (!byLocation.has(loc)) byLocation.set(loc, []);
        byLocation.get(loc)!.push(p);
      }

      const locationShelves = [...byLocation.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([locationName, locationProperties]) => ({
          title: `More in ${locationName}`,
          properties: locationProperties,
          // Same convention the search bar's own location suggestions
          // use: the first matching property's coordinates stand in for
          // that area, since areas like "Front Gate" aren't a single
          // registered point of their own.
          target: {
            latitude: locationProperties[0].latitude,
            longitude: locationProperties[0].longitude,
            zoom: LOCATION_SEE_ALL_ZOOM,
          } as FlyTarget,
        }));

      return {
        schoolKey,
        schoolShelf: {
          title: `More in ${schoolKey}`,
          properties: schoolProperties,
          target: schoolTarget,
        },
        locationShelves,
      };
    });
  }, [properties, search]);
}

export default function ListView({
  category,
  search,
  filters,
  userLocation,
  onResetNarrowing,
  onSeeAll,
}: Props) {
  const { user } = useAuth();
  const { properties, status, refetch } = useListProperties({
    category,
    search,
    filters,
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || properties.length === 0) return;

    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        properties.map(async (p) => [p.id, await isSaved(user.id, p.id)] as const)
      );
      if (cancelled) return;
      setSavedIds(new Set(results.filter(([, s]) => s).map(([id]) => id)));
    })();

    return () => {
      cancelled = true;
    };
  }, [user, properties]);

  const handleSave = async (propertyId: string) => {
    if (!user) return;
    const nowSaved = await toggleSaved(user.id, propertyId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(propertyId);
      else next.delete(propertyId);
      return next;
    });
  };

  // Nearest-first within each shelf when we have a location fix —
  // otherwise the API's own newest-first order stands.
  const sortedProperties = userLocation
    ? [...properties].sort(
        (a, b) =>
          getDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude) -
          getDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
      )
    : properties;

  const shelves = useShelves(sortedProperties, search);

  const isNarrowed =
    category !== "All" || search.trim().length > 0 || countActive(filters) > 0;

  return (
    <div className="absolute inset-0 pt-[150px] pb-10 overflow-y-auto bg-gradient-to-b from-[#fff8f7] to-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {userLocation ? "Places near you" : "Explore student housing"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {status === "success"
              ? `${sortedProperties.length} verified ${
                  sortedProperties.length === 1 ? "place" : "places"
                } to choose from`
              : "Finding the best places for you"}
          </p>
        </div>

        {status === "error" && (
          <ListEmptyState variant="error" onRetry={refetch} />
        )}

        {status === "success" && sortedProperties.length === 0 && (
          isNarrowed ? (
            <ListEmptyState
              variant="no-results"
              onReset={() => onResetNarrowing?.()}
            />
          ) : (
            <ListEmptyState variant="cold-start" />
          )
        )}

        {status === "loading" && sortedProperties.length === 0 && (
          <div className="space-y-9">
            {Array.from({ length: 2 }).map((_, shelfIndex) => (
              <div key={shelfIndex}>
                <div className="h-5 w-40 bg-gray-200 rounded mb-3 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 4 }).map((_, cardIndex) => (
                    <div key={cardIndex} className="w-[220px] shrink-0">
                      <div className="h-[220px] w-full rounded-2xl bg-gray-200 animate-pulse" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded mt-2.5 animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded mt-1.5 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {shelves.map(({ schoolKey, schoolShelf, locationShelves }) => (
          <div key={schoolKey}>
            <PropertyShelf
              title={schoolShelf.title}
              properties={schoolShelf.properties}
              savedIds={savedIds}
              onSave={handleSave}
              onSeeAll={() => onSeeAll(schoolShelf.target)}
            />

            {locationShelves.map((shelf) => (
              <PropertyShelf
                key={shelf.title}
                title={shelf.title}
                properties={shelf.properties}
                savedIds={savedIds}
                onSave={handleSave}
                onSeeAll={() => onSeeAll(shelf.target)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
