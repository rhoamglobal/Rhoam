import { useEffect, useState } from "react";
import { LatLngBounds } from "leaflet";
import { Property } from "@/components/types";

type Args = {
  bounds: LatLngBounds | null;
  category: string;
  search: string;
};

export function usePropertySearch({ bounds, category, search }: Args) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (!bounds) return;

    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    const url =
      `/api/property?` +
      `north=${north}&south=${south}&east=${east}&west=${west}` +
      `&category=${category}` +
      `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProperties(data));
  }, [bounds, category, search]);

  return properties;
}