"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import TopBar from "@/components/map/topbar/searchbar";
import Categories from "@/components/map/topbar/CategoryBar";

const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
});

export default function Page() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [flyTarget, setFlyTarget] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 🗺️ Map is the base layer */}
      <MapClient
        category={category}
        search={search}
        flyTarget={flyTarget}
      />

      {/* 🔝 UI overlays the map */}
      <div className="absolute top-0 left-0 w-full z-[1000]">
        <TopBar search={search}
          setSearch={setSearch}
          setFlyTarget={setFlyTarget}
        />
        <Categories 
          active={category} 
          setActive={setCategory} />
      </div>
    </div>
  );
}