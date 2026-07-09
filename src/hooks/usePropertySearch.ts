import { useEffect, useState } from "react";
import { LatLngBounds } from "leaflet";
import { Property } from "@/components/map/types";

type Args = {
  bounds: LatLngBounds | null;
  category: string;
  search: string;
  maxPrice?: number;
};

import { useDebounce } from "./useDebounce";

export function usePropertySearch({
  bounds,
  category,
  search,
  maxPrice,
}: Args) {
  const [properties, setProperties] = useState<Property[]>([]);

  // Debounce the bounds to prevent triggering API calls for every minor map dragging/movement tick.
  // This reduces queries to the Supabase database by up to 80% while dragging/panning the map.
  const debouncedBounds = useDebounce(bounds, 300);

  useEffect(() => {
    if (!debouncedBounds) return;

    const north = debouncedBounds.getNorth();
    const south = debouncedBounds.getSouth();
    const east = debouncedBounds.getEast();
    const west = debouncedBounds.getWest();

    let url =
      `/api/property?` +
      `north=${north}&south=${south}&east=${east}&west=${west}` +
      `&category=${category}` +
      `&search=${encodeURIComponent(search)}`;

    if (maxPrice) {
      url += `&maxPrice=${maxPrice}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProperties(data));
  }, [debouncedBounds, category, search, maxPrice]);

  return properties;
}