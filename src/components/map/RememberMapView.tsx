"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function RememberMapView() {
  const map = useMap();

  useEffect(() => {
    const saved = localStorage.getItem("rhoam-map-view");
    if (saved) {
      const { center, zoom } = JSON.parse(saved);
      map.setView(center, zoom);
    }

    const saveView = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      localStorage.setItem(
        "rhoam-map-view",
        JSON.stringify({
          center: [center.lat, center.lng],
          zoom,
        })
      );
    };

    map.on("moveend", saveView);

    return () => {
      map.off("moveend", saveView);
    };
  }, [map]);

  return null;
}