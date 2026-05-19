"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { SCHOOLS } from "../schools";
import L, { LatLngBounds } from "leaflet";
import { parseSearch } from "./parseSearch";

type Props = {
  search: string;
  setCategory: (c: string) => void;
  setMaxPrice: (p: number | undefined) => void;
};

export default function FlyToSchool({
  search,
  setCategory,
  setMaxPrice,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const parsed = parseSearch(search);

    // Apply category
    if (parsed.category) setCategory(parsed.category);

    // Apply price
    if (parsed.maxPrice) setMaxPrice(parsed.maxPrice);

    // Fly to school
    if (parsed.school && SCHOOLS[parsed.school]) {
      const [lat, lng] = SCHOOLS[parsed.school];

      map.flyTo([lat, lng], 15, { duration: 1.5 });

    }
  }, [search, map, setCategory, setMaxPrice]);

  return null;
}