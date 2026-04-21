"use client";

import L from "leaflet";
import { Marker } from "react-leaflet";

export default function PriceMarker({
  lat,
  lng,
  price,
  onClick,
}: {
  lat: number;
  lng: number;
  price: number;
  onClick: () => void;
}) {

  return (
    <Marker
      position={[lat, lng]}
      icon={priceIcon}
      eventHandlers={{ click: onClick }}
    />
  );
}