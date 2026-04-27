// components/map.tsx

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./map/MapClient"), {
  ssr: false, // ⛔ stops server from loading Leaflet
});

export default function Map() {
  return <MapClient />;
}