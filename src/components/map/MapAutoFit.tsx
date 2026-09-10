"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { Property } from "./types";

type Props = {
  properties: Property[];
  // When true, skip fitting bounds to properties. Used while a
  // geolocation fix is pending or has just centered the map on the
  // user — fitting to properties right after would immediately
  // second-guess that centering.
  skip?: boolean;
};

export default function MapAutoFit({ properties, skip }: Props) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (skip) return;

    // 🚫 If we already auto-fitted once, never do it again
    if (hasFitted.current) return;

    if (!Array.isArray(properties) || properties.length === 0) {
      return;
    }


    const bounds = L.latLngBounds(
      properties.map((p) => [p.latitude, p.longitude])
    );

    map.fitBounds(bounds, { padding: [80, 80] });

    hasFitted.current = true; // ✅ lock forever
  }, [properties, map, skip]);

  return null;
}