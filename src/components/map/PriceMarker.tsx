"use client";

import L from "leaflet";

export const pinIcon = L.divIcon({
  className: "custom-pin-marker",
  html: `<div style="
    width: 16px;
    height: 16px;
    background: #FF5A5F;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Keep priceIcon if needed for other places, but we are using pinIcon for Rhoam look
export function priceIcon(price: number) {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="price-bubble">₦${price.toLocaleString()}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
  });
}
