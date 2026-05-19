import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Property } from "../types";
import { LatLngBounds } from "leaflet";
import { parseSearch } from "./parseSearch";

interface SearchParams {
  bounds: LatLngBounds | null;
  category: string;
  search: string;
  maxPrice: number;
}

export function usePropertySearch({
  bounds,
  category,
  search,
  maxPrice,
}: SearchParams) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      let query = supabase.from("properties").select("*");

      // ✅ Map bounds filter
      if (bounds) {
        query = query
          .gte("lat", bounds.getSouth())
          .lte("lat", bounds.getNorth())
          .gte("lng", bounds.getWest())
          .lte("lng", bounds.getEast());
      }

      // ✅ Category filter
      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      // ✅ Price filter
      if (maxPrice) {
        query = query.lte("price", maxPrice);
      }

      const parsed = parseSearch(search);

      // Only do text search if it's NOT a school search
      if (search && search.trim() !== "" && !parsed.school) {
        query = query.or(
          `title.ilike.%${search}%,location.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (!error && data) {
        setProperties(data);
      }
    };

    fetchProperties();
  }, [bounds, category, search, maxPrice]);

  return properties;
}