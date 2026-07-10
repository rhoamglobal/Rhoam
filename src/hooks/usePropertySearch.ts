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

export function usePropertySearch({
  bounds,
  category,
  search,
  filters,
}: Args) {
  const [properties, setProperties] = useState<Property[]>([]);

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

    fetch(`/api/property?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProperties(data);
      });

    return () => {
      cancelled = true;
    };
  }, [bounds, category, search, filters]);

  return properties;
}
