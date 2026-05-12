import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Property } from "../types";

import { LatLngBounds } from "leaflet";

interface SearchParams {
  bounds: LatLngBounds | null;
  category: string;
  search: string;
  maxPrice: number | undefined;
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
          .gte("latitude", bounds.getSouth())
          .lte("latitude", bounds.getNorth())
          .gte("longitude", bounds.getWest())
          .lte("longitude", bounds.getEast());
      }

      // ✅ Category filter
      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      // ✅ Price filter
      if (maxPrice) {
        query = query.lte("price", maxPrice);
      }

      // ✅ THIS IS THE MISSING PART — TEXT SEARCH
      if (search && search.trim() !== "") {
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