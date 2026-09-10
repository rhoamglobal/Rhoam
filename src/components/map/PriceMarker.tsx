"use client";

import L from "leaflet";

export function priceIcon(price: number | null | undefined) {
  const label =
    price == null || Number.isNaN(price)
      ? "Ask"
      : `₦${price.toLocaleString()}`;

  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="price-bubble">${label}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
  });
}