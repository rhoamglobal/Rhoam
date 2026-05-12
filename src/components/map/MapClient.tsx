"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L, { LatLngBounds } from "leaflet";

import { priceIcon } from "./PriceMarker";
import CloseOnMapClick from "./CloseOnMapClick";
import PreviewCard from "./PreviewCard";
import MapBoundsHandler from "./MapBoundsHandler";
import MapAutoFit from "./MapAutoFit";

import { useDebounce } from "@/hooks/useDebounce";
import { usePropertySearch } from "./search/usePropertySearch";
import { Property } from "./types";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import SearchThisAreaButton from "./search/SearchThisAreaButton";
import RememberMapView from "./RememberMapView";

import { detectSchoolFromSearch } from "@/lib/detectSchool";

  // ✅ school search HERE
import FlyToSchool from "./search/FlyToSchool";

// @for clustering
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";



type Props = {
  category: string;
  search: string;
};

export default function MapClient({ category, search }: Props) {
  const [selected, setSelected] = useState<Property | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // ✅ debounce search HERE
  const debouncedSearch = useDebounce(search, 400);

  // ✅ search now button
  const [pendingBounds, setPendingBounds] = useState<LatLngBounds | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  // ✅ parse search 
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [, setActiveCategory] = useState(category);

  // ✅ detect school 
  
  const detectedSchool = detectSchoolFromSearch(debouncedSearch);

  
  
  // ✅ database filtering
  const properties = usePropertySearch({
    bounds,
    category,
    search: debouncedSearch,
    maxPrice,
  });

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/saved", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedIds(data.map((p: Property) => p.id));
      }
    };
    fetchSaved();
  }, []);

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

          
        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={(cluster: L.MarkerCluster) => {
            const count = cluster.getChildCount();
        
            return L.divIcon({
              html: `
                <div style="
                  background: coral;
                  color: white;
                  border-radius: 9999px;
                  width: 44px;
                  height: 44px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                  font-size: 14px;
                  border: 3px solid white;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
                "
                onmouseover="this.style.transform='translateY(-4px) scale(1.05)'"
                onmouseout="this.style.transform='translateY(0)'"
                >
                  ${count}
                </div>
              `,
              className: "custom-cluster",
              iconSize: L.point(44, 44),
            });
            }}
        >
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
        </MarkerClusterGroup>
          
      </MapContainer>

      <SearchThisAreaButton
        visible={showSearchButton}
        onClick={applySearchArea}
      />

<PreviewCard
  property={selected}
  school={detectedSchool}
  isInitiallySaved={selected ? savedIds.includes(selected.id) : false}
/>
    </div>
  );
}