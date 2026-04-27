"use client";

import L from "leaflet";

export function priceIcon(price: number) {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="price-bubble">₦${price.toLocaleString()}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
  });
}