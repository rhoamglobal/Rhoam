"use client";

import { useCallback, useEffect, useState } from "react";
import { Property } from "@/components/map/types";
import { Filters } from "@/components/map/topbar/filters/SmartFilters";
import { useDebounce } from "./useDebounce";
import { detectSchoolFromSearch } from "@/lib/detectSchool";

type Args = {
  category: string;
  search: string;
  filters: Filters;
};

export type ListSearchStatus = "idle" | "loading" | "error" | "success";

// Mirrors usePropertySearch but deliberately omits map bounds — list
// view isn't "whatever's currently on screen in map view", it's its own
// independent browse of the catalogue (up to 300 active listings,
// newest first), filtered only by category/search/price/etc. The API
// route already treats bounds as optional, so no server changes needed.
export function useListProperties({ category, search, filters }: Args) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [status, setStatus] = useState<ListSearchStatus>("idle");
  const [refetchToken, setRefetchToken] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    // The API only does a literal ilike match against school_tag — no
    // notion of aliases. Searching "nsukka" should still surface UNN's
    // properties (school_tag is stored as "UNN"), so resolve any
    // matched alias to the canonical name before sending it.
    const matchedSchool = detectSchoolFromSearch(debouncedSearch);
    const effectiveSearch = matchedSchool ? matchedSchool.name : debouncedSearch;

    const params = new URLSearchParams({ category, search: effectiveSearch });

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
    // Safe pattern, unlike the refetch bug in usePropertySearch: "loading"
    // here doesn't feed back into this effect's own dependency array, so
    // it can't cause a render loop — it's a one-way "fetch started" flag.
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
  }, [category, debouncedSearch, filters, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { properties, status, refetch };
}
