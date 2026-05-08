"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { LatLngBounds } from "leaflet";

import { priceIcon } from "./PriceMarker";
import CloseOnMapClick from "./CloseOnMapClick";
import PreviewCard from "./PreviewCard";
import MapBoundsHandler from "./MapBoundsHandler";
import MapAutoFit from "./MapAutoFit";

import { useDebounce } from "@/hooks/useDebounce";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { Property } from "./types";
import { useEffect } from "react";
import SearchThisAreaButton from "./search/SearchThisAreaButton";
import RememberMapView from "./RememberMapView";

  // ✅ school search HERE
import FlyToSchool from "./search/FlyToSchool";

type Props = {
  category: string;
  search: string;
};

export default function MapClient({ category, search }: Props) {
  const [selected, setSelected] = useState<Property | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  // ✅ debounce search HERE
  const debouncedSearch = useDebounce(search, 400);

  // ✅ search now button
  const [pendingBounds, setPendingBounds] = useState<LatLngBounds | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  // ✅ parse search 
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState(category);

  // ✅ database filtering
  const properties = usePropertySearch({
    bounds,
    category,
    search: debouncedSearch,
    maxPrice,
  });

  const applySearchArea = () => {
    if (pendingBounds) {
      setBounds(pendingBounds);
      setShowSearchButton(false);
    }
  };
  

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[6.30624, 7.53812]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapBoundsHandler
          onBoundsChange={(b) => {
            setPendingBounds(b);
            setShowSearchButton(true);
          }}
        />
        <CloseOnMapClick onClose={() => setSelected(null)} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <RememberMapView />
        
        <FlyToSchool
          search={search}
          setBounds={setBounds}
          setCategory={setActiveCategory}
          setMaxPrice={setMaxPrice}
        />
        
        <MapAutoFit properties={properties} />

        <MapAutoFit properties={properties} />

        {properties.map((p) => (
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

      <SearchThisAreaButton
        visible={showSearchButton}
        onClick={applySearchArea}
      />

      <PreviewCard property={selected} />
    </div>
  );
}