"use client";

import { Circle, Marker } from "react-leaflet";
import L from "leaflet";

type Props = {
  lat: number;
  lng: number;
  accuracy: number;
};

// A teardrop pin (not a plain dot) in the brand coral, with a soft
// pulsing halo at its base — deliberately shaped differently from
// priceIcon's pill bubbles and the cluster circles (also coral) so it
// still reads unmistakably as "you", not a listing, even sharing the
// same color family.
const userPinIcon = L.divIcon({
  className: "user-location-pin",
  html: `
    <div class="user-location-pin-wrap">
      <div class="user-location-pin-pulse"></div>
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z"
          fill="#ff5a5f"
          stroke="white"
          stroke-width="2"
        />
        <circle cx="15" cy="15" r="5.5" fill="white" />
      </svg>
    </div>
  `,
  iconSize: [30, 40],
  // Bottom tip of the pin (where it "points") sits on the actual
  // coordinate, matching how map pins conventionally anchor.
  iconAnchor: [15, 40],
});

export default function UserLocationMarker({ lat, lng, accuracy }: Props) {
  return (
    <>
      {/* Accuracy circle — sets honest expectations since a mobile GPS
          fix without enableHighAccuracy can easily be 50-100m off. */}
      <Circle
        center={[lat, lng]}
        radius={accuracy}
        pathOptions={{
          color: "#ff5a5f",
          fillColor: "#ff5a5f",
          fillOpacity: 0.08,
          weight: 1,
        }}
        interactive={false}
      />
      <Marker
        position={[lat, lng]}
        icon={userPinIcon}
        interactive={false}
        zIndexOffset={1000}
      />
    </>
  );
}
