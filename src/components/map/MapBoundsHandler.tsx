"use client";

import { useMap, useMapEvents } from "react-leaflet";
import { LatLngBounds } from "leaflet";

type Props = {
  onBoundsChange: (bounds: LatLngBounds) => void;
};

export default function MapBoundsHandler({ onBoundsChange }: Props) {
  const map = useMap(); // ✅ real map instance

  useMapEvents({
    moveend() {
      onBoundsChange(map.getBounds());
    },
    zoomend() {
      onBoundsChange(map.getBounds());
    },
  });

  return null;
}