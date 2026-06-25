"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FlyToProperty({
  target,
}: {
  target: {
    latitude: number;
    longitude: number;
  } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    map.flyTo(
      [target.latitude, target.longitude],
      18,
      {
        duration: 1.5,
      }
    );
  }, [target, map]);

  return null;
}