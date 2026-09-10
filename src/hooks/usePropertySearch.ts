import { useCallback, useEffect, useState } from "react";
import { LatLngBounds } from "leaflet";
import { Property } from "@/components/map/types";
import { Filters } from "@/components/map/topbar/filters/SmartFilters";
import { detectSchoolFromSearch } from "@/lib/detectSchool";

type Args = {
  bounds: LatLngBounds | null;
  category: string;
  search: string;
  filters: Filters;
};

export type PropertySearchStatus = "idle" | "loading" | "error" | "success";

export function usePropertySearch({
  bounds,
  category,
  search,
  filters,
}: Args) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [status, setStatus] = useState<PropertySearchStatus>("idle");
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!bounds) return;

    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    // The API only does a literal ilike match against school_tag — it
    // has no notion of aliases. Searching "nsukka" should still surface
    // UNN's properties (school_tag is stored as "UNN"), so resolve any
    // matched alias to the canonical name before sending it. A literal
    // "ESUT" search still matches school_tag directly either way.
    const matchedSchool = detectSchoolFromSearch(search);
    const effectiveSearch = matchedSchool ? matchedSchool.name : search;

    const params = new URLSearchParams({
      north: String(north),
      south: String(south),
      east: String(east),
      west: String(west),
      category,
      search: effectiveSearch,
    });

    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.rooms && filters.rooms !== "Any") {
      params.set("rooms", filters.rooms);
    }
    if (filters.availableOnly) params.set("availableOnly", "true");
    if (filters.amenities?.length) {
      params.set("amenities", filters.amenities.join(","));
    }

    let cancelled = false;
    // Safe pattern, unlike the refetch bug above: "loading" here doesn't
    // feed back into this effect's own dependency array, so it can't
    // cause a render loop — it's a one-way "fetch started" flag.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");

    fetch(`/api/property?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Property search failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setProperties(data);
        setStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setProperties([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [bounds, category, search, filters, refetchToken]);

  // Stable reference — MapClient's own MapEmptyState "Retry" button calls
  // this directly. Keeping it memoized (rather than a fresh closure each
  // render) is just good hygiene; see useListProperties for the version
  // of this bug that actually caused a render loop when an unmemoized
  // refetch was forwarded up through a parent effect.
  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { properties, status, refetch };
}
