"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
});

export default function Page() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 🗺️ Map is the base layer */}
      <MapClient />
    </div>
  );
}
