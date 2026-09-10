"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

type Props = {
  // While a geolocation fix is pending or has just arrived, MapClient
  // takes over centering (see the flyTo-to-user effect there). Restoring
  // the saved view at the same time would race it — whichever runs last
  // wins unpredictably, producing a jump-cut between two different
  // centers on load. Callers should only restore once geolocation is
  // known to have failed/been denied/unavailable, or once it's already
  // been applied.
  skipRestore?: boolean;
};

export default function RememberMapView({ skipRestore }: Props) {
  const map = useMap();

  useEffect(() => {
    if (skipRestore) return;

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
  }, [map, skipRestore]);

  return null;
}