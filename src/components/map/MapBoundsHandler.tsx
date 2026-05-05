"use client";

import { useMapEvents } from "react-leaflet";
import { LatLngBounds } from "leaflet";

type Props = {
  onBoundsChange: (bounds: LatLngBounds) => void;
};

export default function MapBoundsHandler({ onBoundsChange }: Props) {
  useMapEvents({
    moveend(e) {
      const map = e.target;
      onBoundsChange(map.getBounds());
    },
    zoomend(e) {
      const map = e.target;
      onBoundsChange(map.getBounds());
    },
  });

  return null;
}