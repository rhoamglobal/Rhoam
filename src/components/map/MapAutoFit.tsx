"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { Property } from "./types";

type Props = {
  properties: Property[];
};

export default function MapAutoFit({ properties }: Props) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    // 🚫 If we already auto-fitted once, never do it again
    if (hasFitted.current) return;

    if (properties.length === 0) return;

    const bounds = L.latLngBounds(
      properties.map((p) => [p.latitude, p.longitude])
    );

    map.fitBounds(bounds, { padding: [80, 80] });

    hasFitted.current = true; // ✅ lock forever
  }, [properties, map]);

  return null;
}