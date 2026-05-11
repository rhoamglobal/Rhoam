"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

import { schools } from "@/lib/schools";
import { detectSchoolFromSearch } from "@/lib/detectSchool";

  // ✅ school search HERE
import FlyToSchool from "./search/FlyToSchool";

import { schoolIcon } from "@/lib/mapIcons"

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

  // ✅ detect school 
  
  const detectedSchool = detectSchoolFromSearch(debouncedSearch);

  
  
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
  console.log("PROPERTIES DATA:", properties)
  

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

          
        {Array.isArray(properties) &&
        properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={priceIcon(property.price)}
            eventHandlers={{
              click: () => setSelected(property),
            }}
          />
        ))}
          
      </MapContainer>

      <SearchThisAreaButton
        visible={showSearchButton}
        onClick={applySearchArea}
      />

<PreviewCard property={selected} school={detectedSchool} />
    </div>
  );
}