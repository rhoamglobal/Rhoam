"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import PropertyPreview from "./PropertyPreview";

type Property = {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
};

export default function MapClient({ category }: any) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    async function loadProperties() {
      const res = await fetch(`/api/properties?category=${category}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        console.error("API did not return array:", data);
      }
    }

    loadProperties();
  }, [category]);

  const priceIcon = (price: number) =>
    L.divIcon({
      className: "",
      html: `<div class="price-bubble">₦${price.toLocaleString()}</div>`,
      iconSize: [0, 0],
    });

  return (
    <>
      <MapContainer
        center={[9.082, 8.6753]}
        zoom={6}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {properties.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={priceIcon(p.price)}
            eventHandlers={{
              click: () => setSelectedProperty(p),
            }}
          />
        ))}
      </MapContainer>

      {/* FLOATING PREVIEW (outside map) */}
      <PropertyPreview
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </>
  );
}