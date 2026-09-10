"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import L, { LatLngBounds, Map as LeafletMap } from "leaflet";

import { priceIcon } from "./PriceMarker";
import CloseOnMapClick from "./CloseOnMapClick";
import PreviewCard from "./PreviewCard";

import MapAutoFit from "./MapAutoFit";
import UserLocationMarker from "./UserLocationMarker";
import type { UserLocation, LocationStatus } from "@/hooks/useUserLocation";

import { useDebounce } from "@/hooks/useDebounce";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { Property } from "./types";
import type { FlyTarget } from "./types";

import RememberMapView from "./RememberMapView";

import { Filters, emptyFilters, countActive } from "./topbar/filters/SmartFilters";
import MapEmptyState from "./MapEmptyState";
import ValuePropBanner from "./ValuePropBanner";

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
  flyTarget: FlyTarget | null;
  onResetNarrowing?: () => void;
  // Lifted to page.tsx so both MapClient and ListView share a single
  // geolocation fix instead of each prompting the browser separately.
  userLocation: UserLocation;
  locationStatus: LocationStatus;
  // Whether the map is the currently-visible view (vs. hidden behind
  // list view via display:none). Leaflet miscalculates tile layout
  // while its container has zero size, so toggling back needs an
  // explicit invalidateSize() — see the effect below.
  isActive?: boolean;
};

export default function MapClient({
  category,
  search,
  filters = emptyFilters,
  flyTarget,
  onResetNarrowing,
  userLocation,
  locationStatus,
  isActive = true,
}: Props) {
  const [selected, setSelected] = useState<Property | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const hasFlownToUser = useRef(false);


  // ✅ debounce search HERE
  const debouncedSearch = useDebounce(search, 400);


  // ✅ database filtering
  const { properties, status, refetch } = usePropertySearch({
    bounds,
    category,
    search: debouncedSearch,
    filters,
  });

  const { user } = useAuth();

  // Fly to the user's fix the moment it arrives — but only once. Repeat
  // visits or a mid-session re-fix (were we to add one later) shouldn't
  // keep yanking the map away from wherever the person has since panned.
  useEffect(() => {
    if (userLocation && !hasFlownToUser.current && mapRef.current) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 15);
      hasFlownToUser.current = true;
    }
  }, [userLocation]);

  // Fixes Leaflet rendering grey/offset tiles after its container goes
  // from display:none back to visible (e.g. switching from list view
  // back to map view) — Leaflet caches container size internally and
  // doesn't notice the change on its own.
  useEffect(() => {
    if (isActive && mapRef.current) {
      // Let the browser finish the display:none -> visible layout pass
      // first, or invalidateSize reads the still-stale (zero) size.
      const id = requestAnimationFrame(() => {
        mapRef.current?.invalidateSize();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isActive]);

  // RememberMapView should only restore the last-saved view once we know
  // geolocation has failed (denied/unavailable) — never while pending
  // (would race the flyTo above) and never once granted (flyTo already
  // owns centering at that point; restoring afterward would just yank
  // the map straight back to wherever it last was, second-guessing the
  // fresh fix we just centered on).
  const skipRestore = locationStatus !== "denied" && locationStatus !== "unavailable";

  // Used to pick which empty-state message applies (RHM-114): a search
  // that's actively narrowed down (category/search/filters) gets a
  // "widen your search" message, while a genuinely empty area (no
  // narrowing applied at all) gets a cold-start "not here yet" message.
  const isNarrowed =
    category !== "All" || debouncedSearch.trim().length > 0 || countActive(filters) > 0;

  const showEmptyState =
    status === "success" && Array.isArray(properties) && properties.length === 0;
  const showErrorState = status === "error";


  

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[6.30624, 7.53812]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        
        <CloseOnMapClick onClose={() => setSelected(null)} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyToProperty target={flyTarget} />

        <RememberMapView skipRestore={skipRestore} />
        <MapBoundsListener setBounds={setBounds} />
        

        
        <MapAutoFit properties={properties} skip={skipRestore} />

        {userLocation && (
          <UserLocationMarker
            lat={userLocation.lat}
            lng={userLocation.lng}
            accuracy={userLocation.accuracy}
          />
        )}
 
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
            properties
              // A property with a missing/malformed latitude or longitude
              // (e.g. a hastily-added test listing) throws a hard,
              // uncaught "Invalid LatLng object" error from Leaflet when
              // rendered — that crashes the entire map, not just that one
              // pin. Skip it instead; better one missing pin than a dead
              // page.
              .filter(
                (property) =>
                  Number.isFinite(property.latitude) &&
                  Number.isFinite(property.longitude)
              )
              .map((property) => (
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

      <ValuePropBanner />

      {showErrorState && <MapEmptyState variant="error" onRetry={refetch} />}

      {showEmptyState &&
        !showErrorState &&
        (isNarrowed ? (
          <MapEmptyState
            variant="narrowed-empty"
            onReset={() => onResetNarrowing?.()}
          />
        ) : (
          <MapEmptyState variant="cold-start-empty" />
        ))}

      <PreviewCard property={selected} onClose={() => setSelected(null)} />
    </div>
  );
}