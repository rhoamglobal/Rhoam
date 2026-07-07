import { useEffect, useState } from "react";
import { LatLngBounds } from "leaflet";
import { Property } from "@/components/map/types";
import { parseSearch } from "@/components/map/search/parseSearch";

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

    const parsed = parseSearch(search);

    // Remove school/category/price words from free-text search
    let cleanSearch = search.toLowerCase();

    if (parsed.school) {
      cleanSearch = cleanSearch.replace(parsed.school, "");
    }

    if (parsed.category) {
      cleanSearch = cleanSearch.replace(parsed.category, "");
    }

    cleanSearch = cleanSearch
      .replace(/\d+\s?k/gi, "")
      .trim();

    let url =
      `/api/property?` +
      `north=${north}&south=${south}&east=${east}&west=${west}` +
      `&category=${category}` +
      `&search=${encodeURIComponent(cleanSearch)}`;

    if (maxPrice) {
      url += `&maxPrice=${maxPrice}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProperties(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setProperties([]);
      });
  }, [bounds, category, search, maxPrice]);

  return properties;
}