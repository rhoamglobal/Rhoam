"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { LatLngBounds } from "leaflet";

import { Property } from "./types";
import { priceIcon } from "./PriceMarker";
import CloseOnMapClick from "./CloseOnMapClick";
import PreviewCard from "./PreviewCard";
import CategoryBar from "./CategoryBar";
import MapBoundsHandler from "./MapBoundsHandler";

export default function MapClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  useEffect(() => {
    fetch("/api/property")
      .then((res) => res.json())
      .then((data) => setProperties(data));
  }, []);

  // ✅ Category + Bounds filtering combined
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Category filter
      if (activeCategory !== "All" && p.category !== activeCategory) {
        return false;
      }

      // Bounds filter
      if (bounds) {
        return bounds.contains([p.latitude, p.longitude]);
      }

      return true;
    });
  }, [properties, activeCategory, bounds]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <CategoryBar active={activeCategory} setActive={setActiveCategory} />

      <MapContainer
        center={[6.4584, 7.5464]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapBoundsHandler onBoundsChange={setBounds} />
        <CloseOnMapClick onClose={() => setSelected(null)} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {filteredProperties.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={priceIcon(p.price)}
            eventHandlers={{
              click: () => setSelected(p),
            }}
          />
        ))}
      </MapContainer>

      <PreviewCard property={selected} />
    </div>
  );
}