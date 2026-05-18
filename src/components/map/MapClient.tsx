"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useMemo } from "react";
import { LatLngBounds } from "leaflet";
import L from "leaflet";

import { pinIcon } from "./PriceMarker";
import CloseOnMapClick from "./CloseOnMapClick";
import PreviewCard from "./PreviewCard";
import MapBoundsHandler from "./MapBoundsHandler";
import MapAutoFit from "./MapAutoFit";

import { usePropertySearch } from "@/hooks/usePropertySearch";
import { Property } from "./types";
import SearchThisAreaButton from "./search/SearchThisAreaButton";
import RememberMapView from "./RememberMapView";

// @for clustering
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";

const DUMMY_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Luxury Student Studio",
    price: 1500000,
    latitude: 6.30624,
    longitude: 7.53812,
    category: "Apartments",
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Cozy Campus Flat",
    price: 800000,
    latitude: 6.31024,
    longitude: 7.54212,
    category: "Student Apartments",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
  }
];

const schoolIcon = L.divIcon({
  className: "school-marker",
  html: `<div style="
    width: 24px;
    height: 24px;
    background: white;
    border: 3px solid #FF5A5F;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  ">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5A5F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MapClient() {
  const [selected, setSelected] = useState<Property | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  // ✅ search now button
  const [pendingBounds, setPendingBounds] = useState<LatLngBounds | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  // ✅ database filtering
  const hookProperties = usePropertySearch({
    bounds,
  });

  const properties = useMemo(() => {
    return hookProperties && hookProperties.length > 0 ? hookProperties : DUMMY_PROPERTIES;
  }, [hookProperties]);

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
        zoom={14}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <MapBoundsHandler
          onBoundsChange={(b) => {
            setPendingBounds(b);
            setShowSearchButton(true);
          }}
        />
        <CloseOnMapClick onClose={() => setSelected(null)} />

        <TileLayer url="https://{s}.tile.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <RememberMapView />
        
        <MapAutoFit properties={properties} />

        {/* School Marker */}
        <Marker position={[6.30624, 7.53012]} icon={schoolIcon} />
          
        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
        
            return L.divIcon({
              html: `
                <div style="
                  background: #FF5A5F;
                  color: white;
                  border-radius: 9999px;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                  font-size: 14px;
                  border: 3px solid white;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                ">
                  ${count}
                </div>
              `,
              className: "custom-cluster",
              iconSize: L.point(40, 40),
            });
          }}
        >
          {Array.isArray(properties) &&
            properties.map((property) => (
              <Marker
                key={property.id}
                position={[property.latitude, property.longitude]}
                icon={pinIcon}
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

      <PreviewCard property={selected} />
    </div>
  );
}
