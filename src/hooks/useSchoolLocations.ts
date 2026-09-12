"use client";

import { useEffect, useState } from "react";
import { Property } from "@/components/map/types";

export type SchoolLocation = {
  name: string;
  lat: number;
  lng: number;
};

// Independent of usePropertySearch/useListProperties — this powers the
// category bar, which is visible in both map and list view and needs
// the full set of areas for a school regardless of which view is
// active or what filters happen to be applied elsewhere. Reuses the
// same /api/property endpoint (school_tag is now searchable there),
// just for a different consumer.
export function useSchoolLocations(schoolName: string | null) {
  const [locations, setLocations] = useState<SchoolLocation[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!schoolName) {
      // Safe pattern: doesn't feed back into schoolName (this effect's
      // own dependency), so it can't cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocations([]);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const params = new URLSearchParams({ category: "All", search: schoolName });

    fetch(`/api/property?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load locations");
        return res.json();
      })
      .then((data: Property[]) => {
        if (cancelled) return;

        // One representative property per distinct location name — same
        // "first match stands in for the area" convention the search
        // bar's own location suggestions and the list view shelves
        // already use.
        const seen = new Map<string, SchoolLocation>();
        for (const p of data) {
          const name = p.location?.trim();
          if (!name || seen.has(name)) continue;
          if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) continue;
          seen.set(name, { name, lat: p.latitude, lng: p.longitude });
        }

        setLocations([...seen.values()]);
        setStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setLocations([]);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [schoolName]);

  return { locations, status };
}
