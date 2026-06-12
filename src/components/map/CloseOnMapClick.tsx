"use client";

import { useMapEvents } from "react-leaflet";

export default function CloseOnMapClick({
  onClose,
}: {
  onClose: () => void;
}) {
  useMapEvents({
    click() {
      onClose();
    },
  });

  return null;
}