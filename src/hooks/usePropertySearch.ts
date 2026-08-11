import { useEffect, useState } from "react";
import { LatLngBounds } from "leaflet";
import { Property } from "@/components/map/types";
import { Filters } from "@/components/map/topbar/filters/SmartFilters";

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

    const params = new URLSearchParams({
      north: String(north),
      south: String(south),
      east: String(east),
      west: String(west),
      category,
      search,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds, category, search, filters, refetchToken]);

  const refetch = () => setRefetchToken((t) => t + 1);

  return { properties, status, refetch };
}
