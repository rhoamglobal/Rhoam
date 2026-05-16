import { useEffect, useState } from "react";
import { LatLngBounds } from "leaflet";
import { Property } from "@/components/map/types";

type Args = {
  bounds: LatLngBounds | null;
  category: string;
  search: string;
  maxPrice?: number;
};

export function usePropertySearch({
  bounds,
  category,
  search,
  maxPrice,
}: Args) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (!bounds) return;

    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

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
  }, [bounds, category, search, maxPrice]);

  return properties;
}