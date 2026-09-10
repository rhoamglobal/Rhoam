"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { FlyTarget } from "../types";

export default function FlyToProperty({
  target,
}: {
  target: FlyTarget | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    map.flyTo(
      [target.latitude, target.longitude],
      target.zoom ?? 18,
      {
        duration: 1.5,
      }
    );
  }, [target, map]);

  return null;
}