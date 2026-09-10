"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TopBar from "@/components/map/topbar/searchbar";
import Categories from "@/components/map/topbar/CategoryBar";
import { emptyFilters } from "@/components/map/topbar/filters/SmartFilters";
import ListView from "@/components/map/ListView";
import ViewToggle from "@/components/map/ViewToggle";
import { useUserLocation } from "@/hooks/useUserLocation";
import type { FlyTarget } from "@/components/map/types";

const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
});

const LAST_VIEW_KEY = "rhoam-last-view";

export default function Page() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(emptyFilters);

  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);

  // Defaults to map view. The saved preference (if any) is applied in
  // an effect below, after hydration — reading localStorage directly in
  // the initializer would run during client hydration and could return
  // a different value than what the server rendered, causing a
  // hydration mismatch.
  const [view, setView] = useState<"map" | "list">("map");

  useEffect(() => {
    if (localStorage.getItem(LAST_VIEW_KEY) === "list") {
      // Safe pattern, same reasoning as the documented exceptions in
      // usePropertySearch/useListProperties: this is a one-time
      // "hydrate from localStorage" read with an empty dependency
      // array — it can't cascade because there's nothing for it to
      // re-trigger.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView("list");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LAST_VIEW_KEY, view);
  }, [view]);

  // A single geolocation fix, shared by both views — asking the browser
  // for permission twice (once per view) would be a bad first
  // impression, and each view needing its own copy was also the root of
  // an unnecessary re-render chain.
  const { location: userLocation, status: locationStatus } = useUserLocation();

  const resetNarrowing = () => {
    setCategory("All");
    setSearch("");
    setFilters(emptyFilters);
  };

  // "See all" on a shelf (school or location) flies the map there and
  // switches to map view — same mechanism the search bar's own
  // suggestions already use for school/location selection.
  const handleSeeAll = (target: FlyTarget) => {
    setFlyTarget(target);
    setView("map");
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 🗺️ Map is the base layer. Kept mounted even in list view (just
          visually hidden) rather than unmounted — remounting Leaflet on
          every toggle is expensive and would also lose pan/zoom state,
          the user-location fix already obtained, etc. */}
      <div className={view === "list" ? "hidden" : "h-full w-full"}>
        <MapClient
          category={category}
          search={search}
          filters={filters}
          flyTarget={flyTarget}
          onResetNarrowing={resetNarrowing}
          userLocation={userLocation}
          locationStatus={locationStatus}
          isActive={view === "map"}
        />
      </div>

      {/* 📋 List view is its own independent browse experience — not a
          mirror of the map's current viewport. See ListView.tsx. */}
      {view === "list" && (
        <ListView
          category={category}
          search={search}
          filters={filters}
          userLocation={userLocation}
          onResetNarrowing={resetNarrowing}
          onSeeAll={handleSeeAll}
        />
      )}

      {/* In list view, the header sits over scrolling page content
          (rather than a map, which visually "ends" at its own edges) —
          without an opaque backing, shelf cards scrolling underneath
          show through the gaps around the search pill and category
          chips. This sits behind TopBar/Categories (they keep their own
          higher z-index classes) and only appears in list view; in map
          view the translucent-over-map look is unchanged. */}
      {view === "list" && (
        <div className="absolute top-0 left-0 w-full h-[150px] bg-white/90 backdrop-blur-xl border-b border-gray-100" />
      )}

      {/* 🔝 UI overlays the map. No z-index here on purpose — TopBar and
          Categories each set their own (propertyFloatingControls and
          categoryBar respectively). Giving this wrapper its own z-index
          would create a new stacking context that caps both of them at
          that value, regardless of what they declare internally — which
          is exactly what was making the search dropdown and filter panel
          render behind the map's PreviewCard (also propertyFloatingControls,
          but outside this wrapper and therefore not capped).
          Categories renders in both views now, unchanged design — list
          view no longer has its own separate category selector. The
          view toggle now lives in Categories' own fixed trailing slot
          (see CategoryBar.tsx) rather than floating at the bottom. */}
      <div className="absolute top-0 left-0 w-full">
        <TopBar
          search={search}
          setSearch={setSearch}
          setFlyTarget={setFlyTarget}
          filters={filters}
          setFilters={setFilters}
        />
        <Categories
          active={category}
          setActive={setCategory}
          trailing={<ViewToggle view={view} onChange={setView} />}
        />
      </div>
    </div>
  );
}
