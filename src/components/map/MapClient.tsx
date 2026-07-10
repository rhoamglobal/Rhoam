"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L, { LatLngBounds } from "leaflet";

import { priceIcon } from "./PriceMarker";
import CloseOnMapClick from "./CloseOnMapClick";
import PreviewCard from "./PreviewCard";

import MapAutoFit from "./MapAutoFit";

import { useDebounce } from "@/hooks/useDebounce";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { Property } from "./types";

import RememberMapView from "./RememberMapView";

import { detectSchoolFromSearch } from "@/lib/detectSchool";
import { Filters, emptyFilters } from "./topbar/filters/SmartFilters";

  // ✅ school search HERE

import FlyToProperty from "./search/FlyToProperty";
import { useMapEvents } from "react-leaflet";

// @for clustering
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";

// @authentication test
import { useAuth } from "@/components/providers/AuthProvider";

function MapBoundsListener({ setBounds }: { setBounds: (bounds: LatLngBounds) => void }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      setBounds(map.getBounds());
    },
  });

  return null;
}


type Props = {
  category: string;
  search: string;
  filters?: Filters;
  flyTarget: {
    latitude: number;
    longitude: number;
  } | null;
};

export default function MapClient({
  category,
  search,
  filters = emptyFilters,
  flyTarget,
}: Props) {
  const [selected, setSelected] = useState<Property | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);


  // ✅ debounce search HERE
  const debouncedSearch = useDebounce(search, 400);


  // ✅ detect school 
  
  const detectedSchool = detectSchoolFromSearch(debouncedSearch);

  
  // ✅ database filtering
  const properties = usePropertySearch({
    bounds,
    category,
    search: debouncedSearch,
    filters,
  });

  const { user } = useAuth();


  

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[6.30624, 7.53812]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        
        <CloseOnMapClick onClose={() => setSelected(null)} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyToProperty target={flyTarget} />

        <RememberMapView />
        <MapBoundsListener setBounds={setBounds} />
        

        
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


<PreviewCard property={selected} />
    </div>
  );
}