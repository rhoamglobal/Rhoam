"use client";

import { Circle, CircleMarker } from "react-leaflet";

type Props = {
  lat: number;
  lng: number;
  accuracy: number;
};

// Deliberately visually distinct from priceIcon (coral price bubbles) and
// the cluster bubbles (also coral) so nobody mistakes "where I am" for a
// listing — blue is the de facto convention (Google Maps, Airbnb, Uber).
export default function UserLocationMarker({ lat, lng, accuracy }: Props) {
  return (
    <>
      {/* Accuracy circle — sets honest expectations since a mobile GPS
          fix without enableHighAccuracy can easily be 50-100m off. */}
      <Circle
        center={[lat, lng]}
        radius={accuracy}
        pathOptions={{
          color: "#4285F4",
          fillColor: "#4285F4",
          fillOpacity: 0.08,
          weight: 1,
        }}
        interactive={false}
      />
      <CircleMarker
        center={[lat, lng]}
        radius={8}
        pathOptions={{
          color: "white",
          fillColor: "#4285F4",
          fillOpacity: 1,
          weight: 3,
        }}
        className="user-location-pulse"
        interactive={false}
      />
    </>
  );
}
